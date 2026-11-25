package com.cancha.auth.controller;

import com.cancha.auth.dto.AlunoResponse;
import com.cancha.auth.dto.CadastroRequest;
import com.cancha.auth.dto.LoginRequest;
import com.cancha.auth.dto.LoginResponse;
import com.cancha.auth.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

/** Expõe login e consulta do perfil autenticado. */
@RestController
public class AuthController {

    private final AuthService service;

    public AuthController(AuthService service) {
        this.service = service;
    }

    @Operation(summary = "Cria uma conta de aluno")
    @ApiResponses({
      @ApiResponse(responseCode = "201", description = "Conta criada"),
      @ApiResponse(responseCode = "400", description = "Campos inválidos"),
      @ApiResponse(responseCode = "409", description = "E-mail ou matrícula já cadastrados")
    })
    @PostMapping("/auth/cadastro")
    @ResponseStatus(HttpStatus.CREATED)
    public AlunoResponse cadastrar(@Valid @RequestBody CadastroRequest request) {
        return service.cadastrar(request);
    }

    @Operation(summary = "Autentica o aluno e retorna um token JWT")
    @PostMapping("/auth/login")
    public LoginResponse login(@Valid @RequestBody LoginRequest request) {
        return service.login(request);
    }

    @Operation(summary = "Consulta o perfil do aluno autenticado")
    @GetMapping("/me")
    public AlunoResponse me() {
        return service.me();
    }
}