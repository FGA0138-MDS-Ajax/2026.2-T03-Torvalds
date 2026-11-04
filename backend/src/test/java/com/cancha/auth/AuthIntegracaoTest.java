package com.cancha.auth;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.cancha.auth.repository.AlunoRepository;
import com.cancha.auth.security.JwtService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

/** Verifica login e consulta do perfil com banco e segurança reais. */
@SpringBootTest
@AutoConfigureMockMvc
class AuthIntegracaoTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private AlunoRepository alunos;
    @Autowired private JwtService jwtService;

    @Test
    void loginCorretoRetornaToken() throws Exception {
        mockMvc
                .perform(
                        post("/auth/login")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content("""
                    {
                      "email": "aluno1@cancha.test",
                      "senha": "cancha-dev-123"
                    }
                    """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.senha").doesNotExist())
                .andExpect(jsonPath("$.senhaHash").doesNotExist());
    }

    @Test
    void senhaErradaRetorna401() throws Exception {
        verificaCredenciaisInvalidas("aluno1@cancha.test", "senha-errada");
    }

    @Test
    void emailNaoCadastradoRetorna401() throws Exception {
        verificaCredenciaisInvalidas("inexistente@cancha.test", "cancha-dev-123");
    }

    @Test
    void loginComCamposInvalidosRetorna400() throws Exception {
        mockMvc
                .perform(
                        post("/auth/login")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content("""
                    {"email": "email-invalido", "senha": ""}
                    """))
                .andExpect(status().isBadRequest());
    }

    @Test
    void meRetornaDadosDoAlunoDonoDoToken() throws Exception {
        var aluno = alunos.findByEmail("aluno2@cancha.test").orElseThrow();
        String token = jwtService.emitir(aluno.getId());

        mockMvc
                .perform(get("/me").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(aluno.getId().intValue()))
                .andExpect(jsonPath("$.nome").value(aluno.getNome()))
                .andExpect(jsonPath("$.email").value(aluno.getEmail()))
                .andExpect(jsonPath("$.matriculaUnB").value(aluno.getMatriculaUnB()))
                .andExpect(jsonPath("$.senha").doesNotExist())
                .andExpect(jsonPath("$.senhaHash").doesNotExist());
    }

    @Test
    void meSemTokenRetorna401() throws Exception {
        mockMvc.perform(get("/me")).andExpect(status().isUnauthorized());
    }

    private void verificaCredenciaisInvalidas(String email, String senha)
            throws Exception {
        mockMvc
                .perform(
                        post("/auth/login")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content("""
                    {"email": "%s", "senha": "%s"}
                    """.formatted(email, senha)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.mensagem").value("E-mail ou senha inválidos"));
    }

    @Test
    void tokenRecebidoNoLoginPermiteConsultarMeuPerfil() throws Exception {
        var resultado =
                mockMvc
                        .perform(
                                post("/auth/login")
                                        .contentType(MediaType.APPLICATION_JSON)
                                        .content("""
                        {
                          "email": "aluno2@cancha.test",
                          "senha": "cancha-dev-123"
                        }
                        """))
                        .andExpect(status().isOk())
                        .andReturn();

        String token =
                com.jayway.jsonpath.JsonPath.read(
                        resultado.getResponse().getContentAsString(), "$.token");

        mockMvc
                .perform(get("/me").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("aluno2@cancha.test"))
                .andExpect(jsonPath("$.senhaHash").doesNotExist());
    }
}