package com.cancha.agenda.dto;

import java.time.LocalDateTime;

/** Entrega apresentada ao aluno com o status do seu progresso. */
public record EntregaResponse(
    Long id, String titulo, String descricao, String tipo, LocalDateTime prazo, String status) {}
