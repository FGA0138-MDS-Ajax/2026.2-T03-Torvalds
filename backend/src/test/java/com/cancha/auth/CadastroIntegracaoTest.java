package com.cancha.auth;

import static org.assertj.core.api.Assertions.assertThat;
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
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class CadastroIntegracaoTest {

  @Autowired private MockMvc mockMvc;
  @Autowired private JdbcTemplate jdbc;
  @Autowired private AlunoRepository alunos;
  @Autowired private JwtService jwtService;

  @Test
  void cadastroComMatriculaGuardaSenhaComHashEMatriculaNasDisciplinasDeExemplo()
      throws Exception {
    mockMvc
        .perform(
            post("/auth/cadastro")
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    """
                    {
                      "nome": "Nova Aluna",
                      "email": "nova.aluna@cancha.test",
                      "senha": "senha-segura-123",
                      "confirmacaoSenha": "senha-segura-123",
                      "matriculaUnB": "260000099"
                    }
                    """))
        .andExpect(status().isCreated())
        .andExpect(jsonPath("$.nome").value("Nova Aluna"))
        .andExpect(jsonPath("$.email").value("nova.aluna@cancha.test"))
        .andExpect(jsonPath("$.matriculaUnB").value("260000099"))
        .andExpect(jsonPath("$.senha").doesNotExist())
        .andExpect(jsonPath("$.senhaHash").doesNotExist());

    String hash =
        jdbc.queryForObject(
            "select senha_hash from usuario where email = ?",
            String.class,
            "nova.aluna@cancha.test");
    assertThat(new BCryptPasswordEncoder().matches("senha-segura-123", hash)).isTrue();
    assertMatriculadaNasDisciplinasDeExemplo("nova.aluna@cancha.test");
  }

  @Test
  void cadastroSemMatriculaAceitaCampoVazioEPermiteLogin() throws Exception {
    mockMvc
        .perform(
            post("/auth/cadastro")
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    """
                    {
                      "nome": "Aluno Sem Matrícula",
                      "email": "sem.matricula@cancha.test",
                      "senha": "senha-segura-123",
                      "confirmacaoSenha": "senha-segura-123",
                      "matriculaUnB": ""
                    }
                    """))
        .andExpect(status().isCreated());

    mockMvc
        .perform(
            post("/auth/cadastro")
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    """
                    {
                      "nome": "Outro Aluno Sem Matrícula",
                      "email": "sem.matricula2@cancha.test",
                      "senha": "senha-segura-123",
                      "confirmacaoSenha": "senha-segura-123"
                    }
                    """))
        .andExpect(status().isCreated());

    mockMvc
        .perform(
            post("/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    """
                    {
                      "email": "sem.matricula@cancha.test",
                      "senha": "senha-segura-123"
                    }
                    """))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.token").isNotEmpty());

    String matricula =
        jdbc.queryForObject(
            "select matricula_unb from aluno join usuario using (id) where email = ?",
            String.class,
            "sem.matricula@cancha.test");
    assertThat(matricula).isNull();
    assertMatriculadaNasDisciplinasDeExemplo("sem.matricula@cancha.test");
  }

  @Test
  void emailOuMatriculaDuplicadosRetornam409() throws Exception {
    mockMvc
        .perform(
            post("/auth/cadastro")
                .contentType(MediaType.APPLICATION_JSON)
                .content(cadastroJson("Novo Aluno", "aluno1@cancha.test", null)))
        .andExpect(status().isConflict());

    mockMvc
        .perform(
            post("/auth/cadastro")
                .contentType(MediaType.APPLICATION_JSON)
                .content(cadastroJson("Novo Aluno", "novo@cancha.test", "260000001")))
        .andExpect(status().isConflict());
  }

  @Test
  void cadastroComCamposInvalidosRetorna400() throws Exception {
    mockMvc
        .perform(
            post("/auth/cadastro")
                .contentType(MediaType.APPLICATION_JSON)
                .content(cadastroJson("Novo Aluno", "email-invalido", "260000099", "curta")))
        .andExpect(status().isBadRequest());

    mockMvc
        .perform(
            post("/auth/cadastro")
                .contentType(MediaType.APPLICATION_JSON)
                .content(cadastroJson("Novo Aluno", "novo@cancha.test", "260000099", "1234567")))
        .andExpect(status().isBadRequest());

    mockMvc
        .perform(
            post("/auth/cadastro")
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    cadastroJson(
                        "Novo Aluno",
                        "novo@cancha.test",
                        "matricula-curta",
                        "senha-segura-123")))
        .andExpect(status().isBadRequest());
  }

  @Test
  void cadastroComSenhaDiferenteDaConfirmacaoRetorna400ENaoCriaConta() throws Exception {
    mockMvc
        .perform(
            post("/auth/cadastro")
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    """
                    {
                      "nome": "Teste",
                      "email": "novo@cancha.test",
                      "senha": "senha-forte-123",
                      "confirmacaoSenha": "senha-forte-999"
                    }
                    """))
        .andExpect(status().isBadRequest());

    assertThat(alunos.findByEmail("novo@cancha.test")).isEmpty();
  }

  @Test
  void alunoNovoNaoVeDisciplinaMatriculadaParaOutroAluno() throws Exception {
    jdbc.update(
        "insert into disciplina (nome, periodo_letivo) values (?, ?)",
        "Exclusiva de outro aluno",
        "2026.2");
    Long disciplinaId =
        jdbc.queryForObject(
            "select id from disciplina where nome = ?",
            Long.class,
            "Exclusiva de outro aluno");
    Long alunoExistenteId =
        jdbc.queryForObject(
            "select id from usuario where email = ?", Long.class, "aluno2@cancha.test");
    jdbc.update(
        "insert into matricula (aluno_id, disciplina_id, progresso_percentual, data_matricula)"
            + " values (?, ?, 0, current_date)",
        alunoExistenteId,
        disciplinaId);

    mockMvc
        .perform(
            post("/auth/cadastro")
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    cadastroJson(
                        "Aluno Novo", "novo.isolado@cancha.test", null, "senha-segura-123")))
        .andExpect(status().isCreated());

    String token =
        jwtService.emitir(
            alunos.findByEmail("novo.isolado@cancha.test").orElseThrow().getId());
    mockMvc
        .perform(get("/disciplinas").header("Authorization", "Bearer " + token))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.length()").value(5))
        .andExpect(jsonPath("$[0].progressoPercentual").value(0.0))
        .andExpect(jsonPath("$[?(@.nome == 'Exclusiva de outro aluno')]").isEmpty());

    String tokenOutroAluno = jwtService.emitir(alunoExistenteId);
    mockMvc
        .perform(get("/disciplinas").header("Authorization", "Bearer " + tokenOutroAluno))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.length()").value(6));
  }

  @Test
  void cadastroApareceNaDocumentacaoOpenApi() throws Exception {
    mockMvc
        .perform(get("/v3/api-docs"))
        .andExpect(status().isOk())
        .andExpect(
            jsonPath("$.paths['/auth/cadastro'].post.summary")
                .value("Cria uma conta de aluno"));
  }

  private void assertMatriculadaNasDisciplinasDeExemplo(String email) {
    Integer quantidade =
        jdbc.queryForObject(
            """
            select count(*)
            from matricula m
            join aluno a on a.id = m.aluno_id
            join usuario u on u.id = a.id
            where u.email = ?
            """,
            Integer.class,
            email);
    Double progresso =
        jdbc.queryForObject(
            """
            select sum(m.progresso_percentual)
            from matricula m
            join aluno a on a.id = m.aluno_id
            join usuario u on u.id = a.id
            where u.email = ?
            """,
            Double.class,
            email);

    assertThat(quantidade).isEqualTo(5);
    assertThat(progresso).isEqualTo(0.0);
  }

  private String cadastroJson(String nome, String email, String matriculaUnB, String senha) {
    String matricula = matriculaUnB == null ? "null" : "\"" + matriculaUnB + "\"";
    return """
        {"nome": "%s", "email": "%s", "senha": "%s", "confirmacaoSenha": "%s", "matriculaUnB": %s}
        """
        .formatted(nome, email, senha, senha, matricula);
  }

  private String cadastroJson(String nome, String email, String matriculaUnB) {
    return cadastroJson(nome, email, matriculaUnB, "senha-segura-123");
  }
}
