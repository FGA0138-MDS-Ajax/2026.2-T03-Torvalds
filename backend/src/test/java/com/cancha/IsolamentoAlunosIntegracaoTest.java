package com.cancha;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.hamcrest.Matchers.not;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.cancha.auth.security.JwtService;
import java.sql.Timestamp;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

/** Verifica o isolamento entre alunos usando uma disciplina com matrícula exclusiva. */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class IsolamentoAlunosIntegracaoTest {

  private static final String NOME_DISCIPLINA = "Disciplina exclusiva - isolamento 73";
  private static final String TITULO_ENTREGA = "Entrega exclusiva - isolamento 73";

  @Autowired private MockMvc mockMvc;
  @Autowired private JdbcTemplate jdbc;
  @Autowired private JwtService jwtService;

  private Long aluno1;
  private Long aluno2;
  private Long disciplinaId;
  private Long entregaId;
  private String tokenAluno1;
  private String tokenAluno2;

  @BeforeEach
  void prepararDisciplinaExclusiva() {
    aluno1 = idDoAluno("aluno1@cancha.test");
    aluno2 = idDoAluno("aluno2@cancha.test");
    tokenAluno1 = jwtService.emitir(aluno1);
    tokenAluno2 = jwtService.emitir(aluno2);

    jdbc.update(
        "insert into disciplina (nome, periodo_letivo) values (?, ?)",
        NOME_DISCIPLINA,
        "2026.2");

    disciplinaId =
        jdbc.queryForObject(
            "select id from disciplina where nome = ?", Long.class, NOME_DISCIPLINA);

    jdbc.update(
        "insert into matricula (aluno_id, disciplina_id, data_matricula)"
            + " values (?, ?, current_date)",
        aluno1,
        disciplinaId);

    jdbc.update(
        "insert into entrega (disciplina_id, titulo, tipo, prazo) values (?, ?, ?, ?)",
        disciplinaId,
        TITULO_ENTREGA,
        "Trabalho",
        Timestamp.valueOf("2000-01-01 12:00:00"));

    entregaId =
        jdbc.queryForObject(
            "select id from entrega where disciplina_id = ?",
            Long.class,
            disciplinaId);
  }

  @Test
  void disciplinasIncluemAExclusivaSomenteParaAlunoMatriculado() throws Exception {
    mockMvc
        .perform(get("/disciplinas").header("Authorization", "Bearer " + tokenAluno1))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$[*].nome", hasItem(NOME_DISCIPLINA)));

    mockMvc
        .perform(get("/disciplinas").header("Authorization", "Bearer " + tokenAluno2))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$[*].nome", not(hasItem(NOME_DISCIPLINA))));
  }

  @Test
  void atividadesDaDisciplinaExclusivaSaoNegadasAoOutroAluno() throws Exception {
    mockMvc
        .perform(
            get("/disciplinas/{id}/atividades", disciplinaId)
                .header("Authorization", "Bearer " + tokenAluno1))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$[*].titulo", hasItem(TITULO_ENTREGA)));

    mockMvc
        .perform(
            get("/disciplinas/{id}/atividades", disciplinaId)
                .header("Authorization", "Bearer " + tokenAluno2))
        .andExpect(status().isForbidden());
  }

  @Test
  void materiaisDaDisciplinaExclusivaSaoNegadosAoOutroAluno() throws Exception {
    mockMvc
        .perform(
            get("/disciplinas/{id}/conteudos", disciplinaId)
                .header("Authorization", "Bearer " + tokenAluno1))
        .andExpect(status().isOk());

    mockMvc
        .perform(
            get("/disciplinas/{id}/conteudos", disciplinaId)
                .header("Authorization", "Bearer " + tokenAluno2))
        .andExpect(status().isForbidden());
  }

  @Test
    void outroAlunoNaoConsegueConcluirEntregaExclusiva() throws Exception {
    mockMvc
        .perform(
            patch("/atividades/{id}/status", entregaId)
                .header("Authorization", "Bearer " + tokenAluno2)
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {"status":"CONCLUIDA"}
                    """))
        .andExpect(status().isForbidden());

    assertThat(
            jdbc.queryForObject(
                "select count(*) from progresso_atividade where entrega_id = ?",
                Long.class,
                entregaId))
        .isZero();
    }

  @Test
  void outroAlunoNaoConsegueDesfazerConclusaoDaEntregaExclusiva() throws Exception {
    Timestamp dataOriginal = Timestamp.valueOf("2000-01-02 12:00:00");

    jdbc.update(
        "insert into progresso_atividade"
            + " (aluno_id, entrega_id, status, data_conclusao)"
            + " values (?, ?, 'CONCLUIDA', ?)",
        aluno1,
        entregaId,
        dataOriginal);

    mockMvc
        .perform(
            patch("/atividades/{id}/status", entregaId)
                .header("Authorization", "Bearer " + tokenAluno2)
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {"status":"A_FAZER"}
                    """))
        .andExpect(status().isForbidden());

    assertThat(
            jdbc.queryForObject(
                "select status from progresso_atividade"
                    + " where aluno_id = ? and entrega_id = ?",
                String.class,
                aluno1,
                entregaId))
        .isEqualTo("CONCLUIDA");

    assertThat(
            jdbc.queryForObject(
                "select data_conclusao from progresso_atividade"
                    + " where aluno_id = ? and entrega_id = ?",
                Timestamp.class,
                aluno1,
                entregaId))
        .isEqualTo(dataOriginal);

    assertThat(
            jdbc.queryForObject(
                "select count(*) from progresso_atividade"
                    + " where aluno_id = ? and entrega_id = ?",
                Long.class,
                aluno2,
                entregaId))
        .isZero();
  }

  private Long idDoAluno(String email) {
    return jdbc.queryForObject(
        "select id from usuario where email = ?", Long.class, email);
  }

  @Test
    void proximasEntregasNaoIncluemEntregaExclusivaDeOutroAluno() throws Exception {
    // Isola as matrículas para a entrega de teste não ficar fora do limite de 5.
    jdbc.update("delete from matricula where aluno_id = ?", aluno2);

    jdbc.update(
        "delete from matricula where aluno_id = ? and disciplina_id <> ?",
        aluno1,
        disciplinaId);

    mockMvc
        .perform(
            get("/atividades/proximas")
                .header("Authorization", "Bearer " + tokenAluno1))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$[*].titulo", hasItem(TITULO_ENTREGA)));

    mockMvc
        .perform(
            get("/atividades/proximas")
                .header("Authorization", "Bearer " + tokenAluno2))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    void agendaNaoIncluiEntregaExclusivaDeOutroAluno() throws Exception {
    mockMvc
        .perform(
            get("/agenda")
                .header("Authorization", "Bearer " + tokenAluno1))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.A_FAZER[*].titulo", hasItem(TITULO_ENTREGA)));

    mockMvc
        .perform(
            get("/agenda")
                .header("Authorization", "Bearer " + tokenAluno2))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.A_FAZER[*].titulo", not(hasItem(TITULO_ENTREGA))))
        .andExpect(jsonPath("$.EM_ANDAMENTO[*].titulo", not(hasItem(TITULO_ENTREGA))))
        .andExpect(jsonPath("$.CONCLUIDA[*].titulo", not(hasItem(TITULO_ENTREGA))));
    }

    @Test
    void progressoDoSemestreConsideraSomenteConclusoesDoAlunoAutenticado()
        throws Exception {
    jdbc.update(
        "delete from matricula where aluno_id in (?, ?) and disciplina_id <> ?",
        aluno1,
        aluno2,
        disciplinaId);

    jdbc.update(
        "insert into matricula (aluno_id, disciplina_id, data_matricula)"
            + " values (?, ?, current_date)",
        aluno2,
        disciplinaId);

    jdbc.update(
        "insert into progresso_atividade"
            + " (aluno_id, entrega_id, status, data_conclusao)"
            + " values (?, ?, 'CONCLUIDA', ?)",
        aluno1,
        entregaId,
        Timestamp.valueOf("2000-01-02 12:00:00"));

    mockMvc
        .perform(
            get("/progresso")
                .header("Authorization", "Bearer " + tokenAluno1))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.concluidas").value(1))
        .andExpect(jsonPath("$.total").value(1))
        .andExpect(jsonPath("$.percentual").value(100));

    mockMvc
        .perform(
            get("/progresso")
                .header("Authorization", "Bearer " + tokenAluno2))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.concluidas").value(0))
        .andExpect(jsonPath("$.total").value(1))
        .andExpect(jsonPath("$.percentual").value(0));
    }
}