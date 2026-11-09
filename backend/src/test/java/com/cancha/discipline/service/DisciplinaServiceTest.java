package com.cancha.discipline.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import com.cancha.agenda.service.PercentualConcluidoService;
import com.cancha.auth.model.Aluno;
import com.cancha.discipline.dto.DisciplinaResumoResponse;
import com.cancha.discipline.model.Disciplina;
import com.cancha.discipline.model.Matricula;
import com.cancha.discipline.repository.MatriculaRepository;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

@ExtendWith(MockitoExtension.class)
class DisciplinaServiceTest {

  private static final Long ALUNO_1 = 1L;
  private static final Long ALUNO_2 = 2L;

  @Mock private MatriculaRepository matriculas;
  @Mock private PercentualConcluidoService percentuais;
  @InjectMocks private DisciplinaService service;

  @Test
  void devolveSoAsDisciplinasDoAlunoPedidoENuncaConsultaOutroAluno() {
    when(matriculas.listarDoAlunoComDisciplina(ALUNO_1))
        .thenReturn(List.of(matricula("Compiladores", 10L)));

    List<DisciplinaResumoResponse> resultado = service.listarDoAluno(ALUNO_1);

    assertThat(resultado)
        .extracting(DisciplinaResumoResponse::nome)
        .containsExactly("Compiladores");
    verify(matriculas).listarDoAlunoComDisciplina(ALUNO_1);
    verify(matriculas, never()).listarDoAlunoComDisciplina(ALUNO_2);
  }

  @Test
  void copiaOsDadosDaDisciplinaEOPercentualCalculadoDasEntregas() {
    when(matriculas.listarDoAlunoComDisciplina(ALUNO_1))
        .thenReturn(List.of(matricula("Teoria dos Números", 10L)));
    when(percentuais.calcular(ALUNO_1, List.of(10L))).thenReturn(Map.of(10L, 42.5));

    DisciplinaResumoResponse resposta = service.listarDoAluno(ALUNO_1).get(0);

    assertThat(resposta.nome()).isEqualTo("Teoria dos Números");
    assertThat(resposta.periodoLetivo()).isEqualTo("2026.2");
    assertThat(resposta.progressoPercentual()).isEqualTo(42.5);
  }

  @Test
  void progressoENuloQuandoADisciplinaNaoTemEntregasEIgnoraOValorGravadoNaMatricula() {
    Matricula matricula = matricula("Projeto Integrador", 10L);
    matricula.setProgressoPercentual(99);
    when(matriculas.listarDoAlunoComDisciplina(ALUNO_1)).thenReturn(List.of(matricula));
    when(percentuais.calcular(ALUNO_1, List.of(10L))).thenReturn(Map.of());

    assertThat(service.listarDoAluno(ALUNO_1).get(0).progressoPercentual()).isNull();
  }

  @Test
  void calculaOProgressoDeTodasAsDisciplinasEmUmaUnicaConsulta() {
    when(matriculas.listarDoAlunoComDisciplina(ALUNO_1))
        .thenReturn(List.of(matricula("A", 10L), matricula("B", 20L)));
    when(percentuais.calcular(ALUNO_1, List.of(10L, 20L))).thenReturn(Map.of(10L, 100.0, 20L, 0.0));

    List<DisciplinaResumoResponse> resultado = service.listarDoAluno(ALUNO_1);

    assertThat(resultado)
        .extracting(DisciplinaResumoResponse::progressoPercentual)
        .containsExactly(100.0, 0.0);
    verify(percentuais).calcular(ALUNO_1, List.of(10L, 20L));
  }

  @Test
  void mantemAOrdemDevolvidaPeloRepositorio() {
    when(matriculas.listarDoAlunoComDisciplina(ALUNO_1))
        .thenReturn(List.of(matricula("A", 1L), matricula("B", 2L), matricula("C", 3L)));

    assertThat(service.listarDoAluno(ALUNO_1))
        .extracting(DisciplinaResumoResponse::nome)
        .containsExactly("A", "B", "C");
  }

  @Test
  void devolveListaVaziaESemCalcularProgressoQuandoOAlunoNaoTemMatriculas() {
    assertThat(service.listarDoAluno(ALUNO_2)).isEmpty();

    verifyNoInteractions(percentuais);
  }

  private static Matricula matricula(String nomeDaDisciplina, Long disciplinaId) {
    Aluno aluno = new Aluno("Aluno", "aluno@cancha.test", "hash", "260000000");
    Disciplina disciplina = new Disciplina(nomeDaDisciplina, "2026.2");
    ReflectionTestUtils.setField(disciplina, "id", disciplinaId);
    return new Matricula(aluno, disciplina);
  }
}
