package com.cancha.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** Credenciais recebidas exclusivamente para autenticação. */
public record LoginRequest(
        @NotBlank @Email @Size(max = 160) String email,
        @NotBlank @Size(max = 72) String senha) {}