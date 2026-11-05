package com.cancha.discipline.repository;

import com.cancha.discipline.model.Conteudo;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

/** Acesso aos materiais publicados para as disciplinas. */
public interface ConteudoRepository extends JpaRepository<Conteudo, Long> {

  @Query(
      "select c from Conteudo c"
          + " where c.disciplina.id = :disciplinaId"
          + " order by c.dataPublicacao desc, c.titulo")
  List<Conteudo> listarDaDisciplina(@Param("disciplinaId") Long disciplinaId);
}
