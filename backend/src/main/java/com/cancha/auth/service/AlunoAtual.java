package com.cancha.auth.service;

/**
 * Identifica o aluno que está fazendo a requisição.
 *
 * <p>Os outros módulos dependem só desta interface, nunca de como o aluno é descoberto. Quando o
 * login com JWT existir, basta trocar a implementação por uma que leia o usuário autenticado.
 */
public interface AlunoAtual {

  /** Id do aluno da requisição em andamento. */
  Long id();
}
