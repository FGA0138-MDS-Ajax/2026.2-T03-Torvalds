package com.cancha.agenda;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.cancha.auth.security.JwtService;
import com.jayway.jsonpath.JsonPath;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class AgendaIntegracaoTest {

  private static final String URL = "/agenda";

  @Autowired private MockMvc mockMvc;
  @Autowired private JdbcTemplate jdbc;
  @Autowired private JwtService jwtService;

  @Test
  void retornaAgendaComOsTresGruposEInformacoesDasEntregas() throws Exception {
    Long alunoId = idDoAluno("aluno1@cancha.test");

    mockMvc
        .perform(get(URL).header("Authorization", "Bearer " + jwtService.emitir(alunoId)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.A_FAZER[0].titulo").exists())
        .andExpect(jsonPath("$.A_FAZER[0].disciplina").exists())
        .andExpect(jsonPath("$.A_FAZER[0].tipo").exists())
        .andExpect(jsonPath("$.A_FAZER[0].prazo").exists())
        .andExpect(jsonPath("$.A_FAZER[0].situacao").value("A_FAZER"))
        .andExpect(jsonPath("$.EM_ANDAMENTO[0].situacao").value("EM_ANDAMENTO"))
        .andExpect(jsonPath("$.CONCLUIDA[0].situacao").value("CONCLUIDA"));
  }

  @Test
  void retornaSomenteDisciplinasMatriculadasEStatusDoAlunoAutenticado() throws Exception {
    Long aluno1 = idDoAluno("aluno1@cancha.test");
    Long aluno2 = idDoAluno("aluno2@cancha.test");
    Long compiladoresId = idDaDisciplina("Compiladores");

    jdbc.update(
        "delete from matricula where aluno_id = ? and disciplina_id <> ?",
        aluno1,
        compiladoresId);

    String agendaAluno1 = agendaDe(aluno1);
    String agendaAluno2 = agendaDe(aluno2);

    List<Map<String, Object>> entregasAluno1 = entregasDaAgenda(agendaAluno1);
    assertThat(entregasAluno1).isNotEmpty();
    assertThat(entregasAluno1)
        .allSatisfy(
            entrega -> assertThat(entrega.get("disciplina")).isEqualTo("Compiladores"));

    String titulo = "Trabalho: analisador sintático";

    List<String> emAndamentoAluno1 =
        JsonPath.read(agendaAluno1, "$.EM_ANDAMENTO[*].titulo");
    List<String> aFazerAluno2 =
        JsonPath.read(agendaAluno2, "$.A_FAZER[*].titulo");

    assertThat(emAndamentoAluno1).contains(titulo);
    assertThat(aFazerAluno2).contains(titulo);
  }

  private String agendaDe(Long alunoId) throws Exception {
    return mockMvc
        .perform(get(URL).header("Authorization", "Bearer " + jwtService.emitir(alunoId)))
        .andExpect(status().isOk())
        .andReturn()
        .getResponse()
        .getContentAsString(StandardCharsets.UTF_8);
  }

  private static List<Map<String, Object>> entregasDaAgenda(String corpo) {
    List<Map<String, Object>> entregas = new ArrayList<>();
    entregas.addAll(JsonPath.read(corpo, "$.A_FAZER"));
    entregas.addAll(JsonPath.read(corpo, "$.EM_ANDAMENTO"));
    entregas.addAll(JsonPath.read(corpo, "$.CONCLUIDA"));
    return entregas;
  }

  private Long idDoAluno(String email) {
    return jdbc.queryForObject("select id from usuario where email = ?", Long.class, email);
  }

  private Long idDaDisciplina(String nome) {
    return jdbc.queryForObject("select id from disciplina where nome = ?", Long.class, nome);
  }
}