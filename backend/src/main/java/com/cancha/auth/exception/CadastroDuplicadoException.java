package com.cancha.auth.exception;

/** Indica que o e-mail ou a matrícula informados já pertencem a outra conta. */
public class CadastroDuplicadoException extends RuntimeException {

  public CadastroDuplicadoException(String message) {
    super(message);
  }
}
