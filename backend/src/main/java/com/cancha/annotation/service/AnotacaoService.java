package com.cancha.annotation.service;

import com.cancha.annotation.dto.AnotacaoRequest;
import com.cancha.annotation.dto.AnotacaoResponse;
import com.cancha.annotation.model.Anotacao;
import com.cancha.annotation.repository.AnotacaoRepository;
import com.cancha.auth.service.AlunoConsultaService;
import com.cancha.common.exception.RecursoNaoEncontradoException;
import com.cancha.discipline.model.Disciplina;
import com.cancha.discipline.repository.DisciplinaRepository;
import com.cancha.discipline.repository.MatriculaRepository;
import java.util.List;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Regras de negócio das anotações pessoais dos alunos. */
@Service
public class AnotacaoService {

  private final AnotacaoRepository anotacoes;
  private final AlunoConsultaService alunos;
  private final DisciplinaRepository disciplinas;
  private final MatriculaRepository matriculas;

  public AnotacaoService(
      AnotacaoRepository anotacoes,
      AlunoConsultaService alunos,
      DisciplinaRepository disciplinas,
      MatriculaRepository matriculas) {
    this.anotacoes = anotacoes;
    this.alunos = alunos;
    this.disciplinas = disciplinas;
    this.matriculas = matriculas;
  }

  @Transactional(readOnly = true)
  public List<AnotacaoResponse> listarDaDisciplina(Long alunoId, Long disciplinaId) {
    validarAcessoADisciplina(alunoId, disciplinaId);
    return anotacoes.listarDaDisciplina(alunoId, disciplinaId).stream()
        .map(this::paraResposta)
        .toList();
  }

  @Transactional(readOnly = true)
  public List<AnotacaoResponse> listarDoAluno(Long alunoId) {
    return anotacoes.listarDoAluno(alunoId).stream().map(this::paraResposta).toList();
  }

  @Transactional
  public AnotacaoResponse criar(Long alunoId, Long disciplinaId, AnotacaoRequest request) {
    validarAcessoADisciplina(alunoId, disciplinaId);
    Disciplina disciplina =
        disciplinas
            .findById(disciplinaId)
            .orElseThrow(
                () -> new RecursoNaoEncontradoException("Disciplina não encontrada."));
    Anotacao anotacao =
        anotacoes.save(
            new Anotacao(alunos.buscar(alunoId), disciplina, request.titulo(), request.texto()));
    return paraResposta(anotacao);
  }

  @Transactional
  public AnotacaoResponse atualizar(
      Long alunoId, Long disciplinaId, Long anotacaoId, AnotacaoRequest request) {
    Anotacao anotacao = buscarDoAluno(alunoId, disciplinaId, anotacaoId);
    anotacao.setTitulo(request.titulo());
    anotacao.setTexto(request.texto());
    return paraResposta(anotacao);
  }

  @Transactional
  public void excluir(Long alunoId, Long disciplinaId, Long anotacaoId) {
    anotacoes.delete(buscarDoAluno(alunoId, disciplinaId, anotacaoId));
  }

  private void validarAcessoADisciplina(Long alunoId, Long disciplinaId) {
    if (!disciplinas.existsById(disciplinaId)) {
      throw new RecursoNaoEncontradoException("Disciplina não encontrada.");
    }
    if (!matriculas.existsByAluno_IdAndDisciplina_Id(alunoId, disciplinaId)) {
      throw new AccessDeniedException("Aluno não matriculado na disciplina.");
    }
  }

  private Anotacao buscarDoAluno(Long alunoId, Long disciplinaId, Long anotacaoId) {
    return anotacoes
        .findByIdAndAluno_IdAndDisciplina_Id(anotacaoId, alunoId, disciplinaId)
        .orElseThrow(
            () -> new RecursoNaoEncontradoException("Anotação não encontrada."));
  }

  private AnotacaoResponse paraResposta(Anotacao anotacao) {
    return new AnotacaoResponse(
        anotacao.getId(),
        anotacao.getDisciplina().getId(),
        anotacao.getDisciplina().getNome(),
        anotacao.getTitulo(),
        anotacao.getTexto(),
        anotacao.getDataCriacao());
  }
}
