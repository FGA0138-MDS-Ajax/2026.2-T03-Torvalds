package com.cancha.agenda.dto;

import java.time.LocalDateTime;

import com.cancha.agenda.model.StatusEntrega;

public record EntregaAgendaResponse (
    Long id,
    String titulo,
    String disciplina,
    String tipo,
    LocalDateTime prazo,
    StatusEntrega situacao){}
    

