package com.cancha.agenda.service;

import com.cancha.agenda.dto.EntregaResponse;
import com.cancha.agenda.model.Entrega;
import com.cancha.agenda.model.ProgressoAtividade;
import com.cancha.agenda.repository.EntregaRepository;
import com.cancha.agenda.repository.ProgressoAtividadeRepository;
import com.cancha.discipline.service.DisciplinaService;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Regras de negócio das entregas das disciplinas. */
@Service
public class EntregaService {

  private static final String STATUS_PADRAO = "A fazer";

  private final EntregaRepository entregas;
  private final ProgressoAtividadeRepository progressos;
  private final DisciplinaService disciplinas;

  public EntregaService(
      EntregaRepository entregas,
      ProgressoAtividadeRepository progressos,
      DisciplinaService disciplinas) {
    this.entregas = entregas;
    this.progressos = progressos;
    this.disciplinas = disciplinas;
  }

  /** Lista as entregas em ordem de prazo somente para alunos matriculados. */
  @Transactional(readOnly = true)
  public List<EntregaResponse> listarDaDisciplina(Long alunoId, Long disciplinaId) {
    if (!disciplinas.estaMatriculado(alunoId, disciplinaId)) {
      throw new AccessDeniedException("Aluno não matriculado na disciplina.");
    }

    Map<Long, String> statusPorEntrega =
        progressos.findByAluno_IdAndEntrega_Disciplina_Id(alunoId, disciplinaId).stream()
            .collect(
                Collectors.toMap(
                    progresso -> progresso.getEntrega().getId(), ProgressoAtividade::getStatus));

    return entregas.findByDisciplina_Id(disciplinaId).stream()
        .sorted(Comparator.comparing(Entrega::getPrazo))
        .map(entrega -> paraResposta(entrega, statusPorEntrega))
        .toList();
  }

  private EntregaResponse paraResposta(Entrega entrega, Map<Long, String> statusPorEntrega) {
    return new EntregaResponse(
        entrega.getId(),
        entrega.getTitulo(),
        entrega.getDescricao(),
        entrega.getTipo(),
        entrega.getPrazo(),
        statusPorEntrega.getOrDefault(entrega.getId(), STATUS_PADRAO));
  }
}
