package com.cancha.agenda;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.transaction.annotation.Transactional;

/** Confere a coerência dos dados de exemplo das entregas criados pela V4 e ampliados pela V7. */
@SpringBootTest
@Transactional
class SeedEntregasIntegrationTest {

  private static final String SENHA_DE_DESENVOLVIMENTO = "cancha-dev-123";

  @Autowired private JdbcTemplate jdbc;

  @Test
  void criaEntregasNasCincoDisciplinas() {
    assertThat(contar("select count(*) from entrega")).isEqualTo(25);
    assertThat(contar("select count(distinct disciplina_id) from entrega")).isEqualTo(5);
    assertThat(contar("select min(c) from (select count(*) c from entrega group by disciplina_id) t"))
        .isGreaterThanOrEqualTo(3);
  }

  @Test
  void temTrabalhosListasEProvas() {
    assertThat(
            jdbc.queryForList("select distinct tipo from entrega order by tipo", String.class))
        .containsExactly("Lista", "Prova", "Trabalho");
  }

  @Test
  void temPrazosVencidosEFuturos() {
    assertThat(contar("select count(*) from entrega where prazo < localtimestamp")).isEqualTo(11);
    assertThat(contar("select count(*) from entrega where prazo > localtimestamp")).isEqualTo(14);
  }

  @Test
  void situacoesUsamSoOsValoresCombinados() {
    assertThat(
            contar(
                "select count(*) from progresso_atividade"
                    + " where status not in ('A_FAZER', 'EM_ANDAMENTO', 'CONCLUIDA')"))
        .isZero();
  }

  @Test
  void soEntregaConcluidaTemDataDeConclusaoENoPassado() {
    assertThat(
            contar(
                "select count(*) from progresso_atividade"
                    + " where (status = 'CONCLUIDA') <> (data_conclusao is not null)"))
        .isZero();
    assertThat(contar("select count(*) from progresso_atividade where data_conclusao > localtimestamp"))
        .isZero();
  }

  @Test
  void cadaAlunoTemSituacoesDiferentes() {
    assertThat(comStatus("aluno1@cancha.test", "CONCLUIDA")).isEqualTo(11);
    assertThat(comStatus("aluno1@cancha.test", "EM_ANDAMENTO")).isEqualTo(4);
    assertThat(comStatus("aluno2@cancha.test", "CONCLUIDA")).isEqualTo(10);
    assertThat(comStatus("aluno2@cancha.test", "EM_ANDAMENTO")).isEqualTo(3);
  }

  @Test
  void cadaAlunoTemPeloMenosUmaEntregaVencidaSemConcluir() {
    assertThat(vencidasSemConcluir("aluno1@cancha.test")).isPositive();
    assertThat(vencidasSemConcluir("aluno2@cancha.test")).isPositive();
  }

  @Test
  void aluno3NaoTemMatriculaNemSituacoesEUsaASenhaDeDesenvolvimento() {
    Long aluno3 =
        jdbc.queryForObject(
            "select id from usuario where email = 'aluno3@cancha.test'", Long.class);

    assertThat(contar("select count(*) from aluno where id = " + aluno3)).isEqualTo(1);
    assertThat(contar("select count(*) from matricula where aluno_id = " + aluno3)).isZero();
    assertThat(contar("select count(*) from progresso_atividade where aluno_id = " + aluno3))
        .isZero();
    String hash =
        jdbc.queryForObject(
            "select senha_hash from usuario where id = ?", String.class, aluno3);
    assertThat(new BCryptPasswordEncoder().matches(SENHA_DE_DESENVOLVIMENTO, hash)).isTrue();
  }

  private int comStatus(String email, String status) {
    return jdbc.queryForObject(
        "select count(*) from progresso_atividade p join usuario u on u.id = p.aluno_id"
            + " where u.email = ? and p.status = ?",
        Integer.class,
        email,
        status);
  }

  // Entrega com prazo vencido de uma disciplina do aluno que ele não concluiu (sem linha conta
  // como A_FAZER).
  private int vencidasSemConcluir(String email) {
    return jdbc.queryForObject(
        "select count(*) from entrega e"
            + " join matricula m on m.disciplina_id = e.disciplina_id"
            + " join usuario u on u.id = m.aluno_id"
            + " where u.email = ? and e.prazo < localtimestamp"
            + " and not exists (select 1 from progresso_atividade p"
            + "   where p.entrega_id = e.id and p.aluno_id = u.id and p.status = 'CONCLUIDA')",
        Integer.class,
        email);
  }

  private int contar(String sql) {
    return jdbc.queryForObject(sql, Integer.class);
  }
}
