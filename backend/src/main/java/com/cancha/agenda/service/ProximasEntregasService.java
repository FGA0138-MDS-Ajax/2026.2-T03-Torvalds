package com.cancha.agenda.service;

import com.cancha.agenda.dto.ProximaEntregaResponse;
import com.cancha.agenda.model.StatusEntrega;
import com.cancha.discipline.dto.DisciplinaResumoResponse;
import com.cancha.discipline.service.DisciplinaService;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Stream;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Próximas entregas do aluno, somando todas as disciplinas em que ele está matriculado.
 *
 * <p>Reaproveita a listagem por disciplina do {@link EntregaService}, então os dados e a situação
 * de cada entrega são os mesmos da página da disciplina e da agenda.
 */
@Service
public class ProximasEntregasService {

  /** Quantas entregas a tela Início mostra. */
  public static final int LIMITE = 5;

  private final DisciplinaService disciplinas;
  private final EntregaService entregas;

  public ProximasEntregasService(DisciplinaService disciplinas, EntregaService entregas) {
    this.disciplinas = disciplinas;
    this.entregas = entregas;
  }

  /**
   * Entregas que o aluno ainda não concluiu, da mais urgente para a menos urgente (prazo mais
   * cedo primeiro, inclusive as que já venceram), no máximo {@value #LIMITE}.
   */
  @Transactional(readOnly = true)
  public List<ProximaEntregaResponse> listar(Long alunoId) {
    LocalDateTime agora = LocalDateTime.now();
    return disciplinas.listarDoAluno(alunoId).stream()
        .flatMap(disciplina -> naoConcluidas(alunoId, disciplina, agora))
        .sorted(
            Comparator.comparing(ProximaEntregaResponse::prazo)
                .thenComparing(ProximaEntregaResponse::id))
        .limit(LIMITE)
        .toList();
  }

  private Stream<ProximaEntregaResponse> naoConcluidas(
      Long alunoId, DisciplinaResumoResponse disciplina, LocalDateTime agora) {
    return entregas.listarDaDisciplina(alunoId, disciplina.id()).stream()
        .filter(entrega -> entrega.status() != StatusEntrega.CONCLUIDA)
        .map(
            entrega ->
                new ProximaEntregaResponse(
                    entrega.id(),
                    entrega.titulo(),
                    entrega.tipo(),
                    entrega.prazo(),
                    entrega.status(),
                    disciplina.id(),
                    disciplina.nome(),
                    entrega.prazo().isBefore(agora)));
  }
}
