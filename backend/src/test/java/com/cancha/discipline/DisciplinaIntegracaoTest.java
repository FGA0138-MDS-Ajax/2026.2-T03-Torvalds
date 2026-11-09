package com.cancha.discipline;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.within;

import com.cancha.discipline.dto.DisciplinaResumoResponse;
import com.cancha.discipline.service.DisciplinaService;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.transaction.annotation.Transactional;

/** Com o banco de verdade (H2 + migrations): um aluno só enxerga as próprias disciplinas. */
@SpringBootTest
@Transactional
class DisciplinaIntegracaoTest {

  private static final String DISCIPLINA_EXCLUSIVA = "Disciplina Exclusiva do Aluno 1";

  @Autowired private DisciplinaService service;
  @Autowired private JdbcTemplate jdbc;

  @Test
  void alunoVeAsCincoDisciplinasDoSeedEmOrdemAlfabetica() {
    Long aluno1 = idDoAluno("aluno1@cancha.test");

    List<DisciplinaResumoResponse> disciplinas = service.listarDoAluno(aluno1);

    assertThat(disciplinas)
        .extracting(DisciplinaResumoResponse::nome)
        .containsExactly(
            "Compiladores",
            "Gestão e Produção da Qualidade",
            "Métodos de Desenvolvimento de Software",
            "Projeto Integrador em Engenharia",
            "Teoria dos Números");
  }

  @Test
  void alunoNaoVeDisciplinaEmQueApenasOutroAlunoEstaMatriculado() {
    Long aluno1 = idDoAluno("aluno1@cancha.test");
    Long aluno2 = idDoAluno("aluno2@cancha.test");
    matricularApenas(aluno1, DISCIPLINA_EXCLUSIVA);

    assertThat(service.listarDoAluno(aluno1))
        .extracting(DisciplinaResumoResponse::nome)
        .contains(DISCIPLINA_EXCLUSIVA)
        .hasSize(6);
    assertThat(service.listarDoAluno(aluno2))
        .extracting(DisciplinaResumoResponse::nome)
        .doesNotContain(DISCIPLINA_EXCLUSIVA)
        .hasSize(5);
  }

  @Test
  void sairDeUmaDisciplinaNaoAfetaAsDisciplinasDoOutroAluno() {
    Long aluno1 = idDoAluno("aluno1@cancha.test");
    Long aluno2 = idDoAluno("aluno2@cancha.test");
    jdbc.update(
        "delete from matricula where aluno_id = ? and disciplina_id ="
            + " (select id from disciplina where nome = 'Compiladores')",
        aluno2);

    assertThat(service.listarDoAluno(aluno2)).hasSize(4);
    assertThat(service.listarDoAluno(aluno1)).hasSize(5);
  }

  @Test
  void alunoSemMatriculasRecebeListaVazia() {
    assertThat(service.listarDoAluno(999_999L)).isEmpty();
  }

  @Test
  void progressoEOPercentualDeEntregasConcluidasDoAlunoEmCadaDisciplina() {
    Long aluno1 = idDoAluno("aluno1@cancha.test");

    List<DisciplinaResumoResponse> disciplinas = service.listarDoAluno(aluno1);

    assertThat(disciplinas)
        .allSatisfy(
            d ->
                assertThat(d.progressoPercentual())
                    .isCloseTo(percentualEsperado(aluno1, d.id()), within(0.0001)));
    assertThat(disciplinas)
        .extracting(DisciplinaResumoResponse::progressoPercentual)
        .anyMatch(percentual -> percentual > 0);
  }

  @Test
  void cadaAlunoVeOSeuProprioProgressoNasMesmasDisciplinas() {
    Long aluno1 = idDoAluno("aluno1@cancha.test");
    Long aluno2 = idDoAluno("aluno2@cancha.test");

    List<Double> doAluno1 =
        service.listarDoAluno(aluno1).stream()
            .map(DisciplinaResumoResponse::progressoPercentual)
            .toList();
    List<Double> doAluno2 =
        service.listarDoAluno(aluno2).stream()
            .map(DisciplinaResumoResponse::progressoPercentual)
            .toList();

    assertThat(doAluno1).isNotEqualTo(doAluno2);
  }

  @Test
  void disciplinaSemEntregasTemProgressoNulo() {
    Long aluno1 = idDoAluno("aluno1@cancha.test");
    matricularApenas(aluno1, DISCIPLINA_EXCLUSIVA);

    assertThat(service.listarDoAluno(aluno1))
        .filteredOn(d -> d.nome().equals(DISCIPLINA_EXCLUSIVA))
        .singleElement()
        .satisfies(d -> assertThat(d.progressoPercentual()).isNull());
  }

  private double percentualEsperado(Long alunoId, Long disciplinaId) {
    int total =
        jdbc.queryForObject(
            "select count(*) from entrega where disciplina_id = ?", Integer.class, disciplinaId);
    int concluidas =
        jdbc.queryForObject(
            "select count(*) from progresso_atividade p join entrega e on e.id = p.entrega_id"
                + " where p.aluno_id = ? and e.disciplina_id = ? and p.status = 'CONCLUIDA'",
            Integer.class,
            alunoId,
            disciplinaId);
    return concluidas * 100.0 / total;
  }

  private Long idDoAluno(String email) {
    return jdbc.queryForObject("select id from usuario where email = ?", Long.class, email);
  }

  private void matricularApenas(Long alunoId, String nomeDaDisciplina) {
    jdbc.update(
        "insert into disciplina (nome, periodo_letivo) values (?, ?)", nomeDaDisciplina, "2026.2");
    Long disciplinaId =
        jdbc.queryForObject(
            "select id from disciplina where nome = ?", Long.class, nomeDaDisciplina);
    jdbc.update(
        "insert into matricula (aluno_id, disciplina_id, data_matricula)"
            + " values (?, ?, current_date)",
        alunoId,
        disciplinaId);
  }
}
