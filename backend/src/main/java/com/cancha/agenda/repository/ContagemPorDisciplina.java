package com.cancha.agenda.repository;

/** Quantidade de entregas de uma disciplina, devolvida pelas consultas agrupadas. */
public record ContagemPorDisciplina(Long disciplinaId, long quantidade) {}
