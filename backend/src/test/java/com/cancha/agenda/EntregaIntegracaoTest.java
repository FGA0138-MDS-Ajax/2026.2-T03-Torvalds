package com.cancha.agenda;

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
class EntregaIntegracaoTest {

  @Autowired private MockMvc mockMvc;
  @Autowired private JdbcTemplate jdbc;
  @Autowired private JwtService jwtService;

  @Test
  void alunoMatriculadoRecebeAtividadesOrdenadasComStatus() throws Exception {
    Long alunoId = idDoAluno("aluno1@cancha.test");
    Long disciplinaId = idDaDisciplina("Compiladores");

    mockMvc
        .perform(
            get("/disciplinas/{disciplinaId}/atividades", disciplinaId)
                .header("Authorization", "Bearer " + jwtService.emitir(alunoId)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.length()").value(3))
        .andExpect(jsonPath("$[0].titulo").value("Lista 2: análise léxica"))
        .andExpect(jsonPath("$[0].status").value("CONCLUIDA"))
        .andExpect(jsonPath("$[1].titulo").value("Trabalho: analisador sintático"))
        .andExpect(jsonPath("$[1].status").value("EM_ANDAMENTO"))
        .andExpect(jsonPath("$[2].titulo").value("Prova 2 de Compiladores"))
        .andExpect(jsonPath("$[2].status").value("A fazer"))
        .andExpect(jsonPath("$[0].descricao").exists())
        .andExpect(jsonPath("$[0].tipo").value("Lista"))
        .andExpect(jsonPath("$[0].prazo").exists());
  }

  @Test
  void alunoSemMatriculaRecebe403() throws Exception {
    Long alunoId = idDoAluno("aluno1@cancha.test");
    Long disciplinaId = idDaDisciplina("Compiladores");
    jdbc.update(
        "delete from matricula where aluno_id = ? and disciplina_id = ?", alunoId, disciplinaId);

    mockMvc
        .perform(
            get("/disciplinas/{disciplinaId}/atividades", disciplinaId)
                .header("Authorization", "Bearer " + jwtService.emitir(alunoId)))
        .andExpect(status().isForbidden());
  }

  @Test
  void disciplinaInexistenteRecebe404() throws Exception {
    Long alunoId = idDoAluno("aluno1@cancha.test");

    mockMvc
        .perform(
            get("/disciplinas/{disciplinaId}/atividades", Long.MAX_VALUE)
                .header("Authorization", "Bearer " + jwtService.emitir(alunoId)))
        .andExpect(status().isNotFound());
  }

  @Test
  void endpointDeAtividadesApareceNaDocumentacaoOpenApi() throws Exception {
    mockMvc
        .perform(get("/v3/api-docs"))
        .andExpect(status().isOk())
        .andExpect(
            jsonPath("$.paths['/disciplinas/{disciplinaId}/atividades'].get.summary")
                .value("Lista as atividades de uma disciplina"))
        .andExpect(
            jsonPath("$.paths['/disciplinas/{disciplinaId}/atividades'].get.responses['403']")
                .exists())
        .andExpect(
            jsonPath("$.paths['/disciplinas/{disciplinaId}/atividades'].get.responses['404']")
                .exists());
  }

  private Long idDoAluno(String email) {
    return jdbc.queryForObject("select id from usuario where email = ?", Long.class, email);
  }

  private Long idDaDisciplina(String nome) {
    return jdbc.queryForObject("select id from disciplina where nome = ?", Long.class, nome);
  }
}
