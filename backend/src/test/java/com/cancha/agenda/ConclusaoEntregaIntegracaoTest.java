package com.cancha.agenda;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.cancha.auth.security.JwtService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

/** Verifica a conclusão de entregas pelo aluno autenticado. */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class ConclusaoEntregaIntegracaoTest {

  @Autowired private MockMvc mockMvc;
  @Autowired private JdbcTemplate jdbc;
  @Autowired private JwtService jwtService;

  @Test
  void concluirEntregaCriaProgressoComDataDeConclusao() throws Exception {
    Long alunoId =
        jdbc.queryForObject(
            "select id from usuario where email = ?",
            Long.class,
            "aluno1@cancha.test");

    Long entregaId =
        jdbc.queryForObject(
            "select min(e.id) from entrega e"
                + " join matricula m on m.disciplina_id = e.disciplina_id"
                + " where m.aluno_id = ?",
            Long.class,
            alunoId);

    assertThat(entregaId).isNotNull();

    // Garante o cenário de uma entrega ainda sem progresso para este aluno.
    jdbc.update(
        "delete from progresso_atividade where aluno_id = ? and entrega_id = ?",
        alunoId,
        entregaId);

    mockMvc
        .perform(
            patch("/atividades/{id}/status", entregaId)
                .header("Authorization", "Bearer " + jwtService.emitir(alunoId))
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {"status":"CONCLUIDA"}
                    """))
        .andExpect(status().isNoContent());

    assertThat(
            jdbc.queryForObject(
                "select status from progresso_atividade"
                    + " where aluno_id = ? and entrega_id = ?",
                String.class,
                alunoId,
                entregaId))
        .isEqualTo("CONCLUIDA");

    assertThat(
            jdbc.queryForObject(
                "select data_conclusao from progresso_atividade"
                    + " where aluno_id = ? and entrega_id = ?",
                java.sql.Timestamp.class,
                alunoId,
                entregaId))
        .isNotNull();
  }
}