package com.cancha.agenda.controller;

import com.cancha.agenda.dto.EntregaResponse;
import com.cancha.agenda.service.EntregaService;
import com.cancha.auth.service.AlunoAtual;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/disciplinas/{disciplinaId}/atividades")
@Tag(name = "Atividades")
public class AtividadeController {

  private final EntregaService service;
  private final AlunoAtual alunoAtual;

  public AtividadeController(EntregaService service, AlunoAtual alunoAtual) {
    this.service = service;
    this.alunoAtual = alunoAtual;
  }

  @GetMapping
  @Operation(summary = "Lista as atividades de uma disciplina")
  @ApiResponses({
    @ApiResponse(responseCode = "200", description = "Atividades da disciplina"),
    @ApiResponse(responseCode = "403", description = "Aluno não matriculado na disciplina"),
    @ApiResponse(responseCode = "404", description = "Disciplina não encontrada")
  })
  public List<EntregaResponse> listar(@PathVariable Long disciplinaId) {
    return service.listarDaDisciplina(alunoAtual.id(), disciplinaId);
  }
}
