package com.cancha.agenda.model;

import com.cancha.auth.model.Aluno;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import java.time.LocalDateTime;

/** Regista o status individual de um aluno para uma entrega específica. */
@Entity
@Table(
    name = "progresso_atividade",
    uniqueConstraints = @UniqueConstraint(columnNames = {"aluno_id", "entrega_id"})
)
public class ProgressoAtividade {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "aluno_id", nullable = false)
  private Aluno aluno;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "entrega_id", nullable = false)
  private Entrega entrega;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 50)
  private StatusEntrega status;

  @Column(name = "data_conclusao")
  private LocalDateTime dataConclusao;

  protected ProgressoAtividade() {}

  public ProgressoAtividade(Aluno aluno, Entrega entrega, StatusEntrega status) {
    this.aluno = aluno;
    this.entrega = entrega;
    this.status = status;
  }

  public Long getId() { return id; }
  public Aluno getAluno() { return aluno; }
  public Entrega getEntrega() { return entrega; }
  public StatusEntrega getStatus() { return status; }
  public void setStatus(StatusEntrega status) { this.status = status; }
  public LocalDateTime getDataConclusao() { return dataConclusao; }
  public void setDataConclusao(LocalDateTime dataConclusao) { this.dataConclusao = dataConclusao; }
}