package com.cancha.auth.service;

import com.cancha.auth.dto.AlunoResponse;
import com.cancha.auth.dto.CadastroRequest;
import com.cancha.auth.dto.LoginRequest;
import com.cancha.auth.dto.LoginResponse;
import com.cancha.auth.exception.CadastroDuplicadoException;
import com.cancha.auth.model.Aluno;
import com.cancha.auth.repository.AlunoRepository;
import com.cancha.auth.security.JwtService;
import com.cancha.discipline.model.Matricula;
import com.cancha.discipline.repository.DisciplinaRepository;
import com.cancha.discipline.repository.MatriculaRepository;
import java.sql.SQLException;
import java.util.List;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Gerencia cadastro, autenticação e consulta do perfil do aluno autenticado. */
@Service
@Transactional(readOnly = true)
public class AuthService {

    private static final List<String> DISCIPLINAS_EXEMPLO =
            List.of(
                    "Compiladores",
                    "Gestão e Produção da Qualidade",
                    "Projeto Integrador em Engenharia",
                    "Teoria dos Números",
                    "Métodos de Desenvolvimento de Software");

    private final AlunoRepository alunos;
    private final DisciplinaRepository disciplinas;
    private final MatriculaRepository matriculas;
    private final JwtService jwtService;
    private final AlunoAtual alunoAtual;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
    private final String hashSimulado;

    public AuthService(
            AlunoRepository alunos,
            DisciplinaRepository disciplinas,
            MatriculaRepository matriculas,
            JwtService jwtService,
            AlunoAtual alunoAtual) {
        this.alunos = alunos;
        this.disciplinas = disciplinas;
        this.matriculas = matriculas;
        this.jwtService = jwtService;
        this.alunoAtual = alunoAtual;
        this.hashSimulado = passwordEncoder.encode("comparacao-interna-sem-conta");
    }

    @Transactional
    public AlunoResponse cadastrar(CadastroRequest request) {
        String matriculaUnB = request.matriculaUnB();
        if (matriculaUnB != null && matriculaUnB.isEmpty()) {
            matriculaUnB = null;
        }

        if (alunos.existsByEmail(request.email())) {
            throw new CadastroDuplicadoException("E-mail já cadastrado.");
        }
        if (matriculaUnB != null && alunos.existsByMatriculaUnB(matriculaUnB)) {
            throw new CadastroDuplicadoException("Matrícula UnB já cadastrada.");
        }

        var disciplinasExemplo = disciplinas.findByNomeIn(DISCIPLINAS_EXEMPLO);
        if (disciplinasExemplo.size() != DISCIPLINAS_EXEMPLO.size()) {
            throw new IllegalStateException(
                    "As cinco disciplinas de exemplo necessárias ao cadastro não estão disponíveis.");
        }

        var aluno =
                new Aluno(
                        request.nome(),
                        request.email(),
                        passwordEncoder.encode(request.senha()),
                        matriculaUnB);
        try {
            var alunoSalvo = alunos.saveAndFlush(aluno);
            matriculas.saveAll(
                    disciplinasExemplo.stream()
                            .map(disciplina -> new Matricula(alunoSalvo, disciplina))
                            .toList());
            return AlunoResponse.de(alunoSalvo);
        } catch (DataIntegrityViolationException ex) {
            if (isViolacaoDeUnicidade(ex)) {
                throw new CadastroDuplicadoException(
                        "E-mail ou matrícula UnB já cadastrados.");
            }
            throw ex;
        }
    }

    public LoginResponse login(LoginRequest request) {
        var aluno = alunos.findByEmail(request.email());

        // Executa BCrypt mesmo sem encontrar o e-mail, reduzindo diferenças de tempo
        String hash = aluno.map(a -> a.getSenhaHash()).orElse(hashSimulado);
        boolean senhaCorreta = passwordEncoder.matches(request.senha(), hash);

        if (aluno.isEmpty() || !senhaCorreta) {
            throw new BadCredentialsException("E-mail ou senha inválidos");
        }

        return new LoginResponse(jwtService.emitir(aluno.orElseThrow().getId()));
    }

    public AlunoResponse me() {
        var aluno =
                alunos
                        .findById(alunoAtual.id())
                        .orElseThrow(
                                () ->
                                        new AuthenticationCredentialsNotFoundException(
                                                "Aluno autenticado não encontrado."));

        return AlunoResponse.de(aluno);
    }

    private boolean isViolacaoDeUnicidade(Throwable ex) {
        for (Throwable causa = ex; causa != null; causa = causa.getCause()) {
            if (causa instanceof SQLException sqlException
                    && "23505".equals(sqlException.getSQLState())) {
                return true;
            }
        }
        return false;
    }
}