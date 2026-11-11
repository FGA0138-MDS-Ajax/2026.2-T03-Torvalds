package com.cancha.agenda.repository;

import com.cancha.agenda.model.Entrega;
import java.util.Collection;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

/** Acesso às entregas das disciplinas. */
public interface EntregaRepository extends JpaRepository<Entrega, Long> {

  List<Entrega> findByDisciplina_Id(Long disciplinaId);

  /** Total de entregas de cada disciplina pedida; disciplina sem entregas não aparece. */
  @Query(
      "select new com.cancha.agenda.repository.ContagemPorDisciplina(e.disciplina.id, count(e))"
          + " from Entrega e where e.disciplina.id in :disciplinaIds group by e.disciplina.id")
  List<ContagemPorDisciplina> contarPorDisciplina(
      @Param("disciplinaIds") Collection<Long> disciplinaIds);
}
