package com.cancha.agenda.service;

import com.cancha.agenda.model.Entrega;
import com.cancha.agenda.model.ProgressoAtividade;
import com.cancha.agenda.model.StatusEntrega;
import com.cancha.agenda.repository.EntregaRepository;
import com.cancha.agenda.repository.ProgressoAtividadeRepository;
import com.cancha.auth.service.AlunoConsultaService;
import com.cancha.common.exception.RecursoNaoEncontradoException;
import com.cancha.discipline.service.DisciplinaService;
import java.time.LocalDateTime;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Registra a conclusão individual de uma entrega. */
@Service
public class ConclusaoEntregaService {

  private final EntregaRepository entregas;
  private final ProgressoAtividadeRepository progressos;
  private final DisciplinaService disciplinas;
  private final AlunoConsultaService alunos;

  public ConclusaoEntregaService(
      EntregaRepository entregas,
      ProgressoAtividadeRepository progressos,
      DisciplinaService disciplinas,
      AlunoConsultaService alunos) {
    this.entregas = entregas;
    this.progressos = progressos;
    this.disciplinas = disciplinas;
    this.alunos = alunos;
  }

  @Transactional
  public void concluir(Long alunoId, Long entregaId) {
    Entrega entrega =
        entregas
            .findById(entregaId)
            .orElseThrow(
                () -> new RecursoNaoEncontradoException("Atividade não encontrada."));

    if (!disciplinas.estaMatriculado(alunoId, entrega.getDisciplina().getId())) {
      throw new AccessDeniedException("Aluno não matriculado na disciplina.");
    }

    ProgressoAtividade progresso =
        progressos
            .findByAluno_IdAndEntrega_Id(alunoId, entregaId)
            .orElseGet(
                () -> new ProgressoAtividade(
                    alunos.buscar(alunoId), entrega, StatusEntrega.A_FAZER));

    
    if (progresso.getStatus() != StatusEntrega.CONCLUIDA
        || progresso.getDataConclusao() == null) {
      progresso.setDataConclusao(LocalDateTime.now());
    }

    progresso.setStatus(StatusEntrega.CONCLUIDA);
    progressos.save(progresso);
  }
}