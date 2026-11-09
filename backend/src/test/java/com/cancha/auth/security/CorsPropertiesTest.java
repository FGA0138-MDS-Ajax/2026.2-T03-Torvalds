package com.cancha.auth.security;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.util.List;
import org.junit.jupiter.api.Test;

class CorsPropertiesTest {

  private static final String LOCAL = "http://localhost:5173";

  @Test
  void usaSoOFrontendLocalQuandoNaoHaOrigemConfigurada() {
    assertThat(new CorsProperties(null).allowedOrigins()).containsExactly(LOCAL);
    assertThat(new CorsProperties(List.of()).allowedOrigins()).containsExactly(LOCAL);
    assertThat(new CorsProperties(List.of(" ", "")).allowedOrigins()).containsExactly(LOCAL);
  }

  @Test
  void removeEspacosEBarraFinalEMantemAOrdem() {
    CorsProperties propriedades =
        new CorsProperties(List.of(" https://front.exemplo.com/ ", "http://localhost:5173"));

    assertThat(propriedades.allowedOrigins())
        .containsExactly("https://front.exemplo.com", "http://localhost:5173");
  }

  @Test
  void recusaCoringa() {
    assertThatThrownBy(() -> new CorsProperties(List.of("*")))
        .isInstanceOf(IllegalArgumentException.class)
        .hasMessageContaining("'*'");
  }

  @Test
  void recusaOrigemSemEsquema() {
    assertThatThrownBy(() -> new CorsProperties(List.of("front.exemplo.com")))
        .isInstanceOf(IllegalArgumentException.class)
        .hasMessageContaining("front.exemplo.com")
        .hasMessageContaining("https://");
  }

  @Test
  void recusaOrigemComCaminho() {
    assertThatThrownBy(() -> new CorsProperties(List.of("https://front.exemplo.com/app")))
        .isInstanceOf(IllegalArgumentException.class)
        .hasMessageContaining("sem caminho");
  }
}
