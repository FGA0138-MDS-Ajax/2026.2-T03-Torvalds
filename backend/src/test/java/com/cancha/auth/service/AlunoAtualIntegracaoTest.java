package com.cancha.auth.service;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.Instant;
import java.util.List;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;

/** Verifica se a identidade do aluno acompanha a autenticação da requisição. */
@SpringBootTest
public class AlunoAtualIntegracaoTest {

    @Autowired private AlunoAtual alunoAtual;
    @Autowired private JdbcTemplate jdbc;

    @AfterEach
    void limpaAutenticacao(){
        SecurityContextHolder.clearContext();
    }

    @Test
    void identificaOAlunoDoTokenEmVezDeUsarUmAlunoFixo(){
        Long aluno1 = idDoAluno("aluno1@cancha.test");
        Long aluno2 = idDoAluno("aluno2@cancha.test");

        autentica(aluno1);
        assertThat(alunoAtual.id()).isEqualTo(aluno1);

        autentica(aluno2);
        assertThat(alunoAtual.id()).isEqualTo(aluno2);
    }

    private Long idDoAluno(String email){
        return jdbc.queryForObject(
                "select id from usuario where email = ?", Long.class, email
        );
    }

    private void autentica(Long alunoId){
        Instant agora = Instant.now();

        Jwt jwt =
                Jwt.withTokenValue("token-simulado-apenas-para-este-teste")
                        .header("alg", "HS256")
                        .subject(alunoId.toString())
                        .issuedAt(agora)
                        .expiresAt(agora.plusSeconds(3600))
                        .build();

        var contexto = SecurityContextHolder.createEmptyContext();
        contexto.setAuthentication(new JwtAuthenticationToken(jwt, List.of()));
        SecurityContextHolder.setContext(contexto);
    }
}
