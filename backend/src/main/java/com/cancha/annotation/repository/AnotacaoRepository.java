package com.cancha.annotation.repository;

import com.cancha.annotation.model.Anotacao;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

/** Acesso às anotações privadas dos alunos. */
public interface AnotacaoRepository extends JpaRepository<Anotacao, Long> {

  @Query(
      "select a from Anotacao a join fetch a.disciplina"
          + " where a.aluno.id = :alunoId and a.disciplina.id = :disciplinaId"
          + " order by a.dataCriacao desc, a.id desc")
  List<Anotacao> listarDaDisciplina(
      @Param("alunoId") Long alunoId, @Param("disciplinaId") Long disciplinaId);

  @Query(
      "select a from Anotacao a join fetch a.disciplina"
          + " where a.aluno.id = :alunoId order by a.dataCriacao desc, a.id desc")
  List<Anotacao> listarDoAluno(@Param("alunoId") Long alunoId);

  Optional<Anotacao> findByIdAndAluno_IdAndDisciplina_Id(
      Long id, Long alunoId, Long disciplinaId);
}
