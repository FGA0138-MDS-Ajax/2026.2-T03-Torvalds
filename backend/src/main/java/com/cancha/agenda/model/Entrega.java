package com.cancha.agenda.model;

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

/** Representa uma atividade ou tarefa com prazo dentro de uma disciplina. */
@Entity
@Table(name = "entrega")
public class Entrega {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "disciplina_id", nullable = false)
  private Disciplina disciplina;

  @Column(nullable = false, length = 120)
  private String titulo;

  @Column(columnDefinition = "TEXT")
  private String descricao;

  @Column(nullable = false, length = 50)
  private String tipo;

  @Column(nullable = false)
  private LocalDateTime prazo;

  protected Entrega() {}

  public Entrega(Disciplina disciplina, String titulo, String descricao, String tipo, LocalDateTime prazo) {
    this.disciplina = disciplina;
    this.titulo = titulo;
    this.descricao = descricao;
    this.tipo = tipo;
    this.prazo = prazo;
  }

  public Long getId() { return id; }
  public Disciplina getDisciplina() { return disciplina; }
  public String getTitulo() { return titulo; }
  public void setTitulo(String titulo) { this.titulo = titulo; }
  public String getDescricao() { return descricao; }
  public void setDescricao(String descricao) { this.descricao = descricao; }
  public String getTipo() { return tipo; }
  public void setTipo(String tipo) { this.tipo = tipo; }
  public LocalDateTime getPrazo() { return prazo; }
  public void setPrazo(LocalDateTime prazo) { this.prazo = prazo; }
}