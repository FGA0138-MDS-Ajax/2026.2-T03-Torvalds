package com.cancha.agenda.service;

import com.cancha.agenda.dto.ProgressoResponse;
import com.cancha.agenda.repository.EntregaRepository;
import com.cancha.agenda.repository.ProgressoAtividadeRepository;
import com.cancha.discipline.repository.MatriculaRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Calcula o progresso agregado de entregas de um aluno em todas as disciplinas matriculadas. */
@Service
public class ProgressoService {

  private final MatriculaRepository matriculas;
  private final EntregaRepository entregas;
  private final ProgressoAtividadeRepository progressos;

  public ProgressoService(
      MatriculaRepository matriculas,
      EntregaRepository entregas,
      ProgressoAtividadeRepository progressos) {
    this.matriculas = matriculas;
    this.entregas = entregas;
    this.progressos = progressos;
  }

  @Transactional(readOnly = true)
  public ProgressoResponse calcular(Long alunoId) {
    List<Long> disciplinaIds =
        matriculas.listarDoAlunoComDisciplina(alunoId).stream()
            .map(matricula -> matricula.getDisciplina().getId())
            .toList();
    if (disciplinaIds.isEmpty()) {
      return new ProgressoResponse(0, 0, 0);
    }

    long total =
        entregas.contarPorDisciplina(disciplinaIds).stream()
            .mapToLong(contagem -> contagem.quantidade())
            .sum();
    long concluidas =
        progressos.contarConcluidasPorDisciplina(alunoId, disciplinaIds).stream()
            .mapToLong(contagem -> contagem.quantidade())
            .sum();
    int percentual = total == 0 ? 0 : (int) Math.round(concluidas * 100.0 / total);

    return new ProgressoResponse(concluidas, total, percentual);
  }
}
