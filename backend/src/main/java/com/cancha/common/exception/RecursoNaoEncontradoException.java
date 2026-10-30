package com.cancha.common.exception;

/** Lançada quando um recurso pedido não existe; vira HTTP 404. */
public class RecursoNaoEncontradoException extends RuntimeException {

  public RecursoNaoEncontradoException(String mensagem) {
    super(mensagem);
  }
}
