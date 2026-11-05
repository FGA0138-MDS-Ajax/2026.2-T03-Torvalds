package com.cancha.discipline.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.LocalDate;

/** Material de apoio publicado para uma disciplina. */
@Entity
@Table(name = "conteudo")
public class Conteudo {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "disciplina_id", nullable = false)
  private Disciplina disciplina;

  @Column(nullable = false, length = 120)
  private String titulo;

  @Column(nullable = false, length = 50)
  private String tipo;

  @Column(name = "url_ou_arquivo", nullable = false, length = 2048)
  private String urlOuArquivo;

  @Column(name = "data_publicacao", nullable = false)
  private LocalDate dataPublicacao;

  protected Conteudo() {}

  public Conteudo(
      Disciplina disciplina,
      String titulo,
      String tipo,
      String urlOuArquivo,
      LocalDate dataPublicacao) {
    this.disciplina = disciplina;
    this.titulo = titulo;
    this.tipo = tipo;
    this.urlOuArquivo = urlOuArquivo;
    this.dataPublicacao = dataPublicacao;
  }

  public Long getId() {
    return id;
  }

  public Disciplina getDisciplina() {
    return disciplina;
  }

  public String getTitulo() {
    return titulo;
  }

  public String getTipo() {
    return tipo;
  }

  public String getUrlOuArquivo() {
    return urlOuArquivo;
  }

  public LocalDate getDataPublicacao() {
    return dataPublicacao;
  }
}
