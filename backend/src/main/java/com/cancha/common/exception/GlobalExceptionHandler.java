package com.cancha.common.exception;

import com.cancha.common.exception.ApiError.CampoInvalido;
import jakarta.servlet.http.HttpServletRequest;
import java.time.Instant;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

/** Converte as exceções da API no formato único {@link ApiError}. */
@RestControllerAdvice
public class GlobalExceptionHandler {

  private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

  @ExceptionHandler(MethodArgumentNotValidException.class)
  public ResponseEntity<ApiError> tratarValidacao(
      MethodArgumentNotValidException ex, HttpServletRequest request) {
    List<CampoInvalido> campos =
        ex.getBindingResult().getFieldErrors().stream()
            .map(erro -> new CampoInvalido(erro.getField(), erro.getDefaultMessage()))
            .toList();
    return resposta(HttpStatus.BAD_REQUEST, "Dados inválidos.", request, campos);
  }

  @ExceptionHandler(HttpMessageNotReadableException.class)
  public ResponseEntity<ApiError> tratarCorpoIlegivel(
      HttpMessageNotReadableException ex, HttpServletRequest request) {
    return resposta(HttpStatus.BAD_REQUEST, "Corpo da requisição inválido.", request, null);
  }

  @ExceptionHandler(MethodArgumentTypeMismatchException.class)
  public ResponseEntity<ApiError> tratarTipoInvalido(
      MethodArgumentTypeMismatchException ex, HttpServletRequest request) {
    return resposta(
        HttpStatus.BAD_REQUEST, "Valor inválido para o parâmetro '" + ex.getName() + "'.", request, null);
  }

  @ExceptionHandler(RecursoNaoEncontradoException.class)
  public ResponseEntity<ApiError> tratarNaoEncontrado(
      RecursoNaoEncontradoException ex, HttpServletRequest request) {
    return resposta(HttpStatus.NOT_FOUND, ex.getMessage(), request, null);
  }

  @ExceptionHandler(NoResourceFoundException.class)
  public ResponseEntity<ApiError> tratarRotaInexistente(
      NoResourceFoundException ex, HttpServletRequest request) {
    return resposta(HttpStatus.NOT_FOUND, "Recurso não encontrado.", request, null);
  }

  @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
  public ResponseEntity<ApiError> tratarMetodoNaoSuportado(
      HttpRequestMethodNotSupportedException ex, HttpServletRequest request) {
    return resposta(HttpStatus.METHOD_NOT_ALLOWED, "Método HTTP não suportado.", request, null);
  }

  // Sem estes dois, o handler genérico abaixo transformaria 401/403 do Spring Security em 500.
  @ExceptionHandler(AccessDeniedException.class)
  public ResponseEntity<ApiError> tratarAcessoNegado(
      AccessDeniedException ex, HttpServletRequest request) {
    return resposta(HttpStatus.FORBIDDEN, "Acesso negado.", request, null);
  }

  @ExceptionHandler(AuthenticationException.class)
  public ResponseEntity<ApiError> tratarNaoAutenticado(
      AuthenticationException ex, HttpServletRequest request) {
    return resposta(HttpStatus.UNAUTHORIZED, "Autenticação necessária.", request, null);
  }

  @ExceptionHandler(Exception.class)
  public ResponseEntity<ApiError> tratarInesperado(Exception ex, HttpServletRequest request) {
    log.error("Erro inesperado em {}", request.getRequestURI(), ex);
    return resposta(HttpStatus.INTERNAL_SERVER_ERROR, "Erro interno do servidor.", request, null);
  }

  private ResponseEntity<ApiError> resposta(
      HttpStatus status, String mensagem, HttpServletRequest request, List<CampoInvalido> campos) {
    ApiError corpo =
        new ApiError(
            Instant.now(),
            status.value(),
            status.getReasonPhrase(),
            mensagem,
            request.getRequestURI(),
            campos);
    return ResponseEntity.status(status).body(corpo);
  }
}
