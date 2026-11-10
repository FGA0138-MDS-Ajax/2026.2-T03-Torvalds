package com.cancha.agenda.controller;

import com.cancha.agenda.dto.ProgressoResponse;
import com.cancha.agenda.service.ProgressoService;
import com.cancha.auth.service.AlunoAtual;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/progresso")
@Tag(name = "Progresso")
public class ProgressoController {

  private final ProgressoService service;
  private final AlunoAtual alunoAtual;

  public ProgressoController(ProgressoService service, AlunoAtual alunoAtual) {
    this.service = service;
    this.alunoAtual = alunoAtual;
  }

  @GetMapping
  @Operation(
      summary = "Retorna o progresso do aluno no semestre",
      description =
          "Soma as entregas concluídas e o total em todas as disciplinas em que o aluno está"
              + " matriculado e calcula o percentual agregado.")
  @ApiResponses({
    @ApiResponse(responseCode = "200", description = "Progresso do aluno"),
    @ApiResponse(responseCode = "401", description = "Sem token ou com token inválido")
  })
  public ProgressoResponse consultar() {
    return service.calcular(alunoAtual.id());
  }
}
