package com.cancha.agenda.repository;

import com.cancha.agenda.model.ProgressoAtividade;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

/** Acesso aos status individuais das entregas. */
public interface ProgressoAtividadeRepository extends JpaRepository<ProgressoAtividade, Long> {

  @Query(
      "select p from ProgressoAtividade p join fetch p.entrega"
          + " where p.aluno.id = :alunoId and p.entrega.disciplina.id = :disciplinaId")
  List<ProgressoAtividade> findByAluno_IdAndEntrega_Disciplina_Id(
      @Param("alunoId") Long alunoId, @Param("disciplinaId") Long disciplinaId);
}
