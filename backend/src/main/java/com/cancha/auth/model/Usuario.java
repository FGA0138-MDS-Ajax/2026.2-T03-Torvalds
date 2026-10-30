package com.cancha.auth.model;

import jakarta.persistence.Column;
import jakarta.persistence.DiscriminatorColumn;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Inheritance;
import jakarta.persistence.InheritanceType;
import jakarta.persistence.Table;

/** Dados de identificação e autenticação comuns a todos os perfis de acesso. */
@Entity
@Table(name = "usuario")
@Inheritance(strategy = InheritanceType.JOINED)
@DiscriminatorColumn(name = "papel", length = 30)
public abstract class Usuario {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false, length = 120)
  private String nome;

  @Column(nullable = false, unique = true, length = 160)
  private String email;

  @Column(name = "senha_hash", nullable = false, length = 100)
  private String senhaHash;

  protected Usuario() {}

  protected Usuario(String nome, String email, String senhaHash) {
    this.nome = nome;
    this.email = email;
    this.senhaHash = senhaHash;
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

  public String getEmail() {
    return email;
  }

  public void setEmail(String email) {
    this.email = email;
  }

  public String getSenhaHash() {
    return senhaHash;
  }

  public void setSenhaHash(String senhaHash) {
    this.senhaHash = senhaHash;
  }
}
