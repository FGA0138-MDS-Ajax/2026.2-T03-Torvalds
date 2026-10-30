package com.cancha;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.cancha.auth.model.Aluno;
import jakarta.persistence.EntityManager;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.transaction.annotation.Transactional;

/** Garante que as migrations rodam do zero e que os dados de exemplo e as entidades batem. */
@SpringBootTest
@Transactional
class MigracoesIntegrationTest {

  private static final String SENHA_DE_DESENVOLVIMENTO = "cancha-dev-123";

  @Autowired private JdbcTemplate jdbc;
  @Autowired private EntityManager em;

  @Test
  void seedCriaAlunosDisciplinasEMatriculas() {
    assertThat(contar("aluno")).isEqualTo(2);
    assertThat(contar("disciplina")).isEqualTo(5);
    assertThat(contar("matricula")).isEqualTo(10);
  }

  @Test
  void entidadeAlunoLeOsDadosDoSeed() {
    List<Aluno> alunos = em.createQuery("select a from Aluno a order by a.email", Aluno.class).getResultList();

    assertThat(alunos).hasSize(2);
    assertThat(alunos.get(0).getEmail()).isEqualTo("aluno1@cancha.test");
    assertThat(alunos.get(0).getMatriculaUnB()).isEqualTo("260000001");
    assertThat(new BCryptPasswordEncoder().matches(SENHA_DE_DESENVOLVIMENTO, alunos.get(0).getSenhaHash()))
        .isTrue();
  }

  @Test
  void alunoNaoPodeSerMatriculadoDuasVezesNaMesmaDisciplina() {
    assertThatThrownBy(
            () ->
                jdbc.update(
                    "insert into matricula (aluno_id, disciplina_id, data_matricula)"
                        + " select aluno_id, disciplina_id, current_date from matricula fetch first 1 rows only"))
        .isInstanceOf(DataIntegrityViolationException.class);
  }

  private int contar(String tabela) {
    return jdbc.queryForObject("select count(*) from " + tabela, Integer.class);
  }
}
