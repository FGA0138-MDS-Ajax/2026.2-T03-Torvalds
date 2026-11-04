package com.cancha.auth.security;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;

import com.nimbusds.jose.JOSEException;
import com.nimbusds.jose.JOSEObjectType;
import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.JWSHeader;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.jdbc.core.JdbcTemplate;

import java.time.Instant;
import java.util.Date;
import javax.crypto.SecretKey;

/** Verifica a proteção dos endpoints por meio de requisições HTTP simuladas. */
@SpringBootTest
@AutoConfigureMockMvc
class SegurancaIntegracaoTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private SecretKey jwtSecretKey;
    @Autowired private JdbcTemplate jdbc;

    @Test
    void rotaProtegidaSemTokenRetorna401() throws Exception {
        mockMvc.perform(get("/disciplinas")).andExpect(status().isUnauthorized());
    }

    @Test
    void permitePreflightDoFrontendComAuthorization() throws Exception{
        mockMvc
                .perform(
                        options("/disciplinas")
                                .header("Origin", "http://localhost:5173")
                                .header("Access-Control-Request-Method", "GET")
                                .header("Access-Control-Request-Headers", "Authorization"))
                .andExpect(status().isOk())
                .andExpect(header().string("Access-Control-Allow-Origin", "http://localhost:5173"))
                .andExpect(
                        header()
                                .string(
                                        "Access-Control-Allow-Headers",
                                        org.hamcrest.Matchers.containsStringIgnoringCase("Authorization")));

    }

    @Test
    void tokenInvalidoRetorna401ComDesafioBearer() throws Exception {
        mockMvc
                .perform(get("/disciplinas").header("Authorization", "Bearer token-invalido"))
                .andExpect(status().isUnauthorized())
                .andExpect(
                        header()
                                .string(
                                        "WWW-Authenticate",
                                        org.hamcrest.Matchers.startsWith("Bearer")));
    }

    @Test
    void tokenValidoPermiteConsultarDisciplinas() throws Exception{
        String token = tokenAssinado(Instant.now().plusSeconds(3600));

        mockMvc
                .perform(get("/disciplinas").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk());
    }

    @Test
    void tokenExpiradoRetorna401() throws Exception{
        String token = tokenAssinado(Instant.now().minusSeconds(600));

        mockMvc
                .perform(get("/disciplinas").header("Authorization", "Bearer " + token))
                .andExpect(status().isUnauthorized());
    }

    private String tokenAssinado(Instant expiracao) throws JOSEException{
        Long alunoId =
                jdbc.queryForObject(
                        "select id from usuario where email = ?",
                        Long.class,
                        "aluno1@cancha.test"
                );

        JWTClaimsSet claims =
                new JWTClaimsSet.Builder()
                        .subject(alunoId.toString())
                        .issueTime(Date.from(Instant.now().minusSeconds(1200)))
                        .expirationTime(Date.from(expiracao))
                        .build();

        SignedJWT jwt =
                new SignedJWT(
                        new JWSHeader.Builder(JWSAlgorithm.HS256)
                                .type(JOSEObjectType.JWT)
                                .build(),
                        claims
                );

        jwt.sign(new MACSigner(jwtSecretKey.getEncoded()));
        return jwt.serialize();
    }
}