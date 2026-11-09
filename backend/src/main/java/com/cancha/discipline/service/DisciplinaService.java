package com.cancha.discipline.service;

import com.cancha.agenda.service.PercentualConcluidoService;
import com.cancha.discipline.dto.DisciplinaResumoResponse;
import com.cancha.discipline.model.Disciplina;
import com.cancha.discipline.model.Matricula;
import com.cancha.discipline.repository.DisciplinaRepository;
import com.cancha.discipline.repository.MatriculaRepository;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Regras de negócio das disciplinas do aluno. */
@Service
public class DisciplinaService {

  private final MatriculaRepository matriculas;
  private final DisciplinaRepository disciplinas;
  private final PercentualConcluidoService percentualConcluido;

  public DisciplinaService(
      MatriculaRepository matriculas,
      DisciplinaRepository disciplinas,
      PercentualConcluidoService percentualConcluido) {
    this.matriculas = matriculas;
    this.disciplinas = disciplinas;
    this.percentualConcluido = percentualConcluido;
  }

  /**
   * Lista só as disciplinas em que o aluno informado está matriculado, cada uma com o percentual
   * de entregas que ele já concluiu nela.
   */
  @Transactional(readOnly = true)
  public List<DisciplinaResumoResponse> listarDoAluno(Long alunoId) {
    List<Matricula> doAluno = matriculas.listarDoAlunoComDisciplina(alunoId);
    if (doAluno.isEmpty()) {
      return List.of();
    }

    List<Long> ids = doAluno.stream().map(matricula -> matricula.getDisciplina().getId()).toList();
    Map<Long, Double> percentuais = percentualConcluido.calcular(alunoId, ids);
    return doAluno.stream().map(matricula -> paraResumo(matricula, percentuais)).toList();
  }

  /** Informa se o aluno está matriculado na disciplina. */
  @Transactional(readOnly = true)
  public boolean estaMatriculado(Long alunoId, Long disciplinaId) {
    return matriculas.existsByAluno_IdAndDisciplina_Id(alunoId, disciplinaId);
  }

  /** Informa se a disciplina existe. */
  @Transactional(readOnly = true)
  public boolean existe(Long disciplinaId) {
    return disciplinas.existsById(disciplinaId);
  }

  // Sem entregas na disciplina não há percentual, então o progresso fica nulo.
  private DisciplinaResumoResponse paraResumo(Matricula matricula, Map<Long, Double> percentuais) {
    Disciplina disciplina = matricula.getDisciplina();
    return new DisciplinaResumoResponse(
        disciplina.getId(),
        disciplina.getNome(),
        disciplina.getPeriodoLetivo(),
        percentuais.get(disciplina.getId()));
  }
}
