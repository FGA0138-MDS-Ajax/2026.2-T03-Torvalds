package com.cancha.agenda.service;

import java.util.Comparator;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.cancha.agenda.dto.AgendaResponse;
import com.cancha.agenda.dto.EntregaAgendaResponse;
import com.cancha.agenda.model.StatusEntrega;
import com.cancha.discipline.dto.DisciplinaResumoResponse;
import com.cancha.discipline.service.DisciplinaService;


@Service 
public class AgendaService {

    private final DisciplinaService disciplinas;
    private final EntregaService    entregas;

    public AgendaService (DisciplinaService disciplinas, EntregaService entregas){
        this.disciplinas = disciplinas;
        this.entregas = entregas;
    }
    
@Transactional(readOnly = true)

public AgendaResponse listar (long alunoId){
    List<EntregaAgendaResponse> todas = disciplinas.listarDoAluno(alunoId).stream()
    .flatMap(disciplina -> ListarEntregasDaDisciplina(alunoId, disciplina))
    .toList();

    return new AgendaResponse(
        ordenarPorPrazo(todas, StatusEntrega.A_FAZER),
        ordenarPorPrazo(todas, StatusEntrega.EM_ANDAMENTO),
        ordenarPorPrazo(todas, StatusEntrega.CONCLUIDA));
}

private java.util.stream.Stream<EntregaAgendaResponse> ListarEntregasDaDisciplina(
    Long alunoId, DisciplinaResumoResponse disciplina){
return entregas.listarDaDisciplina(alunoId, disciplina.id()).stream()
        .map(
            entrega ->
                new EntregaAgendaResponse(
                    entrega.id(),
                    entrega.titulo(),
                    disciplina.nome(),
                    entrega.tipo(),
                    entrega.prazo(),
                    entrega.status()
                )
        );
        

    }

    private List<EntregaAgendaResponse> ordenarPorPrazo(
        List<EntregaAgendaResponse> entregas, StatusEntrega situacao
    ){
        return entregas.stream()
        .filter(entrega -> entrega.situacao() == situacao)
        .sorted(Comparator.comparing(EntregaAgendaResponse::prazo))
        .toList();
    }


}
