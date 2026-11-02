package com.cancha.discipline.controller;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.cancha.auth.service.AlunoAtual;
import com.cancha.discipline.dto.DisciplinaResumoResponse;
import com.cancha.discipline.service.DisciplinaService;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class DisciplinaControllerTest {

  @Mock private DisciplinaService service;
  @Mock private AlunoAtual alunoAtual;
  @InjectMocks private DisciplinaController controller;

  @Test
  void listaAsDisciplinasDoAlunoDaRequisicao() {
    List<DisciplinaResumoResponse> esperado =
        List.of(new DisciplinaResumoResponse(10L, "Compiladores", "2026.2", 0));
    when(alunoAtual.id()).thenReturn(7L);
    when(service.listarDoAluno(7L)).thenReturn(esperado);

    assertThat(controller.listar()).isSameAs(esperado);
    verify(service).listarDoAluno(7L);
  }
}
