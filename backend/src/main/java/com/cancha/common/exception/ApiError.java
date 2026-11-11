package com.cancha.common.exception;

import java.time.Instant;
import java.util.List;

/**
 * Formato único de erro devolvido pela API. {@code campos} só vem preenchido em erros de validação
 * e lista cada campo inválido.
 */
public record ApiError(
    Instant timestamp,
    int status,
    String erro,
    String mensagem,
    String caminho,
    List<CampoInvalido> campos) {

  /** Campo que falhou na validação e o motivo. */
  public record CampoInvalido(String campo, String mensagem) {}
}
