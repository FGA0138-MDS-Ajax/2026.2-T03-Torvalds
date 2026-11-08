package com.cancha.agenda.repository;

import com.cancha.agenda.model.Entrega;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

/** Acesso às entregas das disciplinas. */
public interface EntregaRepository extends JpaRepository<Entrega, Long> {

  List<Entrega> findByDisciplina_Id(Long disciplinaId);
}
