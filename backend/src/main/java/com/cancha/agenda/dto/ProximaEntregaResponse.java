package com.cancha.agenda.dto;

import com.cancha.agenda.model.StatusEntrega;
import io.swagger.v3.oas.annotations.media.Schema;
import java.time.LocalDateTime;

/** Entrega ainda não concluída, como aparece na lista de próximas entregas da tela Início. */
public record ProximaEntregaResponse(
    Long id,
    String titulo,
    String tipo,
    LocalDateTime prazo,
    @Schema(description = "A_FAZER ou EM_ANDAMENTO. Entregas concluídas não entram na lista.")
        StatusEntrega status,
    Long disciplinaId,
    String disciplinaNome,
    @Schema(description = "Verdadeiro quando o prazo já passou e a entrega não foi concluída.")
        boolean atrasada) {}
