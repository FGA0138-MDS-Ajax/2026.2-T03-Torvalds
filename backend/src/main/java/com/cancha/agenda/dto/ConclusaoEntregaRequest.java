package com.cancha.agenda.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

/** Situações que o aluno pode dar a uma entrega: concluída, em andamento ou a fazer. */
public record ConclusaoEntregaRequest(
    @NotBlank
    @Pattern(
        regexp = "CONCLUIDA|EM_ANDAMENTO|A_FAZER",
        message = "O status deve ser CONCLUIDA, EM_ANDAMENTO ou A_FAZER.")
    String status) {}
