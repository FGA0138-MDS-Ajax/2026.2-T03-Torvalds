package com.cancha.discipline.service;

import com.cancha.discipline.dto.ConteudoResponse;
import com.cancha.discipline.model.Conteudo;
import com.cancha.discipline.repository.ConteudoRepository;
import com.cancha.discipline.repository.MatriculaRepository;
import java.util.List;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Regras de negócio dos materiais das disciplinas. */
@Service
public class ConteudoService {

  private final ConteudoRepository conteudos;
  private final MatriculaRepository matriculas;

  public ConteudoService(ConteudoRepository conteudos, MatriculaRepository matriculas) {
    this.conteudos = conteudos;
    this.matriculas = matriculas;
  }

  /** Lista os materiais somente quando o aluno está matriculado na disciplina. */
  @Transactional(readOnly = true)
  public List<ConteudoResponse> listarDaDisciplina(Long alunoId, Long disciplinaId) {
    if (!matriculas.existsByAluno_IdAndDisciplina_Id(alunoId, disciplinaId)) {
      throw new AccessDeniedException("Aluno não matriculado na disciplina.");
    }

    return conteudos.listarDaDisciplina(disciplinaId).stream().map(this::paraResposta).toList();
  }

  private ConteudoResponse paraResposta(Conteudo conteudo) {
    return new ConteudoResponse(
        conteudo.getId(),
        conteudo.getTitulo(),
        conteudo.getTipo(),
        conteudo.getUrlOuArquivo(),
        conteudo.getDataPublicacao());
  }
}
