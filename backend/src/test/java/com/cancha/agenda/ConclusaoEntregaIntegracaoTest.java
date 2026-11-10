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
import jakarta.persistence.EntityManager;

/** Verifica a conclusão de entregas pelo aluno autenticado. */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class ConclusaoEntregaIntegracaoTest {

  @Autowired private MockMvc mockMvc;
  @Autowired private JdbcTemplate jdbc;
  @Autowired private JwtService jwtService;
  @Autowired private EntityManager entityManager;

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

  @Test
    void concluirSemTokenRetorna401() throws Exception {
    mockMvc
        .perform(
            patch("/atividades/{id}/status", 1L)
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {"status":"CONCLUIDA"}
                    """))
        .andExpect(status().isUnauthorized());
    }

    @Test
    void concluirAtividadeInexistenteRetorna404() throws Exception {
    Long alunoId =
        jdbc.queryForObject(
            "select id from usuario where email = ?",
            Long.class,
            "aluno1@cancha.test");

    mockMvc
        .perform(
            patch("/atividades/{id}/status", Long.MAX_VALUE)
                .header("Authorization", "Bearer " + jwtService.emitir(alunoId))
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {"status":"CONCLUIDA"}
                    """))
        .andExpect(status().isNotFound());
    }

    @Test
    void alunoSemMatriculaNaoConsegueConcluirEntrega() throws Exception {
    Long alunoId =
        jdbc.queryForObject(
            "select id from usuario where email = ?",
            Long.class,
            "aluno1@cancha.test");

    Long entregaId =
        jdbc.queryForObject(
            "select min(id) from entrega", Long.class);

    Long disciplinaId =
        jdbc.queryForObject(
            "select disciplina_id from entrega where id = ?",
            Long.class,
            entregaId);

    jdbc.update(
        "delete from progresso_atividade where aluno_id = ? and entrega_id = ?",
        alunoId,
        entregaId);

    jdbc.update(
        "delete from matricula where aluno_id = ? and disciplina_id = ?",
        alunoId,
        disciplinaId);

    mockMvc
        .perform(
            patch("/atividades/{id}/status", entregaId)
                .header("Authorization", "Bearer " + jwtService.emitir(alunoId))
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {"status":"CONCLUIDA"}
                    """))
        .andExpect(status().isForbidden());

    assertThat(
            jdbc.queryForObject(
                "select count(*) from progresso_atividade"
                    + " where aluno_id = ? and entrega_id = ?",
                Long.class,
                alunoId,
                entregaId))
        .isZero();
    }

    @Test
    void concluirAtualizaRegistroExistenteSemDuplicarNemTrocarDataNaRepeticao()
        throws Exception {
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

    jdbc.update(
        "delete from progresso_atividade where aluno_id = ? and entrega_id = ?",
        alunoId,
        entregaId);

    jdbc.update(
        "insert into progresso_atividade (aluno_id, entrega_id, status)"
            + " values (?, ?, 'EM_ANDAMENTO')",
        alunoId,
        entregaId);

    Long progressoId =
        jdbc.queryForObject(
            "select id from progresso_atividade where aluno_id = ? and entrega_id = ?",
            Long.class,
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

    // Envia as alterações do JPA ao banco antes da consulta SQL direta.
    entityManager.flush();

    assertThat(
            jdbc.queryForObject(
                "select status from progresso_atividade where id = ?",
                String.class,
                progressoId))
        .isEqualTo("CONCLUIDA");

    assertThat(
            jdbc.queryForObject(
                "select data_conclusao from progresso_atividade where id = ?",
                java.sql.Timestamp.class,
                progressoId))
        .isNotNull();

    // Uma data conhecida permite verificar se repetir a chamada preserva a conclusão.
    java.sql.Timestamp dataOriginal =
        java.sql.Timestamp.valueOf("2026-01-15 10:00:00");

    jdbc.update(
        "update progresso_atividade set data_conclusao = ? where id = ?",
        dataOriginal,
        progressoId);

    // Descarta a entidade em memória para reler a data alterada diretamente no banco.
    entityManager.clear();

    mockMvc
        .perform(
            patch("/atividades/{id}/status", entregaId)
                .header("Authorization", "Bearer " + jwtService.emitir(alunoId))
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {"status":"CONCLUIDA"}
                    """))
        .andExpect(status().isNoContent());

    entityManager.flush();

    assertThat(
            jdbc.queryForObject(
                "select count(*) from progresso_atividade"
                    + " where aluno_id = ? and entrega_id = ?",
                Long.class,
                alunoId,
                entregaId))
        .isEqualTo(1L);

    assertThat(
            jdbc.queryForObject(
                "select data_conclusao from progresso_atividade where id = ?",
                java.sql.Timestamp.class,
                progressoId))
        .isEqualTo(dataOriginal);
    }

    @Test
    void concluirComoAluno2NaoAlteraProgressoDoAluno1() throws Exception {
    Long aluno1 =
        jdbc.queryForObject(
            "select id from usuario where email = ?",
            Long.class,
            "aluno1@cancha.test");

    Long aluno2 =
        jdbc.queryForObject(
            "select id from usuario where email = ?",
            Long.class,
            "aluno2@cancha.test");

    Long entregaId =
        jdbc.queryForObject(
            "select min(e.id) from entrega e"
                + " join matricula m1 on m1.disciplina_id = e.disciplina_id"
                + " join matricula m2 on m2.disciplina_id = e.disciplina_id"
                + " where m1.aluno_id = ? and m2.aluno_id = ?",
            Long.class,
            aluno1,
            aluno2);

    jdbc.update(
        "delete from progresso_atividade"
            + " where entrega_id = ? and aluno_id in (?, ?)",
        entregaId,
        aluno1,
        aluno2);

    jdbc.update(
        "insert into progresso_atividade (aluno_id, entrega_id, status)"
            + " values (?, ?, 'EM_ANDAMENTO')",
        aluno1,
        entregaId);

    mockMvc
        .perform(
            patch("/atividades/{id}/status", entregaId)
                .header("Authorization", "Bearer " + jwtService.emitir(aluno2))
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
                aluno1,
                entregaId))
        .isEqualTo("EM_ANDAMENTO");

    assertThat(
            jdbc.queryForObject(
                "select data_conclusao from progresso_atividade"
                    + " where aluno_id = ? and entrega_id = ?",
                java.sql.Timestamp.class,
                aluno1,
                entregaId))
        .isNull();

    assertThat(
            jdbc.queryForObject(
                "select status from progresso_atividade"
                    + " where aluno_id = ? and entrega_id = ?",
                String.class,
                aluno2,
                entregaId))
        .isEqualTo("CONCLUIDA");
    }
}