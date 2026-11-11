package com.cancha.discipline.controller;

import com.cancha.auth.service.AlunoAtual;
import com.cancha.discipline.dto.ConteudoResponse;
import com.cancha.discipline.service.ConteudoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/disciplinas/{disciplinaId}/conteudos")
@Tag(name = "Conteúdos")
public class ConteudoController {

  private final ConteudoService service;
  private final AlunoAtual alunoAtual;

  public ConteudoController(ConteudoService service, AlunoAtual alunoAtual) {
    this.service = service;
    this.alunoAtual = alunoAtual;
  }

  @GetMapping
  @Operation(summary = "Lista os materiais de uma disciplina")
  public List<ConteudoResponse> listar(@PathVariable Long disciplinaId) {
    return service.listarDaDisciplina(alunoAtual.id(), disciplinaId);
  }
}
