-- Amplia os dados de exemplo para o progresso, a agenda e a apresentacao do Ponto de Controle.
-- Acrescenta 9 entregas, situacoes variadas para os dois alunos de teste e um terceiro aluno
-- sem matricula, para mostrar as telas vazias.
-- Assim como na V4, os prazos sao relativos ao dia em que esta migration roda.
-- Compiladores fica com as 3 entregas da V4 (os testes da pagina da disciplina usam essas 3).

-- Gestao e Producao da Qualidade
INSERT INTO entrega (disciplina_id, titulo, descricao, tipo, prazo)
    SELECT id, 'Lista 1: conceitos de qualidade', 'Definições de qualidade e os gurus da qualidade.', 'Lista',
           CAST(CURRENT_DATE AS TIMESTAMP) - INTERVAL '16' DAY + INTERVAL '23:59' HOUR TO MINUTE
    FROM disciplina WHERE nome = 'Gestão e Produção da Qualidade';
INSERT INTO entrega (disciplina_id, titulo, descricao, tipo, prazo)
    SELECT id, 'Seminário: Seis Sigma', 'Apresentar o método DMAIC com um exemplo real.', 'Trabalho',
           CAST(CURRENT_DATE AS TIMESTAMP) + INTERVAL '12' DAY + INTERVAL '23:59' HOUR TO MINUTE
    FROM disciplina WHERE nome = 'Gestão e Produção da Qualidade';

-- Projeto Integrador em Engenharia
INSERT INTO entrega (disciplina_id, titulo, descricao, tipo, prazo)
    SELECT id, 'Proposta do projeto', 'Problema, objetivos e equipe do projeto.', 'Trabalho',
           CAST(CURRENT_DATE AS TIMESTAMP) - INTERVAL '30' DAY + INTERVAL '23:59' HOUR TO MINUTE
    FROM disciplina WHERE nome = 'Projeto Integrador em Engenharia';
INSERT INTO entrega (disciplina_id, titulo, descricao, tipo, prazo)
    SELECT id, 'Protótipo funcional', 'Primeira versão do protótipo funcionando para os professores.', 'Trabalho',
           CAST(CURRENT_DATE AS TIMESTAMP) + INTERVAL '14' DAY + INTERVAL '23:59' HOUR TO MINUTE
    FROM disciplina WHERE nome = 'Projeto Integrador em Engenharia';

-- Teoria dos Numeros
INSERT INTO entrega (disciplina_id, titulo, descricao, tipo, prazo)
    SELECT id, 'Lista 1: indução e boa ordenação', 'Demonstrações por indução finita.', 'Lista',
           CAST(CURRENT_DATE AS TIMESTAMP) - INTERVAL '23' DAY + INTERVAL '23:59' HOUR TO MINUTE
    FROM disciplina WHERE nome = 'Teoria dos Números';
INSERT INTO entrega (disciplina_id, titulo, descricao, tipo, prazo)
    SELECT id, 'Prova 1 de Teoria dos Números', 'Indução, divisibilidade e primos.', 'Prova',
           CAST(CURRENT_DATE AS TIMESTAMP) - INTERVAL '12' DAY + INTERVAL '23:59' HOUR TO MINUTE
    FROM disciplina WHERE nome = 'Teoria dos Números';

-- Metodos de Desenvolvimento de Software
INSERT INTO entrega (disciplina_id, titulo, descricao, tipo, prazo)
    SELECT id, 'Documento de Visão', 'Problema, envolvidos e requisitos do produto do grupo.', 'Trabalho',
           CAST(CURRENT_DATE AS TIMESTAMP) - INTERVAL '34' DAY + INTERVAL '23:59' HOUR TO MINUTE
    FROM disciplina WHERE nome = 'Métodos de Desenvolvimento de Software';
INSERT INTO entrega (disciplina_id, titulo, descricao, tipo, prazo)
    SELECT id, 'Prova 1 de MDS', 'Processos de software, Scrum e XP.', 'Prova',
           CAST(CURRENT_DATE AS TIMESTAMP) - INTERVAL '14' DAY + INTERVAL '23:59' HOUR TO MINUTE
    FROM disciplina WHERE nome = 'Métodos de Desenvolvimento de Software';
INSERT INTO entrega (disciplina_id, titulo, descricao, tipo, prazo)
    SELECT id, 'Roteiro de testes funcionais', 'Casos de teste ligados aos requisitos e às histórias.', 'Trabalho',
           CAST(CURRENT_DATE AS TIMESTAMP) + INTERVAL '18' DAY + INTERVAL '23:59' HOUR TO MINUTE
    FROM disciplina WHERE nome = 'Métodos de Desenvolvimento de Software';

-- Situacoes dos alunos nas entregas novas. Entrega sem linha aqui conta como A_FAZER.

-- Aluno 1: conclui todas as entregas novas que ja venceram, adianta uma lista que ainda esta no
-- prazo e comeca o prototipo do PI.
INSERT INTO progresso_atividade (aluno_id, entrega_id, status, data_conclusao)
    SELECT a.id, e.id, 'CONCLUIDA', e.prazo - INTERVAL '1' DAY
    FROM aluno a JOIN usuario u ON u.id = a.id CROSS JOIN entrega e
    WHERE u.email = 'aluno1@cancha.test'
      AND e.titulo IN ('Lista 1: conceitos de qualidade', 'Proposta do projeto',
                       'Lista 1: indução e boa ordenação', 'Prova 1 de Teoria dos Números',
                       'Documento de Visão', 'Prova 1 de MDS');
INSERT INTO progresso_atividade (aluno_id, entrega_id, status, data_conclusao)
    SELECT a.id, e.id, 'CONCLUIDA', CAST(CURRENT_DATE AS TIMESTAMP) - INTERVAL '1' DAY
    FROM aluno a JOIN usuario u ON u.id = a.id CROSS JOIN entrega e
    WHERE u.email = 'aluno1@cancha.test'
      AND e.titulo = 'Lista: ferramentas da qualidade';
INSERT INTO progresso_atividade (aluno_id, entrega_id, status, data_conclusao)
    SELECT a.id, e.id, 'EM_ANDAMENTO', NULL
    FROM aluno a JOIN usuario u ON u.id = a.id CROSS JOIN entrega e
    WHERE u.email = 'aluno1@cancha.test'
      AND e.titulo = 'Protótipo funcional';

-- Aluno 2: deixa a proposta do PI vencida sem concluir e tem dois trabalhos em andamento.
INSERT INTO progresso_atividade (aluno_id, entrega_id, status, data_conclusao)
    SELECT a.id, e.id, 'CONCLUIDA', e.prazo - INTERVAL '2' DAY
    FROM aluno a JOIN usuario u ON u.id = a.id CROSS JOIN entrega e
    WHERE u.email = 'aluno2@cancha.test'
      AND e.titulo IN ('Lista 1: conceitos de qualidade', 'Lista 1: indução e boa ordenação',
                       'Prova 1 de Teoria dos Números', 'Documento de Visão', 'Prova 1 de MDS');
INSERT INTO progresso_atividade (aluno_id, entrega_id, status, data_conclusao)
    SELECT a.id, e.id, 'EM_ANDAMENTO', NULL
    FROM aluno a JOIN usuario u ON u.id = a.id CROSS JOIN entrega e
    WHERE u.email = 'aluno2@cancha.test'
      AND e.titulo IN ('Seminário: Seis Sigma', 'Roteiro de testes funcionais');

-- Aluno 3: mesma senha de desenvolvimento dos outros (mesmo hash da V2) e nenhuma matricula,
-- para mostrar as telas vazias (sem disciplinas, sem entregas e sem progresso).
INSERT INTO usuario (papel, nome, email, senha_hash) VALUES
    ('ALUNO', 'Aluno Teste 3', 'aluno3@cancha.test', '$2a$10$jausRFk3j5ukNFT0ocQ6Tud4htqAdk/EhCMbB81HMkdakTji47wdi');
INSERT INTO aluno (id, matricula_unb)
    SELECT id, '260000003' FROM usuario WHERE email = 'aluno3@cancha.test';
