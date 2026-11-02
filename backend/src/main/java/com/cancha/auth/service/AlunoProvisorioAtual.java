package com.cancha.auth.service;

import com.cancha.auth.model.Aluno;
import com.cancha.auth.repository.AlunoRepository;
import com.cancha.common.exception.RecursoNaoEncontradoException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/**
 * PROVISÓRIO: devolve sempre o mesmo aluno do seed, porque o login com JWT ainda não existe.
 *
 * <p>TODO(login): quando o módulo auth emitir e validar o JWT, apagar esta classe e criar uma
 * implementação de {@link AlunoAtual} que leia o aluno do usuário autenticado. Nenhum outro
 * código precisa mudar.
 */
@Component
public class AlunoProvisorioAtual implements AlunoAtual {

  private final AlunoRepository alunos;
  private final String email;

  public AlunoProvisorioAtual(
      AlunoRepository alunos,
      @Value("${cancha.aluno-provisorio-email:aluno1@cancha.test}") String email) {
    this.alunos = alunos;
    this.email = email;
  }

  @Override
  public Long id() {
    return alunos
        .findByEmail(email)
        .map(Aluno::getId)
        .orElseThrow(
            () -> new RecursoNaoEncontradoException("Aluno provisório não encontrado: " + email));
  }
}
