package com.cancha.agenda;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.cancha.agenda.model.Entrega;
import com.cancha.agenda.model.ProgressoAtividade;
import com.cancha.agenda.model.StatusEntrega;
import com.cancha.auth.model.Aluno;
import jakarta.persistence.EntityManager;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.transaction.annotation.Transactional;

/** O status da entrega é um enum no Java e só aceita os três valores combinados no banco (V6). */
@SpringBootTest
@Transactional
class StatusEntregaIntegrationTest {

  @Autowired private JdbcTemplate jdbc;
  @Autowired private EntityManager em;

  @Test
  void bancoRecusaStatusForaDosTresCombinados() {
    Long aluno = idDoAluno("aluno1@cancha.test");
    Long entrega = entregasSemProgressoDe(aluno).get(0);

    assertThatThrownBy(() -> inserirProgresso(aluno, entrega, "FEITO"))
        .isInstanceOf(DataIntegrityViolationException.class);
  }

  @Test
  void bancoAceitaOsTresStatusCombinados() {
    Long aluno = idDoAluno("aluno1@cancha.test");
    List<Long> entregas = entregasSemProgressoDe(aluno);

    inserirProgresso(aluno, entregas.get(0), "A_FAZER");
    inserirProgresso(aluno, entregas.get(1), "EM_ANDAMENTO");
    inserirProgresso(aluno, entregas.get(2), "CONCLUIDA");

    assertThat(contarProgressos(aluno)).isEqualTo(contarProgressosGravados(aluno));
  }

  @Test
  void entidadeLeOStatusDoBancoComoEnum() {
    List<ProgressoAtividade> concluidos =
        em.createQuery(
                "select p from ProgressoAtividade p where p.status = :status",
                ProgressoAtividade.class)
            .setParameter("status", StatusEntrega.CONCLUIDA)
            .getResultList();

    assertThat(concluidos).isNotEmpty();
    assertThat(concluidos).allSatisfy(p -> assertThat(p.getStatus()).isEqualTo(StatusEntrega.CONCLUIDA));
  }

  @Test
  void entidadeGravaOStatusPeloNomeDoEnum() {
    Long alunoId = idDoAluno("aluno1@cancha.test");
    Long entregaId = entregasSemProgressoDe(alunoId).get(0);

    em.persist(
        new ProgressoAtividade(
            em.find(Aluno.class, alunoId),
            em.find(Entrega.class, entregaId),
            StatusEntrega.EM_ANDAMENTO));
    em.flush();

    String gravado =
        jdbc.queryForObject(
            "select status from progresso_atividade where aluno_id = ? and entrega_id = ?",
            String.class,
            alunoId,
            entregaId);
    assertThat(gravado).isEqualTo("EM_ANDAMENTO");
  }

  private Long idDoAluno(String email) {
    return jdbc.queryForObject("select id from usuario where email = ?", Long.class, email);
  }

  private List<Long> entregasSemProgressoDe(Long alunoId) {
    return jdbc.queryForList(
        "select id from entrega where id not in"
            + " (select entrega_id from progresso_atividade where aluno_id = ?) order by id",
        Long.class,
        alunoId);
  }

  private void inserirProgresso(Long alunoId, Long entregaId, String status) {
    jdbc.update(
        "insert into progresso_atividade (aluno_id, entrega_id, status) values (?, ?, ?)",
        alunoId,
        entregaId,
        status);
  }

  private int contarProgressos(Long alunoId) {
    return jdbc.queryForObject(
        "select count(*) from progresso_atividade where aluno_id = ?", Integer.class, alunoId);
  }

  private int contarProgressosGravados(Long alunoId) {
    return jdbc.queryForObject(
        "select count(*) from progresso_atividade where aluno_id = ?"
            + " and status in ('A_FAZER', 'EM_ANDAMENTO', 'CONCLUIDA')",
        Integer.class,
        alunoId);
  }
}
