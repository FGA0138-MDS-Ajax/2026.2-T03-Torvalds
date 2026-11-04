package com.cancha.agenda;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.transaction.annotation.Transactional;

/** Confere a coerência das entregas de exemplo criadas pela V4. */
@SpringBootTest
@Transactional
class SeedEntregasIntegrationTest {

  @Autowired private JdbcTemplate jdbc;

  @Test
  void criaEntregasNasCincoDisciplinas() {
    assertThat(contar("select count(*) from entrega")).isEqualTo(16);
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
    assertThat(contar("select count(*) from entrega where prazo < localtimestamp")).isEqualTo(5);
    assertThat(contar("select count(*) from entrega where prazo > localtimestamp")).isEqualTo(11);
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
    assertThat(concluidasDo("aluno1@cancha.test")).isEqualTo(4);
    assertThat(concluidasDo("aluno2@cancha.test")).isEqualTo(5);
  }

  private int concluidasDo(String email) {
    return jdbc.queryForObject(
        "select count(*) from progresso_atividade p join usuario u on u.id = p.aluno_id"
            + " where u.email = ? and p.status = 'CONCLUIDA'",
        Integer.class,
        email);
  }

  private int contar(String sql) {
    return jdbc.queryForObject(sql, Integer.class);
  }
}
