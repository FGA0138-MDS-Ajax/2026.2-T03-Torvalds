package com.cancha.agenda.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.cancha.agenda.dto.AgendaResponse;
import com.cancha.agenda.service.AgendaService;
import com.cancha.auth.service.AlunoAtual;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController 
@RequestMapping("/agenda")
@Tag(name = "Agenda")
public class AgendaController {
    private final AgendaService service;
    private final AlunoAtual    alunoAtual;

    public AgendaController(AgendaService service, AlunoAtual alunoAtual){
        this.service = service;
        this.alunoAtual = alunoAtual;
    }

    @GetMapping 
    @Operation (
        summary = "Lista as entregas do aluno agrupadas por situação",
        description = "Retorna as entregas das disciplinas do aluno autenticado, agrupadas em A_FAZER,"
            + "EM_ANDAMENTO e CONCLUIDA. Cada grupo é ordenado por prazo.")
    
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Agenda do aluno"),
        @ApiResponse(responseCode = "401", description = "Sem token ou com token inválido")
    })
    public AgendaResponse listar(){
        return service.listar(alunoAtual.id());
    }
    
}
