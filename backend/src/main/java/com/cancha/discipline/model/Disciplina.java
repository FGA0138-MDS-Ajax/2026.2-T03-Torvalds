package com.cancha.discipline.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/** Matéria cursada pelos alunos. */
@Entity
@Table(name = "disciplina")
public class Disciplina {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false, length = 120)
  private String nome;

  @Column(name = "periodo_letivo", nullable = false, length = 10)
  private String periodoLetivo;

  protected Disciplina() {}

  public Disciplina(String nome, String periodoLetivo) {
    this.nome = nome;
    this.periodoLetivo = periodoLetivo;
  }

  public Long getId() {
    return id;
  }

  public String getNome() {
    return nome;
  }

  public void setNome(String nome) {
    this.nome = nome;
  }

  public String getPeriodoLetivo() {
    return periodoLetivo;
  }

  public void setPeriodoLetivo(String periodoLetivo) {
    this.periodoLetivo = periodoLetivo;
  }
}
