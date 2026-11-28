package com.cancha.annotation.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** Dados para criar ou atualizar uma anotação. */
public record AnotacaoRequest(
    @NotBlank @Size(max = 120) String titulo,
    @NotBlank String texto) {}
