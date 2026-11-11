package com.cancha.agenda.service;

import com.cancha.agenda.repository.ContagemPorDisciplina;
import com.cancha.agenda.repository.EntregaRepository;
import com.cancha.agenda.repository.ProgressoAtividadeRepository;
import java.util.Collection;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Calcula quanto de cada disciplina um aluno já concluiu, a partir das entregas. */
@Service
public class PercentualConcluidoService {

  private final EntregaRepository entregas;
  private final ProgressoAtividadeRepository progressos;

  public PercentualConcluidoService(
      EntregaRepository entregas, ProgressoAtividadeRepository progressos) {
    this.entregas = entregas;
    this.progressos = progressos;
  }

  /**
   * Percentual (0 a 100) de entregas concluídas pelo aluno em cada disciplina. Usa duas consultas
   * agrupadas, não importa quantas disciplinas sejam. Disciplina sem entregas não entra no
   * resultado: não há o que concluir, então o chamador deve tratar a ausência como "sem progresso".
   */
  @Transactional(readOnly = true)
  public Map<Long, Double> calcular(Long alunoId, Collection<Long> disciplinaIds) {
    if (disciplinaIds.isEmpty()) {
      return Map.of();
    }

    Map<Long, Long> concluidas =
        progressos.contarConcluidasPorDisciplina(alunoId, disciplinaIds).stream()
            .collect(
                Collectors.toMap(
                    ContagemPorDisciplina::disciplinaId, ContagemPorDisciplina::quantidade));

    Map<Long, Double> percentuais = new HashMap<>();
    for (ContagemPorDisciplina total : entregas.contarPorDisciplina(disciplinaIds)) {
      long feitas = concluidas.getOrDefault(total.disciplinaId(), 0L);
      percentuais.put(total.disciplinaId(), feitas * 100.0 / total.quantidade());
    }
    return percentuais;
  }
}
