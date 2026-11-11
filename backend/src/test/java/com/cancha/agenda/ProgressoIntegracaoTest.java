package com.cancha.agenda;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.cancha.auth.security.JwtService;
import java.util.List;
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
public class ProgressoIntegracaoTest {

  private static final String URL = "/progresso";

  @Autowired private MockMvc mockMvc;
  @Autowired private JdbcTemplate jdbc;
  @Autowired private JwtService jwtService;

  @Test
  void calculaPercentualAgregadoComArredondamentoDoExemploDoBacklog() throws Exception {
    Long alunoId = idDoAluno("aluno1@cancha.test");
    List<Long> disciplinaIds =
        List.of(idDaDisciplina("Compiladores"), idDaDisciplina("Projeto Integrador em Engenharia"));
    prepararDezoitoEntregasComDozeConcluidas(alunoId, disciplinaIds);

    mockMvc
        .perform(get(URL).header("Authorization", "Bearer " + jwtService.emitir(alunoId)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.concluidas").value(12))
        .andExpect(jsonPath("$.total").value(18))
        .andExpect(jsonPath("$.percentual").value(67));
  }

  @Test
  void alunoSemDisciplinasTemProgressoZerado() throws Exception {
    Long alunoId = idDoAluno("aluno3@cancha.test");

    mockMvc
        .perform(get(URL).header("Authorization", "Bearer " + jwtService.emitir(alunoId)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.concluidas").value(0))
        .andExpect(jsonPath("$.total").value(0))
        .andExpect(jsonPath("$.percentual").value(0));
  }

  @Test
  void exigeAutenticacao() throws Exception {
    mockMvc.perform(get(URL)).andExpect(status().isUnauthorized());
  }

  private void prepararDezoitoEntregasComDozeConcluidas(Long alunoId, List<Long> disciplinaIds) {
    jdbc.update(
        "delete from matricula where aluno_id = ? and disciplina_id not in (?, ?)",
        alunoId,
        disciplinaIds.get(0),
        disciplinaIds.get(1));
    jdbc.update("delete from progresso_atividade where aluno_id = ?", alunoId);

    int[] entregasAdicionais = {6, 4};
    for (int i = 0; i < disciplinaIds.size(); i++) {
      Long disciplinaId = disciplinaIds.get(i);
      for (int entrega = 0; entrega < entregasAdicionais[i]; entrega++) {
        jdbc.update(
            "insert into entrega (disciplina_id, titulo, descricao, tipo, prazo)"
                + " values (?, ?, ?, ?, current_timestamp)",
            disciplinaId,
            "Entrega teste de progresso " + i + "-" + entrega,
            "Entrega criada para o teste de integração.",
            "Trabalho");
      }

      jdbc.update(
          "insert into progresso_atividade (aluno_id, entrega_id, status, data_conclusao)"
              + " select ?, id, 'CONCLUIDA', current_timestamp from entrega"
              + " where disciplina_id = ? order by id fetch first 6 rows only",
          alunoId,
          disciplinaId);
    }
  }

  private Long idDoAluno(String email) {
    return jdbc.queryForObject("select id from usuario where email = ?", Long.class, email);
  }

  private Long idDaDisciplina(String nome) {
    return jdbc.queryForObject("select id from disciplina where nome = ?", Long.class, nome);
  }
}
