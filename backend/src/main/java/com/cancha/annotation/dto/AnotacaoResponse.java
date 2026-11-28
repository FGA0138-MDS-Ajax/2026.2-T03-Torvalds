package com.cancha.annotation.dto;

import java.time.LocalDateTime;

/** Anotação visível somente ao aluno proprietário. */
public record AnotacaoResponse(
    Long id,
    Long disciplinaId,
    String disciplinaNome,
    String titulo,
    String texto,
    LocalDateTime dataCriacao) {}
