package com.cancha.auth.repository;

import com.cancha.auth.model.Aluno;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

/** Acesso aos alunos cadastrados. */
public interface AlunoRepository extends JpaRepository<Aluno, Long> {

  Optional<Aluno> findByEmail(String email);
}
