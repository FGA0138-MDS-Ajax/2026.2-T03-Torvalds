package com.cancha.discipline.service;

import com.cancha.discipline.dto.DisciplinaResumoResponse;
import com.cancha.discipline.model.Disciplina;
import com.cancha.discipline.model.Matricula;
import com.cancha.discipline.repository.DisciplinaRepository;
import com.cancha.discipline.repository.MatriculaRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Regras de negócio das disciplinas do aluno. */
@Service
public class DisciplinaService {

  private final MatriculaRepository matriculas;
  private final DisciplinaRepository disciplinas;

  public DisciplinaService(
      MatriculaRepository matriculas, DisciplinaRepository disciplinas) {
    this.matriculas = matriculas;
    this.disciplinas = disciplinas;
  }

  /** Lista só as disciplinas em que o aluno informado está matriculado. */
  @Transactional(readOnly = true)
  public List<DisciplinaResumoResponse> listarDoAluno(Long alunoId) {
    return matriculas.listarDoAlunoComDisciplina(alunoId).stream().map(this::paraResumo).toList();
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

  private DisciplinaResumoResponse paraResumo(Matricula matricula) {
    Disciplina disciplina = matricula.getDisciplina();
    return new DisciplinaResumoResponse(
        disciplina.getId(),
        disciplina.getNome(),
        disciplina.getPeriodoLetivo(),
        matricula.getProgressoPercentual());
  }
}
