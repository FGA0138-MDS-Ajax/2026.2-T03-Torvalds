package com.cancha.discipline.service;

import com.cancha.discipline.dto.DisciplinaResumoResponse;
import com.cancha.discipline.model.Disciplina;
import com.cancha.discipline.model.Matricula;
import com.cancha.discipline.repository.MatriculaRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Regras de negócio das disciplinas do aluno. */
@Service
public class DisciplinaService {

  private final MatriculaRepository matriculas;

  public DisciplinaService(MatriculaRepository matriculas) {
    this.matriculas = matriculas;
  }

  /** Lista só as disciplinas em que o aluno informado está matriculado. */
  @Transactional(readOnly = true)
  public List<DisciplinaResumoResponse> listarDoAluno(Long alunoId) {
    return matriculas.listarDoAlunoComDisciplina(alunoId).stream().map(this::paraResumo).toList();
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
