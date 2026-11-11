package com.cancha.agenda.dto;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;

public record AgendaResponse(
    @JsonProperty ("A_FAZER") List<EntregaAgendaResponse> aFazer,
    @JsonProperty ("EM_ANDAMENTO") List<EntregaAgendaResponse> emAndamento,
    @JsonProperty ("CONCLUIDA") List<EntregaAgendaResponse> concluida
) {
}
