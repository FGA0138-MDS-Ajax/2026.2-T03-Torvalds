package com.cancha.discipline.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.cancha.auth.model.Aluno;
import com.cancha.discipline.dto.DisciplinaResumoResponse;
import com.cancha.discipline.model.Disciplina;
import com.cancha.discipline.model.Matricula;
import com.cancha.discipline.repository.MatriculaRepository;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class DisciplinaServiceTest {

  private static final Long ALUNO_1 = 1L;
  private static final Long ALUNO_2 = 2L;

  @Mock private MatriculaRepository matriculas;
  @InjectMocks private DisciplinaService service;

  @Test
  void devolveSoAsDisciplinasDoAlunoPedidoENuncaConsultaOutroAluno() {
    when(matriculas.listarDoAlunoComDisciplina(ALUNO_1))
        .thenReturn(List.of(matricula("Compiladores", 0)));

    List<DisciplinaResumoResponse> resultado = service.listarDoAluno(ALUNO_1);

    assertThat(resultado)
        .extracting(DisciplinaResumoResponse::nome)
        .containsExactly("Compiladores");
    verify(matriculas).listarDoAlunoComDisciplina(ALUNO_1);
    verify(matriculas, never()).listarDoAlunoComDisciplina(ALUNO_2);
  }

  @Test
  void copiaOsDadosDaDisciplinaEOProgressoDaMatricula() {
    when(matriculas.listarDoAlunoComDisciplina(ALUNO_1))
        .thenReturn(List.of(matricula("Teoria dos Números", 42.5)));

    DisciplinaResumoResponse resposta = service.listarDoAluno(ALUNO_1).get(0);

    assertThat(resposta.nome()).isEqualTo("Teoria dos Números");
    assertThat(resposta.periodoLetivo()).isEqualTo("2026.2");
    assertThat(resposta.progressoPercentual()).isEqualTo(42.5);
  }

  @Test
  void mantemAOrdemDevolvidaPeloRepositorio() {
    when(matriculas.listarDoAlunoComDisciplina(ALUNO_1))
        .thenReturn(List.of(matricula("A", 0), matricula("B", 0), matricula("C", 0)));

    assertThat(service.listarDoAluno(ALUNO_1))
        .extracting(DisciplinaResumoResponse::nome)
        .containsExactly("A", "B", "C");
  }

  @Test
  void devolveListaVaziaQuandoOAlunoNaoTemMatriculas() {
    assertThat(service.listarDoAluno(ALUNO_2)).isEmpty();
  }

  private static Matricula matricula(String nomeDaDisciplina, double progresso) {
    Aluno aluno = new Aluno("Aluno", "aluno@cancha.test", "hash", "260000000");
    Matricula matricula = new Matricula(aluno, new Disciplina(nomeDaDisciplina, "2026.2"));
    matricula.setProgressoPercentual(progresso);
    return matricula;
  }
}
