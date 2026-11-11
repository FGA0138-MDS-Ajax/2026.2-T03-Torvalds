package com.cancha.discipline.model;

import com.cancha.auth.model.Aluno;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import java.time.LocalDate;

/** Vínculo de um aluno com uma disciplina, com o progresso individual dele nela. */
@Entity
@Table(
    name = "matricula",
    uniqueConstraints =
        @UniqueConstraint(
            name = "uk_matricula_aluno_disciplina",
            columnNames = {"aluno_id", "disciplina_id"}))
public class Matricula {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "aluno_id", nullable = false)
  private Aluno aluno;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "disciplina_id", nullable = false)
  private Disciplina disciplina;

  @Column(name = "progresso_percentual", nullable = false)
  private double progressoPercentual;

  @Column(name = "data_matricula", nullable = false)
  private LocalDate dataMatricula;

  protected Matricula() {}

  public Matricula(Aluno aluno, Disciplina disciplina) {
    this.aluno = aluno;
    this.disciplina = disciplina;
    this.dataMatricula = LocalDate.now();
  }

  public Long getId() {
    return id;
  }

  public Aluno getAluno() {
    return aluno;
  }

  public Disciplina getDisciplina() {
    return disciplina;
  }

  public double getProgressoPercentual() {
    return progressoPercentual;
  }

  public void setProgressoPercentual(double progressoPercentual) {
    this.progressoPercentual = progressoPercentual;
  }

  public LocalDate getDataMatricula() {
    return dataMatricula;
  }
}
