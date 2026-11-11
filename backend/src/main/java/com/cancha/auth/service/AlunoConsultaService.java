package com.cancha.auth.service;

import com.cancha.auth.model.Aluno;
import com.cancha.auth.repository.AlunoRepository;
import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Disponibiliza a consulta do aluno para os demais módulos. */
@Service
public class AlunoConsultaService {

  private final AlunoRepository alunos;

  public AlunoConsultaService(AlunoRepository alunos) {
    this.alunos = alunos;
  }

  @Transactional(readOnly = true)
  public Aluno buscar(Long alunoId) {
    return alunos
        .findById(alunoId)
        .orElseThrow(
            () -> new AuthenticationCredentialsNotFoundException(
                "Aluno autenticado não encontrado."));
  }
}