package com.cancha.agenda.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record ConclusaoEntregaRequest(
    @NotBlank
    @Pattern(
        regexp = "CONCLUIDA",
        message = "O status deve ser CONCLUIDA.")
    String status) {}