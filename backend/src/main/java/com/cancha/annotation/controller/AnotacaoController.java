package com.cancha.annotation.controller;

import com.cancha.annotation.dto.AnotacaoRequest;
import com.cancha.annotation.dto.AnotacaoResponse;
import com.cancha.annotation.service.AnotacaoService;
import com.cancha.auth.service.AlunoAtual;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@Tag(name = "Anotações")
public class AnotacaoController {

  private final AnotacaoService service;
  private final AlunoAtual alunoAtual;

  public AnotacaoController(AnotacaoService service, AlunoAtual alunoAtual) {
    this.service = service;
    this.alunoAtual = alunoAtual;
  }

  @GetMapping("/disciplinas/{disciplinaId}/anotacoes")
  @Operation(summary = "Lista as anotações do aluno em uma disciplina")
  public List<AnotacaoResponse> listarDaDisciplina(@PathVariable Long disciplinaId) {
    return service.listarDaDisciplina(alunoAtual.id(), disciplinaId);
  }

  @GetMapping("/anotacoes")
  @Operation(summary = "Lista todas as anotações do aluno")
  public List<AnotacaoResponse> listarDoAluno() {
    return service.listarDoAluno(alunoAtual.id());
  }

  @PostMapping("/disciplinas/{disciplinaId}/anotacoes")
  @ResponseStatus(HttpStatus.CREATED)
  @Operation(summary = "Cria uma anotação em uma disciplina")
  public AnotacaoResponse criar(
      @PathVariable Long disciplinaId, @Valid @RequestBody AnotacaoRequest request) {
    return service.criar(alunoAtual.id(), disciplinaId, request);
  }

  @PutMapping("/disciplinas/{disciplinaId}/anotacoes/{anotacaoId}")
  @Operation(summary = "Atualiza uma anotação do aluno")
  public AnotacaoResponse atualizar(
      @PathVariable Long disciplinaId,
      @PathVariable Long anotacaoId,
      @Valid @RequestBody AnotacaoRequest request) {
    return service.atualizar(alunoAtual.id(), disciplinaId, anotacaoId, request);
  }

  @DeleteMapping("/disciplinas/{disciplinaId}/anotacoes/{anotacaoId}")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  @Operation(summary = "Exclui uma anotação do aluno")
  public void excluir(@PathVariable Long disciplinaId, @PathVariable Long anotacaoId) {
    service.excluir(alunoAtual.id(), disciplinaId, anotacaoId);
  }
}
