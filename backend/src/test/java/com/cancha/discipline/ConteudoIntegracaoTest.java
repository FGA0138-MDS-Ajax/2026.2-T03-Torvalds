package com.cancha.discipline;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.cancha.auth.security.JwtService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class ConteudoIntegracaoTest {

  @Autowired private MockMvc mockMvc;
  @Autowired private JdbcTemplate jdbc;
  @Autowired private JwtService jwtService;

  @Test
  void alunoMatriculadoListaMateriaisDaDisciplina() throws Exception {
    Long alunoId = idDoAluno("aluno1@cancha.test");
    Long disciplinaId = idDaDisciplina("Compiladores");

    mockMvc
        .perform(
            get("/disciplinas/{disciplinaId}/conteudos", disciplinaId)
                .header("Authorization", "Bearer " + jwtService.emitir(alunoId)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.length()").value(2))
        .andExpect(jsonPath("$[0].titulo").value("Introdução aos compiladores"))
        .andExpect(jsonPath("$[0].tipo").value("Livro"))
        .andExpect(jsonPath("$[0].urlOuArquivo").value("https://craftinginterpreters.com/"))
        .andExpect(jsonPath("$[0].dataPublicacao").exists())
        .andExpect(jsonPath("$[1].titulo").value("ANTLR"));
  }

  @Test
  void alunoSemMatriculaNaoPodeListarMateriaisDaDisciplina() throws Exception {
    Long alunoId = idDoAluno("aluno1@cancha.test");
    Long disciplinaId = idDaDisciplina("Compiladores");
    jdbc.update(
        "delete from matricula where aluno_id = ? and disciplina_id = ?", alunoId, disciplinaId);

    mockMvc
        .perform(
            get("/disciplinas/{disciplinaId}/conteudos", disciplinaId)
                .header("Authorization", "Bearer " + jwtService.emitir(alunoId)))
        .andExpect(status().isForbidden());
  }

  @Test
  void endpointDeConteudosApareceNaDocumentacaoOpenApi() throws Exception {
    mockMvc
        .perform(get("/v3/api-docs"))
        .andExpect(status().isOk())
        .andExpect(
            jsonPath("$.paths['/disciplinas/{disciplinaId}/conteudos'].get.summary")
                .value("Lista os materiais de uma disciplina"));
  }

  private Long idDoAluno(String email) {
    return jdbc.queryForObject("select id from usuario where email = ?", Long.class, email);
  }

  private Long idDaDisciplina(String nome) {
    return jdbc.queryForObject("select id from disciplina where nome = ?", Long.class, nome);
  }
}
