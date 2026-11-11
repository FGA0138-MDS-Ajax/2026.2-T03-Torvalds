package com.cancha.discipline.dto;

import java.time.LocalDate;

/** Material de uma disciplina apresentado ao aluno. */
public record ConteudoResponse(
    Long id, String titulo, String tipo, String urlOuArquivo, LocalDate dataPublicacao) {}
