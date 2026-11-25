package com.cancha.auth.service;

import com.cancha.auth.dto.AlunoResponse;
import com.cancha.auth.dto.LoginRequest;
import com.cancha.auth.dto.LoginResponse;
import com.cancha.auth.repository.AlunoRepository;
import com.cancha.auth.security.JwtService;
import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Valida credenciais e consulta o perfil do aluno autenticado. */
@Service
@Transactional(readOnly = true)
public class AuthService {

    private final AlunoRepository alunos;
    private final JwtService jwtService;
    private final AlunoAtual alunoAtual;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
    private final String hashSimulado;

    public AuthService(
            AlunoRepository alunos, JwtService jwtService, AlunoAtual alunoAtual) {
        this.alunos = alunos;
        this.jwtService = jwtService;
        this.alunoAtual = alunoAtual;
        this.hashSimulado = passwordEncoder.encode("comparacao-interna-sem-conta");
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
}