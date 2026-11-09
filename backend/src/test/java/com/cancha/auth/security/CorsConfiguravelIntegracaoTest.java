package com.cancha.auth.security;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;

/** As origens permitidas vêm da configuração, e não de um endereço fixo no código. */
@SpringBootTest(
    properties =
        "cancha.security.cors.allowed-origins=https://front.exemplo.com/, http://localhost:5173")
@AutoConfigureMockMvc
class CorsConfiguravelIntegracaoTest {

  @Autowired private MockMvc mockMvc;

  @Test
  void aceitaPreflightDoFrontendPublicado() throws Exception {
    preflight("https://front.exemplo.com")
        .andExpect(status().isOk())
        .andExpect(header().string("Access-Control-Allow-Origin", "https://front.exemplo.com"));
  }

  @Test
  void continuaAceitandoOFrontendLocalQuandoEleEstaNaLista() throws Exception {
    preflight("http://localhost:5173")
        .andExpect(status().isOk())
        .andExpect(header().string("Access-Control-Allow-Origin", "http://localhost:5173"));
  }

  @Test
  void recusaPreflightDeOrigemForaDaLista() throws Exception {
    preflight("https://intruso.exemplo.com")
        .andExpect(status().isForbidden())
        .andExpect(header().doesNotExist("Access-Control-Allow-Origin"));
  }

  private ResultActions preflight(String origem) throws Exception {
    return mockMvc.perform(
        options("/disciplinas")
            .header("Origin", origem)
            .header("Access-Control-Request-Method", "GET")
            .header("Access-Control-Request-Headers", "Authorization"));
  }
}
