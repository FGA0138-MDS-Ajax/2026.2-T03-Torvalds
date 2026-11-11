package com.cancha.auth.model;

import jakarta.persistence.Column;
import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

/** Estudante que acompanha disciplinas, prazos e progresso. */
@Entity
@DiscriminatorValue("ALUNO")
@Table(name = "aluno")
public class Aluno extends Usuario {

  @Column(name = "matricula_unb", nullable = false, unique = true, length = 20)
  private String matriculaUnB;

  protected Aluno() {}

  public Aluno(String nome, String email, String senhaHash, String matriculaUnB) {
    super(nome, email, senhaHash);
    this.matriculaUnB = matriculaUnB;
  }

  public String getMatriculaUnB() {
    return matriculaUnB;
  }

  public void setMatriculaUnB(String matriculaUnB) {
    this.matriculaUnB = matriculaUnB;
  }
}
