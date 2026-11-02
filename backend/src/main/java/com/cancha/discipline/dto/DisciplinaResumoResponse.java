package com.cancha.discipline.dto;

/** Disciplina como o aluno a vê na tela inicial: dados da matéria e o progresso dele nela. */
public record DisciplinaResumoResponse(
    Long id, String nome, String periodoLetivo, double progressoPercentual) {}
