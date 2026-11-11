package com.cancha.agenda;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

import com.cancha.agenda.dto.EntregaAgendaResponse;
import com.cancha.agenda.dto.EntregaResponse;
import com.cancha.agenda.model.StatusEntrega;
import com.cancha.agenda.service.AgendaService;
import com.cancha.agenda.service.EntregaService;
import com.cancha.discipline.dto.DisciplinaResumoResponse;
import com.cancha.discipline.service.DisciplinaService;
import java.time.LocalDateTime;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class AgendaServiceTest {

  private static final Long ALUNO_ID = 1L;

  private static final DisciplinaResumoResponse COMPILADORES =
      new DisciplinaResumoResponse(10L, "Compiladores", "2026.2", null);

  private static final DisciplinaResumoResponse QUALIDADE =
      new DisciplinaResumoResponse(20L, "Qualidade", "2026.2", null);

  @Mock private DisciplinaService disciplinas;
  @Mock private EntregaService entregas;

  @InjectMocks private AgendaService service;

  @Test
  void agrupaPorSituacaoEOrdenaCadaGrupoPorPrazo() {
    when(disciplinas.listarDoAluno(ALUNO_ID))
        .thenReturn(List.of(COMPILADORES, QUALIDADE));

    when(entregas.listarDaDisciplina(ALUNO_ID, 10L))
        .thenReturn(
            List.of(
                entrega(1L, "A fazer mais tarde", 5, StatusEntrega.A_FAZER),
                entrega(2L, "Concluída", 4, StatusEntrega.CONCLUIDA),
                entrega(3L, "Em andamento", 3, StatusEntrega.EM_ANDAMENTO),
                entrega(4L, "A fazer mais cedo", 1, StatusEntrega.A_FAZER)));

    when(entregas.listarDaDisciplina(ALUNO_ID, 20L))
        .thenReturn(
            List.of(
                entrega(5L, "Outra concluída", 2, StatusEntrega.CONCLUIDA),
                entrega(6L, "Outro andamento", 6, StatusEntrega.EM_ANDAMENTO)));

    var resultado = service.listar(ALUNO_ID);

    assertThat(resultado.aFazer())
        .extracting(EntregaAgendaResponse::id)
        .containsExactly(4L, 1L);

    assertThat(resultado.emAndamento())
        .extracting(EntregaAgendaResponse::id)
        .containsExactly(3L, 6L);

    assertThat(resultado.concluida())
        .extracting(EntregaAgendaResponse::id)
        .containsExactly(5L, 2L);

    assertThat(resultado.aFazer().get(0).disciplina()).isEqualTo("Compiladores");
    assertThat(resultado.aFazer().get(0).tipo()).isEqualTo("Lista");
    assertThat(resultado.aFazer().get(0).situacao()).isEqualTo(StatusEntrega.A_FAZER);
  }

  private static EntregaResponse entrega(
      Long id, String titulo, int diasAtePrazo, StatusEntrega status) {
    return new EntregaResponse(
        id,
        titulo,
        "Descrição",
        "Lista",
        LocalDateTime.now().plusDays(diasAtePrazo),
        status);
  }
}