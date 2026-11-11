package com.cancha.agenda;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.cancha.agenda.dto.EntregaResponse;
import com.cancha.agenda.dto.ProximaEntregaResponse;
import com.cancha.agenda.model.StatusEntrega;
import com.cancha.agenda.service.EntregaService;
import com.cancha.agenda.service.ProximasEntregasService;
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
class ProximasEntregasServiceTest {

  private static final Long ALUNO_ID = 1L;
  private static final DisciplinaResumoResponse COMPILADORES =
      new DisciplinaResumoResponse(10L, "Compiladores", "2026.2", null);
  private static final DisciplinaResumoResponse QUALIDADE =
      new DisciplinaResumoResponse(20L, "Qualidade", "2026.2", null);

  @Mock private DisciplinaService disciplinas;
  @Mock private EntregaService entregas;
  @InjectMocks private ProximasEntregasService service;

  @Test
  void juntaAsDisciplinasEOrdenaPorPrazo() {
    when(disciplinas.listarDoAluno(ALUNO_ID)).thenReturn(List.of(COMPILADORES, QUALIDADE));
    when(entregas.listarDaDisciplina(ALUNO_ID, 10L))
        .thenReturn(
            List.of(
                entrega(1L, "Lista de Compiladores", diasAPartirDeHoje(2), StatusEntrega.A_FAZER),
                entrega(2L, "Prova de Compiladores", diasAPartirDeHoje(9), StatusEntrega.A_FAZER)));
    when(entregas.listarDaDisciplina(ALUNO_ID, 20L))
        .thenReturn(
            List.of(
                entrega(3L, "Lista de Qualidade", diasAPartirDeHoje(1), StatusEntrega.EM_ANDAMENTO),
                entrega(4L, "Prova de Qualidade", diasAPartirDeHoje(5), StatusEntrega.A_FAZER)));

    List<ProximaEntregaResponse> resultado = service.listar(ALUNO_ID);

    assertThat(resultado)
        .extracting(ProximaEntregaResponse::titulo)
        .containsExactly(
            "Lista de Qualidade",
            "Lista de Compiladores",
            "Prova de Qualidade",
            "Prova de Compiladores");
    assertThat(resultado.get(0).disciplinaId()).isEqualTo(20L);
    assertThat(resultado.get(0).disciplinaNome()).isEqualTo("Qualidade");
    assertThat(resultado.get(0).status()).isEqualTo(StatusEntrega.EM_ANDAMENTO);
  }

  @Test
  void deixaDeForaAsConcluidas() {
    when(disciplinas.listarDoAluno(ALUNO_ID)).thenReturn(List.of(COMPILADORES));
    when(entregas.listarDaDisciplina(ALUNO_ID, 10L))
        .thenReturn(
            List.of(
                entrega(1L, "Concluída", diasAPartirDeHoje(1), StatusEntrega.CONCLUIDA),
                entrega(2L, "Em andamento", diasAPartirDeHoje(2), StatusEntrega.EM_ANDAMENTO),
                entrega(3L, "A fazer", diasAPartirDeHoje(3), StatusEntrega.A_FAZER)));

    assertThat(service.listar(ALUNO_ID))
        .extracting(ProximaEntregaResponse::titulo)
        .containsExactly("Em andamento", "A fazer");
  }

  @Test
  void devolveNoMaximoCinco() {
    when(disciplinas.listarDoAluno(ALUNO_ID)).thenReturn(List.of(COMPILADORES));
    when(entregas.listarDaDisciplina(ALUNO_ID, 10L))
        .thenReturn(
            List.of(
                entrega(1L, "1", diasAPartirDeHoje(1), StatusEntrega.A_FAZER),
                entrega(2L, "2", diasAPartirDeHoje(2), StatusEntrega.A_FAZER),
                entrega(3L, "3", diasAPartirDeHoje(3), StatusEntrega.A_FAZER),
                entrega(4L, "4", diasAPartirDeHoje(4), StatusEntrega.A_FAZER),
                entrega(5L, "5", diasAPartirDeHoje(5), StatusEntrega.A_FAZER),
                entrega(6L, "6", diasAPartirDeHoje(6), StatusEntrega.A_FAZER)));

    assertThat(service.listar(ALUNO_ID))
        .hasSize(ProximasEntregasService.LIMITE)
        .extracting(ProximaEntregaResponse::id)
        .containsExactly(1L, 2L, 3L, 4L, 5L);
  }

  @Test
  void marcaComoAtrasadaSoAEntregaComPrazoVencido() {
    when(disciplinas.listarDoAluno(ALUNO_ID)).thenReturn(List.of(COMPILADORES));
    when(entregas.listarDaDisciplina(ALUNO_ID, 10L))
        .thenReturn(
            List.of(
                entrega(1L, "Vencida", diasAPartirDeHoje(-3), StatusEntrega.A_FAZER),
                entrega(2L, "No prazo", diasAPartirDeHoje(3), StatusEntrega.A_FAZER)));

    List<ProximaEntregaResponse> resultado = service.listar(ALUNO_ID);

    assertThat(resultado.get(0).atrasada()).isTrue();
    assertThat(resultado.get(1).atrasada()).isFalse();
  }

  @Test
  void alunoSemDisciplinasRecebeListaVaziaSemConsultarEntregas() {
    when(disciplinas.listarDoAluno(ALUNO_ID)).thenReturn(List.of());

    assertThat(service.listar(ALUNO_ID)).isEmpty();
    verify(entregas, never()).listarDaDisciplina(ALUNO_ID, 10L);
  }

  private static EntregaResponse entrega(
      Long id, String titulo, LocalDateTime prazo, StatusEntrega status) {
    return new EntregaResponse(id, titulo, "Descrição", "Lista", prazo, status);
  }

  private static LocalDateTime diasAPartirDeHoje(int dias) {
    return LocalDateTime.now().plusDays(dias);
  }
}
