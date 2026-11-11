package com.cancha.agenda;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.cancha.auth.security.JwtService;
import com.jayway.jsonpath.JsonPath;
import java.nio.charset.StandardCharsets;
import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

/**
 * GET /atividades/proximas: as entregas ainda não concluídas de todas as disciplinas do aluno, da
 * mais urgente para a menos urgente, no máximo 5.
 *
 * <p>O resultado esperado é calculado direto no banco, então os testes continuam valendo quando
 * os dados de exemplo mudarem.
 */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class ProximasEntregasIntegracaoTest {

  private static final String URL = "/atividades/proximas";
  private static final int LIMITE = 5;

  @Autowired private MockMvc mockMvc;
  @Autowired private JdbcTemplate jdbc;
  @Autowired private JwtService jwtService;

  @Test
  void devolveAsCincoNaoConcluidasMaisUrgentesEmOrdemDePrazo() throws Exception {
    Long aluno1 = idDoAluno("aluno1@cancha.test");

    List<Long> ids = idsDaResposta(proximasDe(aluno1));

    assertThat(ids).hasSize(LIMITE).containsExactlyElementsOf(esperadasPeloBanco(aluno1));
  }

  @Test
  void cadaAlunoRecebeAsProximasEntregasDeleConformeASituacaoDele() throws Exception {
    Long aluno1 = idDoAluno("aluno1@cancha.test");
    Long aluno2 = idDoAluno("aluno2@cancha.test");

    List<Long> doAluno1 = idsDaResposta(proximasDe(aluno1));
    List<Long> doAluno2 = idsDaResposta(proximasDe(aluno2));

    assertThat(doAluno2).containsExactlyElementsOf(esperadasPeloBanco(aluno2));
    assertThat(doAluno2).isNotEqualTo(doAluno1);
  }

  @Test
  void entregaConcluidaSaiDaLista() throws Exception {
    Long aluno1 = idDoAluno("aluno1@cancha.test");
    Long maisUrgente = idsDaResposta(proximasDe(aluno1)).get(0);

    concluir(aluno1, maisUrgente);

    List<Long> depois = idsDaResposta(proximasDe(aluno1));
    assertThat(depois).doesNotContain(maisUrgente);
    assertThat(depois).containsExactlyElementsOf(esperadasPeloBanco(aluno1));
  }

  @Test
  void soTrazEntregasDasDisciplinasEmQueOAlunoEstaMatriculado() throws Exception {
    Long aluno1 = idDoAluno("aluno1@cancha.test");
    Long compiladores = idDaDisciplina("Compiladores");
    jdbc.update(
        "delete from matricula where aluno_id = ? and disciplina_id <> ?", aluno1, compiladores);

    String corpo = proximasDe(aluno1);

    List<Number> disciplinas = JsonPath.read(corpo, "$[*].disciplinaId");
    assertThat(disciplinas)
        .isNotEmpty()
        .allSatisfy(id -> assertThat(id.longValue()).isEqualTo(compiladores));
    assertThat(idsDaResposta(corpo)).containsExactlyElementsOf(esperadasPeloBanco(aluno1));
  }

  @Test
  void alunoSemMatriculaRecebeListaVazia() throws Exception {
    Long aluno1 = idDoAluno("aluno1@cancha.test");
    jdbc.update("delete from matricula where aluno_id = ?", aluno1);

    mockMvc
        .perform(get(URL).header("Authorization", "Bearer " + jwtService.emitir(aluno1)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.length()").value(0));
  }

  @Test
  void entregaVencidaENaoConcluidaVemPrimeiroEMarcadaComoAtrasada() throws Exception {
    Long aluno1 = idDoAluno("aluno1@cancha.test");
    Long compiladores = idDaDisciplina("Compiladores");
    jdbc.update(
        "insert into entrega (disciplina_id, titulo, tipo, prazo) values (?, ?, ?, ?)",
        compiladores,
        "Lista esquecida",
        "Lista",
        Timestamp.valueOf(LocalDateTime.of(2000, 1, 1, 23, 59)));

    mockMvc
        .perform(get(URL).header("Authorization", "Bearer " + jwtService.emitir(aluno1)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$[0].titulo").value("Lista esquecida"))
        .andExpect(jsonPath("$[0].tipo").value("Lista"))
        .andExpect(jsonPath("$[0].status").value("A_FAZER"))
        .andExpect(jsonPath("$[0].disciplinaId").value(compiladores))
        .andExpect(jsonPath("$[0].disciplinaNome").value("Compiladores"))
        .andExpect(jsonPath("$[0].prazo").exists())
        .andExpect(jsonPath("$[0].atrasada").value(true));
  }

  @Test
  void soAsEntregasComPrazoVencidoSaoMarcadasComoAtrasadas() throws Exception {
    Long aluno1 = idDoAluno("aluno1@cancha.test");
    LocalDateTime agora = LocalDateTime.now();

    List<Map<String, Object>> itens = JsonPath.read(proximasDe(aluno1), "$");

    assertThat(itens)
        .isNotEmpty()
        .allSatisfy(
            item ->
                assertThat(item.get("atrasada"))
                    .isEqualTo(LocalDateTime.parse((String) item.get("prazo")).isBefore(agora)));
  }

  @Test
  void semTokenRecebe401() throws Exception {
    mockMvc.perform(get(URL)).andExpect(status().isUnauthorized());
  }

  @Test
  void endpointApareceNaDocumentacaoOpenApi() throws Exception {
    mockMvc
        .perform(get("/v3/api-docs"))
        .andExpect(status().isOk())
        .andExpect(
            jsonPath("$.paths['/atividades/proximas'].get.summary")
                .value("Lista as próximas entregas do aluno"));
  }

  private String proximasDe(Long alunoId) throws Exception {
    return mockMvc
        .perform(get(URL).header("Authorization", "Bearer " + jwtService.emitir(alunoId)))
        .andExpect(status().isOk())
        .andReturn()
        .getResponse()
        .getContentAsString(StandardCharsets.UTF_8);
  }

  private static List<Long> idsDaResposta(String corpo) {
    List<Number> ids = JsonPath.read(corpo, "$[*].id");
    return ids.stream().map(Number::longValue).toList();
  }

  // Mesma regra do endpoint, escrita em SQL: entregas das disciplinas do aluno que ele não
  // concluiu, por prazo (e por id no empate), as 5 primeiras.
  private List<Long> esperadasPeloBanco(Long alunoId) {
    return jdbc.queryForList(
        "select e.id from entrega e"
            + " join matricula m on m.disciplina_id = e.disciplina_id and m.aluno_id = ?"
            + " where not exists (select 1 from progresso_atividade p"
            + "   where p.entrega_id = e.id and p.aluno_id = ? and p.status = 'CONCLUIDA')"
            + " order by e.prazo, e.id fetch first " + LIMITE + " rows only",
        Long.class,
        alunoId,
        alunoId);
  }

  private void concluir(Long alunoId, Long entregaId) {
    int alteradas =
        jdbc.update(
            "update progresso_atividade set status = 'CONCLUIDA', data_conclusao = localtimestamp"
                + " where aluno_id = ? and entrega_id = ?",
            alunoId,
            entregaId);
    if (alteradas == 0) {
      jdbc.update(
          "insert into progresso_atividade (aluno_id, entrega_id, status, data_conclusao)"
              + " values (?, ?, 'CONCLUIDA', localtimestamp)",
          alunoId,
          entregaId);
    }
  }

  private Long idDoAluno(String email) {
    return jdbc.queryForObject("select id from usuario where email = ?", Long.class, email);
  }

  private Long idDaDisciplina(String nome) {
    return jdbc.queryForObject("select id from disciplina where nome = ?", Long.class, nome);
  }
}
