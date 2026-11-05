package com.cancha.discipline.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.cancha.discipline.dto.ConteudoResponse;
import com.cancha.discipline.model.Conteudo;
import com.cancha.discipline.model.Disciplina;
import com.cancha.discipline.repository.ConteudoRepository;
import com.cancha.discipline.repository.MatriculaRepository;
import java.time.LocalDate;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;

@ExtendWith(MockitoExtension.class)
class ConteudoServiceTest {

  private static final Long ALUNO_ID = 1L;
  private static final Long DISCIPLINA_ID = 10L;

  @Mock private ConteudoRepository conteudos;
  @Mock private MatriculaRepository matriculas;
  @InjectMocks private ConteudoService service;

  @Test
  void listaConteudosDaDisciplinaQuandoAlunoEstaMatriculado() {
    LocalDate dataPublicacao = LocalDate.of(2026, 11, 5);
    when(matriculas.existsByAluno_IdAndDisciplina_Id(ALUNO_ID, DISCIPLINA_ID)).thenReturn(true);
    when(conteudos.listarDaDisciplina(DISCIPLINA_ID))
        .thenReturn(
            List.of(
                new Conteudo(
                    new Disciplina("Compiladores", "2026.2"),
                    "Introdução aos compiladores",
                    "Livro",
                    "https://example.org/compiladores",
                    dataPublicacao)));

    List<ConteudoResponse> resultado = service.listarDaDisciplina(ALUNO_ID, DISCIPLINA_ID);

    assertThat(resultado)
        .extracting(ConteudoResponse::titulo)
        .containsExactly("Introdução aos compiladores");
    assertThat(resultado.get(0).tipo()).isEqualTo("Livro");
    assertThat(resultado.get(0).urlOuArquivo()).isEqualTo("https://example.org/compiladores");
    assertThat(resultado.get(0).dataPublicacao()).isEqualTo(dataPublicacao);
    verify(matriculas).existsByAluno_IdAndDisciplina_Id(ALUNO_ID, DISCIPLINA_ID);
    verify(conteudos).listarDaDisciplina(DISCIPLINA_ID);
  }

  @Test
  void recusaAlunoSemMatriculaSemConsultarConteudos() {
    when(matriculas.existsByAluno_IdAndDisciplina_Id(ALUNO_ID, DISCIPLINA_ID)).thenReturn(false);

    assertThatThrownBy(() -> service.listarDaDisciplina(ALUNO_ID, DISCIPLINA_ID))
        .isInstanceOf(AccessDeniedException.class);

    verify(conteudos, never()).listarDaDisciplina(DISCIPLINA_ID);
  }
}
