package com.cancha.agenda;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.within;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import com.cancha.agenda.repository.ContagemPorDisciplina;
import com.cancha.agenda.repository.EntregaRepository;
import com.cancha.agenda.repository.ProgressoAtividadeRepository;
import com.cancha.agenda.service.PercentualConcluidoService;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class PercentualConcluidoServiceTest {

  private static final Long ALUNO_ID = 1L;
  private static final List<Long> DISCIPLINAS = List.of(10L, 20L, 30L);

  @Mock private EntregaRepository entregas;
  @Mock private ProgressoAtividadeRepository progressos;
  @InjectMocks private PercentualConcluidoService service;

  @Test
  void calculaConcluidasSobreOTotalDeCadaDisciplina() {
    when(entregas.contarPorDisciplina(DISCIPLINAS))
        .thenReturn(List.of(new ContagemPorDisciplina(10L, 4), new ContagemPorDisciplina(20L, 2)));
    when(progressos.contarConcluidasPorDisciplina(ALUNO_ID, DISCIPLINAS))
        .thenReturn(List.of(new ContagemPorDisciplina(10L, 3), new ContagemPorDisciplina(20L, 1)));

    Map<Long, Double> resultado = service.calcular(ALUNO_ID, DISCIPLINAS);

    assertThat(resultado).containsEntry(10L, 75.0).containsEntry(20L, 50.0);
  }

  @Test
  void devolveOValorRealSemArredondar() {
    when(entregas.contarPorDisciplina(List.of(10L)))
        .thenReturn(List.of(new ContagemPorDisciplina(10L, 3)));
    when(progressos.contarConcluidasPorDisciplina(ALUNO_ID, List.of(10L)))
        .thenReturn(List.of(new ContagemPorDisciplina(10L, 1)));

    assertThat(service.calcular(ALUNO_ID, List.of(10L)).get(10L))
        .isCloseTo(33.3333, within(0.001));
  }

  @Test
  void disciplinaComEntregasMasNenhumaConcluidaTemZeroEnaoNulo() {
    when(entregas.contarPorDisciplina(List.of(10L)))
        .thenReturn(List.of(new ContagemPorDisciplina(10L, 5)));
    when(progressos.contarConcluidasPorDisciplina(ALUNO_ID, List.of(10L))).thenReturn(List.of());

    assertThat(service.calcular(ALUNO_ID, List.of(10L))).containsEntry(10L, 0.0);
  }

  @Test
  void disciplinaSemEntregasNaoApareceNoResultado() {
    when(entregas.contarPorDisciplina(DISCIPLINAS))
        .thenReturn(List.of(new ContagemPorDisciplina(10L, 2)));
    when(progressos.contarConcluidasPorDisciplina(ALUNO_ID, DISCIPLINAS))
        .thenReturn(List.of(new ContagemPorDisciplina(10L, 2)));

    Map<Long, Double> resultado = service.calcular(ALUNO_ID, DISCIPLINAS);

    assertThat(resultado).containsOnlyKeys(10L).containsEntry(10L, 100.0);
  }

  @Test
  void semDisciplinasNaoConsultaOBanco() {
    assertThat(service.calcular(ALUNO_ID, List.of())).isEmpty();

    verifyNoInteractions(entregas, progressos);
  }
}
