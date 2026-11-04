package com.cancha.auth.controller;

import com.cancha.auth.dto.AlunoResponse;
import com.cancha.auth.dto.LoginRequest;
import com.cancha.auth.dto.LoginResponse;
import com.cancha.auth.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

/** Expõe login e consulta do perfil autenticado. */
@RestController
public class AuthController {

    private final AuthService service;

    public AuthController(AuthService service) {
        this.service = service;
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