package com.cancha.discipline.controller;

import com.cancha.auth.service.AlunoAtual;
import com.cancha.discipline.dto.DisciplinaResumoResponse;
import com.cancha.discipline.service.DisciplinaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/disciplinas")
@Tag(name = "Disciplinas")
public class DisciplinaController {

  private final DisciplinaService service;
  private final AlunoAtual alunoAtual;

  public DisciplinaController(DisciplinaService service, AlunoAtual alunoAtual) {
    this.service = service;
    this.alunoAtual = alunoAtual;
  }

  // O aluno vem de AlunoAtual, nunca da requisição: assim ninguém consegue pedir as disciplinas
  // de outra pessoa trocando um parâmetro.
  @GetMapping
  @Operation(summary = "Lista as disciplinas do aluno logado")
  public List<DisciplinaResumoResponse> listar() {
    return service.listarDoAluno(alunoAtual.id());
  }
}
