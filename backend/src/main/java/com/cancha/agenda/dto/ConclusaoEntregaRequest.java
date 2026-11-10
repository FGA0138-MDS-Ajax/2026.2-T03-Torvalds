package com.cancha.agenda.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

/** Situações permitidas para concluir ou desfazer a conclusão de uma entrega. */
public record ConclusaoEntregaRequest(
    @NotBlank
    @Pattern(
        regexp = "CONCLUIDA|A_FAZER",
        message = "O status deve ser CONCLUIDA ou A_FAZER.")
    String status) {}