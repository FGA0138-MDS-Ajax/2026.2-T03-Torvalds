package com.cancha.discipline.repository;

import com.cancha.discipline.model.Disciplina;
import java.util.Collection;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

/** Acesso às disciplinas. */
public interface DisciplinaRepository extends JpaRepository<Disciplina, Long> {

  List<Disciplina> findByNomeIn(Collection<String> nomes);
}
