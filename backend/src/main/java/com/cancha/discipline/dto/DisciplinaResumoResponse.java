package com.cancha.discipline.dto;

import io.swagger.v3.oas.annotations.media.Schema;

/** Disciplina como o aluno a vê na tela inicial: dados da matéria e o progresso dele nela. */
public record DisciplinaResumoResponse(
    Long id,
    String nome,
    String periodoLetivo,
    @Schema(
            description =
                "Percentual (0 a 100) das entregas da disciplina que o aluno concluiu."
                    + " Nulo quando a disciplina ainda não tem entregas.",
            nullable = true)
        Double progressoPercentual) {}
