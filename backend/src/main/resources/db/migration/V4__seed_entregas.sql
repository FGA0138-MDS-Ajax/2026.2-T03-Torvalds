-- Entregas de exemplo das 5 disciplinas, para desenvolvimento e para a apresentacao.
-- Os prazos sao relativos ao dia em que o banco e criado: ha entregas vencidas e
-- entregas nos proximos dias e semanas. Como uma migration roda uma vez so por banco,
-- no banco local as datas se renovam a cada "docker compose down -v".
-- Os titulos sao unicos, porque as situacoes dos alunos (no fim do arquivo) usam o titulo.

-- Compiladores
INSERT INTO entrega (disciplina_id, titulo, descricao, tipo, prazo)
    SELECT id, 'Lista 2: análise léxica', 'Exercícios de expressões regulares e autômatos.', 'Lista',
           CAST(CURRENT_DATE AS TIMESTAMP) - INTERVAL '5' DAY + INTERVAL '23:59' HOUR TO MINUTE
    FROM disciplina WHERE nome = 'Compiladores';
INSERT INTO entrega (disciplina_id, titulo, descricao, tipo, prazo)
    SELECT id, 'Trabalho: analisador sintático', 'Implementar o parser da linguagem da disciplina.', 'Trabalho',
           CAST(CURRENT_DATE AS TIMESTAMP) + INTERVAL '6' DAY + INTERVAL '23:59' HOUR TO MINUTE
    FROM disciplina WHERE nome = 'Compiladores';
INSERT INTO entrega (disciplina_id, titulo, descricao, tipo, prazo)
    SELECT id, 'Prova 2 de Compiladores', 'Análise sintática e semântica.', 'Prova',
           CAST(CURRENT_DATE AS TIMESTAMP) + INTERVAL '20' DAY + INTERVAL '23:59' HOUR TO MINUTE
    FROM disciplina WHERE nome = 'Compiladores';

-- Gestão e Produção da Qualidade
INSERT INTO entrega (disciplina_id, titulo, descricao, tipo, prazo)
    SELECT id, 'Estudo de caso: ISO 9001', 'Analisar a certificação de uma empresa real.', 'Trabalho',
           CAST(CURRENT_DATE AS TIMESTAMP) - INTERVAL '2' DAY + INTERVAL '23:59' HOUR TO MINUTE
    FROM disciplina WHERE nome = 'Gestão e Produção da Qualidade';
INSERT INTO entrega (disciplina_id, titulo, descricao, tipo, prazo)
    SELECT id, 'Lista: ferramentas da qualidade', 'Pareto, Ishikawa e carta de controle.', 'Lista',
           CAST(CURRENT_DATE AS TIMESTAMP) + INTERVAL '3' DAY + INTERVAL '23:59' HOUR TO MINUTE
    FROM disciplina WHERE nome = 'Gestão e Produção da Qualidade';
INSERT INTO entrega (disciplina_id, titulo, descricao, tipo, prazo)
    SELECT id, 'Prova 2 de Qualidade', 'Controle estatístico de processos.', 'Prova',
           CAST(CURRENT_DATE AS TIMESTAMP) + INTERVAL '24' DAY + INTERVAL '23:59' HOUR TO MINUTE
    FROM disciplina WHERE nome = 'Gestão e Produção da Qualidade';

-- Projeto Integrador em Engenharia
INSERT INTO entrega (disciplina_id, titulo, descricao, tipo, prazo)
    SELECT id, 'Diário de bordo', 'Registro das atividades do grupo no mês.', 'Trabalho',
           CAST(CURRENT_DATE AS TIMESTAMP) - INTERVAL '7' DAY + INTERVAL '23:59' HOUR TO MINUTE
    FROM disciplina WHERE nome = 'Projeto Integrador em Engenharia';
INSERT INTO entrega (disciplina_id, titulo, descricao, tipo, prazo)
    SELECT id, 'Relatório parcial do PI', 'Andamento do protótipo e próximos passos.', 'Trabalho',
           CAST(CURRENT_DATE AS TIMESTAMP) + INTERVAL '1' DAY + INTERVAL '23:59' HOUR TO MINUTE
    FROM disciplina WHERE nome = 'Projeto Integrador em Engenharia';
INSERT INTO entrega (disciplina_id, titulo, descricao, tipo, prazo)
    SELECT id, 'Apresentação final do PI', 'Demonstração do protótipo para a banca.', 'Trabalho',
           CAST(CURRENT_DATE AS TIMESTAMP) + INTERVAL '27' DAY + INTERVAL '23:59' HOUR TO MINUTE
    FROM disciplina WHERE nome = 'Projeto Integrador em Engenharia';

-- Teoria dos Números
INSERT INTO entrega (disciplina_id, titulo, descricao, tipo, prazo)
    SELECT id, 'Lista 2: divisibilidade', 'MDC, algoritmo de Euclides e primos.', 'Lista',
           CAST(CURRENT_DATE AS TIMESTAMP) - INTERVAL '9' DAY + INTERVAL '23:59' HOUR TO MINUTE
    FROM disciplina WHERE nome = 'Teoria dos Números';
INSERT INTO entrega (disciplina_id, titulo, descricao, tipo, prazo)
    SELECT id, 'Lista 3: congruências', 'Congruências lineares e teorema chinês do resto.', 'Lista',
           CAST(CURRENT_DATE AS TIMESTAMP) + INTERVAL '4' DAY + INTERVAL '23:59' HOUR TO MINUTE
    FROM disciplina WHERE nome = 'Teoria dos Números';
INSERT INTO entrega (disciplina_id, titulo, descricao, tipo, prazo)
    SELECT id, 'Prova 2 de Teoria dos Números', 'Congruências e funções aritméticas.', 'Prova',
           CAST(CURRENT_DATE AS TIMESTAMP) + INTERVAL '13' DAY + INTERVAL '23:59' HOUR TO MINUTE
    FROM disciplina WHERE nome = 'Teoria dos Números';

-- Métodos de Desenvolvimento de Software
INSERT INTO entrega (disciplina_id, titulo, descricao, tipo, prazo)
    SELECT id, 'Documento de Arquitetura', 'Visões arquiteturais do produto do grupo.', 'Trabalho',
           CAST(CURRENT_DATE AS TIMESTAMP) - INTERVAL '20' DAY + INTERVAL '23:59' HOUR TO MINUTE
    FROM disciplina WHERE nome = 'Métodos de Desenvolvimento de Software';
INSERT INTO entrega (disciplina_id, titulo, descricao, tipo, prazo)
    SELECT id, 'Documento de Visão corrigido', 'Aplicar as correções do professor.', 'Trabalho',
           CAST(CURRENT_DATE AS TIMESTAMP) + INTERVAL '7' DAY + INTERVAL '23:59' HOUR TO MINUTE
    FROM disciplina WHERE nome = 'Métodos de Desenvolvimento de Software';
INSERT INTO entrega (disciplina_id, titulo, descricao, tipo, prazo)
    SELECT id, 'Release do incremento', 'Versão publicada com as histórias da sprint.', 'Trabalho',
           CAST(CURRENT_DATE AS TIMESTAMP) + INTERVAL '8' DAY + INTERVAL '23:59' HOUR TO MINUTE
    FROM disciplina WHERE nome = 'Métodos de Desenvolvimento de Software';
INSERT INTO entrega (disciplina_id, titulo, descricao, tipo, prazo)
    SELECT id, 'Prova 2 de MDS', 'Testes, qualidade e gerência de configuração.', 'Prova',
           CAST(CURRENT_DATE AS TIMESTAMP) + INTERVAL '29' DAY + INTERVAL '23:59' HOUR TO MINUTE
    FROM disciplina WHERE nome = 'Métodos de Desenvolvimento de Software';

-- Situacoes dos alunos de teste. Entrega sem linha aqui conta como A_FAZER.
-- Valores possiveis: A_FAZER, EM_ANDAMENTO, CONCLUIDA.

-- Aluno 1: 4 concluidas, 3 em andamento e uma entrega vencida sem concluir (Estudo de caso).
INSERT INTO progresso_atividade (aluno_id, entrega_id, status, data_conclusao)
    SELECT a.id, e.id, 'CONCLUIDA', e.prazo - INTERVAL '1' DAY
    FROM aluno a JOIN usuario u ON u.id = a.id CROSS JOIN entrega e
    WHERE u.email = 'aluno1@cancha.test'
      AND e.titulo IN ('Lista 2: análise léxica', 'Diário de bordo', 'Lista 2: divisibilidade',
                       'Documento de Arquitetura');
INSERT INTO progresso_atividade (aluno_id, entrega_id, status, data_conclusao)
    SELECT a.id, e.id, 'EM_ANDAMENTO', NULL
    FROM aluno a JOIN usuario u ON u.id = a.id CROSS JOIN entrega e
    WHERE u.email = 'aluno1@cancha.test'
      AND e.titulo IN ('Trabalho: analisador sintático', 'Relatório parcial do PI',
                       'Documento de Visão corrigido');

-- Aluno 2: situacoes diferentes, para provar que cada aluno ve so as suas.
INSERT INTO progresso_atividade (aluno_id, entrega_id, status, data_conclusao)
    SELECT a.id, e.id, 'CONCLUIDA', e.prazo - INTERVAL '2' DAY
    FROM aluno a JOIN usuario u ON u.id = a.id CROSS JOIN entrega e
    WHERE u.email = 'aluno2@cancha.test'
      AND e.titulo IN ('Lista 2: análise léxica', 'Estudo de caso: ISO 9001', 'Lista 2: divisibilidade',
                       'Documento de Arquitetura', 'Diário de bordo');
INSERT INTO progresso_atividade (aluno_id, entrega_id, status, data_conclusao)
    SELECT a.id, e.id, 'EM_ANDAMENTO', NULL
    FROM aluno a JOIN usuario u ON u.id = a.id CROSS JOIN entrega e
    WHERE u.email = 'aluno2@cancha.test'
      AND e.titulo = 'Lista 3: congruências';
