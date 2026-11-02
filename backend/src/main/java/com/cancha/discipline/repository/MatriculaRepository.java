package com.cancha.discipline.repository;

import com.cancha.discipline.model.Matricula;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

/** Acesso às matrículas dos alunos nas disciplinas. */
public interface MatriculaRepository extends JpaRepository<Matricula, Long> {

  /**
   * Matrículas de um único aluno, já com a disciplina carregada (evita uma consulta por
   * disciplina) e em ordem alfabética.
   */
  @Query(
      "select m from Matricula m join fetch m.disciplina d"
          + " where m.aluno.id = :alunoId order by d.nome")
  List<Matricula> listarDoAlunoComDisciplina(@Param("alunoId") Long alunoId);
}
