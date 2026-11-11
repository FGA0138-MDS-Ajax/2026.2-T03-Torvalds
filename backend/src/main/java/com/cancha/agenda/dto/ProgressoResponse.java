package com.cancha.agenda.dto;

/** Resumo das entregas concluídas pelo aluno em todas as disciplinas em que está matriculado. */
public record ProgressoResponse(long concluidas, long total, int percentual) {}
