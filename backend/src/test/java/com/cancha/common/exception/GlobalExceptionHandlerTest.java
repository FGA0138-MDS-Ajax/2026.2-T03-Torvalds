package com.cancha.common.exception;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

class GlobalExceptionHandlerTest {

  private MockMvc mvc;

  @BeforeEach
  void configurar() {
    mvc =
        MockMvcBuilders.standaloneSetup(new ControllerDeTeste())
            .setControllerAdvice(new GlobalExceptionHandler())
            .build();
  }

  @Test
  void validacaoDevolve400ComOsCamposInvalidos() throws Exception {
    mvc.perform(post("/teste/validacao").contentType(MediaType.APPLICATION_JSON).content("{\"nome\":\"\"}"))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.status").value(400))
        .andExpect(jsonPath("$.caminho").value("/teste/validacao"))
        .andExpect(jsonPath("$.campos[0].campo").value("nome"));
  }

  @Test
  void corpoIlegivelDevolve400() throws Exception {
    mvc.perform(post("/teste/validacao").contentType(MediaType.APPLICATION_JSON).content("{"))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.mensagem").value("Corpo da requisição inválido."));
  }

  @Test
  void recursoNaoEncontradoDevolve404() throws Exception {
    mvc.perform(get("/teste/nao-encontrado"))
        .andExpect(status().isNotFound())
        .andExpect(jsonPath("$.mensagem").value("Disciplina 99 não existe."));
  }

  @Test
  void acessoNegadoDevolve403EnaoEm500() throws Exception {
    mvc.perform(get("/teste/proibido")).andExpect(status().isForbidden());
  }

  @Test
  void erroInesperadoDevolve500SemVazarOMotivo() throws Exception {
    mvc.perform(get("/teste/erro"))
        .andExpect(status().isInternalServerError())
        .andExpect(jsonPath("$.mensagem").value("Erro interno do servidor."));
  }

  @RestController
  static class ControllerDeTeste {

    record Corpo(@NotBlank String nome) {}

    @PostMapping("/teste/validacao")
    void validar(@Valid @RequestBody Corpo corpo) {}

    @GetMapping("/teste/nao-encontrado")
    void naoEncontrado() {
      throw new RecursoNaoEncontradoException("Disciplina 99 não existe.");
    }

    @GetMapping("/teste/proibido")
    void proibido() {
      throw new AccessDeniedException("sem permissão");
    }

    @GetMapping("/teste/erro")
    void erro() {
      throw new IllegalStateException("detalhe interno que não pode vazar");
    }
  }
}
