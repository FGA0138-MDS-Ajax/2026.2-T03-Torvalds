package com.cancha.annotation.model;

import com.cancha.auth.model.Aluno;
import com.cancha.discipline.model.Disciplina;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.LocalDateTime;

/** Anotação privada de um aluno dentro de uma disciplina. */
@Entity
@Table(name = "anotacao")
public class Anotacao {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "aluno_id", nullable = false)
  private Aluno aluno;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "disciplina_id", nullable = false)
  private Disciplina disciplina;

  @Column(nullable = false, length = 120)
  private String titulo;

  @Column(nullable = false, columnDefinition = "TEXT")
  private String texto;

  @Column(name = "data_criacao", nullable = false, updatable = false)
  private LocalDateTime dataCriacao;

  protected Anotacao() {}

  public Anotacao(Aluno aluno, Disciplina disciplina, String titulo, String texto) {
    this.aluno = aluno;
    this.disciplina = disciplina;
    this.titulo = titulo;
    this.texto = texto;
    this.dataCriacao = LocalDateTime.now();
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

  public String getTitulo() {
    return titulo;
  }

  public void setTitulo(String titulo) {
    this.titulo = titulo;
  }

  public String getTexto() {
    return texto;
  }

  public void setTexto(String texto) {
    this.texto = texto;
  }

  public LocalDateTime getDataCriacao() {
    return dataCriacao;
  }
}
