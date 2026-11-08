package com.cancha.agenda;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.cancha.agenda.dto.EntregaResponse;
import com.cancha.agenda.model.Entrega;
import com.cancha.agenda.model.ProgressoAtividade;
import com.cancha.agenda.repository.EntregaRepository;
import com.cancha.agenda.repository.ProgressoAtividadeRepository;
import com.cancha.agenda.service.EntregaService;
import com.cancha.discipline.service.DisciplinaService;
import java.time.LocalDateTime;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;

@ExtendWith(MockitoExtension.class)
public class EntregaServiceTest {

  private static final Long ALUNO_ID = 1L;
  private static final Long DISCIPLINA_ID = 10L;

  @Mock private EntregaRepository entregas;
  @Mock private ProgressoAtividadeRepository progressos;
  @Mock private DisciplinaService disciplinas;
  @InjectMocks private EntregaService service;

  @Test
  void listaEntregasOrdenadasPorPrazo() {
    Entrega maisTarde = entrega(2L, "Prova", LocalDateTime.of(2026, 12, 10, 10, 0));
    Entrega maisCedo = entrega(1L, "Lista", LocalDateTime.of(2026, 12, 1, 10, 0));
    when(disciplinas.estaMatriculado(ALUNO_ID, DISCIPLINA_ID)).thenReturn(true);
    when(entregas.findByDisciplina_Id(DISCIPLINA_ID)).thenReturn(List.of(maisTarde, maisCedo));
    when(progressos.findByAluno_IdAndEntrega_Disciplina_Id(ALUNO_ID, DISCIPLINA_ID))
        .thenReturn(List.of());

    List<EntregaResponse> resultado = service.listarDaDisciplina(ALUNO_ID, DISCIPLINA_ID);

    assertThat(resultado)
        .extracting(EntregaResponse::titulo)
        .containsExactly("Lista", "Prova");
  }

  @Test
  void devolveStatusDoAlunoOuStatusPadraoQuandoNaoHaRegistro() {
    Entrega comProgresso = entrega(1L, "Lista", LocalDateTime.of(2026, 12, 1, 10, 0));
    Entrega semProgresso = entrega(2L, "Prova", LocalDateTime.of(2026, 12, 10, 10, 0));
    ProgressoAtividade progresso = mock(ProgressoAtividade.class);
    when(progresso.getEntrega()).thenReturn(comProgresso);
    when(progresso.getStatus()).thenReturn("EM_ANDAMENTO");
    when(disciplinas.estaMatriculado(ALUNO_ID, DISCIPLINA_ID)).thenReturn(true);
    when(entregas.findByDisciplina_Id(DISCIPLINA_ID))
        .thenReturn(List.of(comProgresso, semProgresso));
    when(progressos.findByAluno_IdAndEntrega_Disciplina_Id(ALUNO_ID, DISCIPLINA_ID))
        .thenReturn(List.of(progresso));

    List<EntregaResponse> resultado = service.listarDaDisciplina(ALUNO_ID, DISCIPLINA_ID);

    assertThat(resultado)
        .extracting(EntregaResponse::status)
        .containsExactly("EM_ANDAMENTO", "A fazer");
  }

  @Test
  void recusaAlunoSemMatriculaSemConsultarEntregasOuProgresso() {
    when(disciplinas.estaMatriculado(ALUNO_ID, DISCIPLINA_ID)).thenReturn(false);

    assertThatThrownBy(() -> service.listarDaDisciplina(ALUNO_ID, DISCIPLINA_ID))
        .isInstanceOf(AccessDeniedException.class);

    verify(entregas, never()).findByDisciplina_Id(DISCIPLINA_ID);
    verify(progressos, never())
        .findByAluno_IdAndEntrega_Disciplina_Id(ALUNO_ID, DISCIPLINA_ID);
  }

  private static Entrega entrega(Long id, String titulo, LocalDateTime prazo) {
    Entrega entrega = mock(Entrega.class);
    when(entrega.getId()).thenReturn(id);
    when(entrega.getTitulo()).thenReturn(titulo);
    when(entrega.getDescricao()).thenReturn("Descrição");
    when(entrega.getTipo()).thenReturn("Trabalho");
    when(entrega.getPrazo()).thenReturn(prazo);
    return entrega;
  }
}
