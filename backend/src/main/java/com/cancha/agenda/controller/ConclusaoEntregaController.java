package com.cancha.agenda.controller;
import com.cancha.agenda.model.StatusEntrega;

import com.cancha.agenda.dto.ConclusaoEntregaRequest;
import com.cancha.agenda.service.ConclusaoEntregaService;
import com.cancha.auth.service.AlunoAtual;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

/** Recebe a conclusão de uma entrega pelo aluno autenticado. */
@RestController
public class ConclusaoEntregaController {

  private final ConclusaoEntregaService service;
  private final AlunoAtual alunoAtual;

  public ConclusaoEntregaController(
      ConclusaoEntregaService service, AlunoAtual alunoAtual) {
    this.service = service;
    this.alunoAtual = alunoAtual;
  }

  @PatchMapping("/atividades/{id}/status")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  @Operation(summary = "Conclui, marca em andamento ou desfaz a conclusão de uma entrega")
  @ApiResponses({
    @ApiResponse(responseCode = "204", description = "Situação da entrega atualizada"),
    @ApiResponse(responseCode = "400", description = "Corpo da requisição inválido"),
    @ApiResponse(responseCode = "401", description = "Autenticação necessária"),
    @ApiResponse(responseCode = "403", description = "Aluno não matriculado"),
    @ApiResponse(responseCode = "404", description = "Atividade não encontrada")
  })
  public void atualizarStatus(
      @PathVariable Long id,
      @Valid @RequestBody ConclusaoEntregaRequest request) {
    service.atualizarStatus(
        alunoAtual.id(), id, StatusEntrega.valueOf(request.status()));
  }
}
