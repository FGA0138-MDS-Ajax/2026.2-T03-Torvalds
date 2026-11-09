package com.cancha.auth.security;

import java.util.List;
import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Origens (endereços do frontend) autorizadas a chamar a API pelo navegador.
 *
 * <p>Vêm da variável de ambiente {@code CORS_ALLOWED_ORIGINS}, com os endereços separados por
 * vírgula. Sem configuração, vale só o frontend local ({@code http://localhost:5173}). Espaços e a
 * barra final são removidos, e valores que nunca casariam com uma origem real (coringa, sem
 * {@code http://} ou {@code https://}, ou com caminho) impedem a API de iniciar, com uma mensagem
 * que explica o erro.
 */
@ConfigurationProperties(prefix = "cancha.security.cors")
public record CorsProperties(List<String> allowedOrigins) {

  static final List<String> PADRAO = List.of("http://localhost:5173");

  public CorsProperties {
    List<String> origens =
        allowedOrigins == null
            ? List.of()
            : allowedOrigins.stream()
                .map(String::trim)
                .map(origem -> origem.replaceAll("/+$", ""))
                .filter(origem -> !origem.isEmpty())
                .toList();

    if (origens.isEmpty()) {
      origens = PADRAO;
    }

    for (String origem : origens) {
      validar(origem);
    }

    allowedOrigins = origens;
  }

  private static void validar(String origem) {
    if (origem.equals("*")) {
      throw new IllegalArgumentException(
          "CORS_ALLOWED_ORIGINS não aceita '*': informe os endereços do frontend.");
    }

    if (!origem.startsWith("http://") && !origem.startsWith("https://")) {
      throw new IllegalArgumentException(
          "Origem CORS inválida: '"
              + origem
              + "'. Use o endereço completo, com http:// ou https://.");
    }

    if (origem.substring(origem.indexOf("://") + 3).contains("/")) {
      throw new IllegalArgumentException(
          "Origem CORS inválida: '" + origem + "'. Informe só o endereço, sem caminho.");
    }
  }
}
