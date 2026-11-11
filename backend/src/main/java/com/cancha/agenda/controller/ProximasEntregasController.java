package com.cancha.agenda.controller;

import com.cancha.agenda.dto.ProximaEntregaResponse;
import com.cancha.agenda.service.ProximasEntregasService;
import com.cancha.auth.service.AlunoAtual;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/atividades")
@Tag(name = "Atividades")
public class ProximasEntregasController {

  private final ProximasEntregasService service;
  private final AlunoAtual alunoAtual;

  public ProximasEntregasController(ProximasEntregasService service, AlunoAtual alunoAtual) {
    this.service = service;
    this.alunoAtual = alunoAtual;
  }

  @GetMapping("/proximas")
  @Operation(
      summary = "Lista as próximas entregas do aluno",
      description =
          "Até 5 entregas ainda não concluídas de todas as disciplinas do aluno, da mais urgente"
              + " para a menos urgente. Entregas com prazo vencido entram primeiro, marcadas como"
              + " atrasadas.")
  @ApiResponses({
    @ApiResponse(responseCode = "200", description = "Próximas entregas, no máximo 5"),
    @ApiResponse(responseCode = "401", description = "Sem token ou com token inválido")
  })
  public List<ProximaEntregaResponse> listar() {
    return service.listar(alunoAtual.id());
  }
}
