package com.cancha.auth.service;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyCollection;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.cancha.auth.dto.CadastroRequest;
import com.cancha.auth.exception.CadastroDuplicadoException;
import com.cancha.auth.model.Aluno;
import com.cancha.auth.repository.AlunoRepository;
import com.cancha.auth.security.JwtService;
import com.cancha.discipline.model.Disciplina;
import com.cancha.discipline.repository.DisciplinaRepository;
import com.cancha.discipline.repository.MatriculaRepository;
import java.sql.SQLException;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.dao.DataIntegrityViolationException;

class AuthServiceCadastroTest {

  private final AlunoRepository alunos = mock(AlunoRepository.class);
  private final DisciplinaRepository disciplinas = mock(DisciplinaRepository.class);
  private final MatriculaRepository matriculas = mock(MatriculaRepository.class);
  private final AuthService service =
      new AuthService(
          alunos,
          disciplinas,
          matriculas,
          mock(JwtService.class),
          mock(AlunoAtual.class));

  @BeforeEach
  void prepararCadastro() {
    when(alunos.existsByEmail("novo@cancha.test")).thenReturn(false);
    when(alunos.existsByMatriculaUnB("260000099")).thenReturn(false);
    when(disciplinas.findByNomeIn(anyCollection())).thenReturn(disciplinasDeExemplo());
  }

  @Test
  void falhaExplicitamenteSeDisciplinasDeExemploEstaoAusentes() {
    when(disciplinas.findByNomeIn(anyCollection())).thenReturn(List.of());

    assertThatThrownBy(() -> service.cadastrar(request("260000099")))
        .isInstanceOf(IllegalStateException.class)
        .hasMessageContaining("cinco disciplinas de exemplo");
  }

  @Test
  void conflitoDeUnicidadeNoBancoRetornaErroDeCadastroDuplicado() {
    var causa = new SQLException("duplicate key", "23505");
    when(alunos.saveAndFlush(any(Aluno.class)))
        .thenThrow(new DataIntegrityViolationException("duplicate key", causa));

    assertThatThrownBy(() -> service.cadastrar(request("260000099")))
        .isInstanceOf(CadastroDuplicadoException.class)
        .hasMessageContaining("já cadastrados");
  }

  @Test
  void violacaoDeIntegridadeQueNaoEhUnicidadeContinuaComoErroDoBanco() {
    var causa = new SQLException("foreign key", "23503");
    var erro = new DataIntegrityViolationException("foreign key", causa);
    when(alunos.saveAndFlush(any(Aluno.class))).thenThrow(erro);

    assertThatThrownBy(() -> service.cadastrar(request("260000099"))).isSameAs(erro);
  }

  private CadastroRequest request(String matriculaUnB) {
    return new CadastroRequest(
        "Novo Aluno",
        "novo@cancha.test",
        "senha-segura-123",
        "senha-segura-123",
        matriculaUnB);
  }

  private List<Disciplina> disciplinasDeExemplo() {
    return List.of(
        new Disciplina("Compiladores", "2026.2"),
        new Disciplina("Gestão e Produção da Qualidade", "2026.2"),
        new Disciplina("Projeto Integrador em Engenharia", "2026.2"),
        new Disciplina("Teoria dos Números", "2026.2"),
        new Disciplina("Métodos de Desenvolvimento de Software", "2026.2"));
  }
}
