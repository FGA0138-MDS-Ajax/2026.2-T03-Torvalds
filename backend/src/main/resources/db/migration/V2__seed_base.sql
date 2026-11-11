-- Dados de exemplo para desenvolvimento e para a apresentacao.
-- Os dois alunos de teste usam a senha de desenvolvimento descrita em backend/README.md
-- (guardada aqui apenas como hash BCrypt). Ids nao sao fixados de proposito: as chaves
-- sao geradas pelo banco, e as ligacoes abaixo usam e-mail e nome.

INSERT INTO usuario (papel, nome, email, senha_hash) VALUES
    ('ALUNO', 'Aluno Teste 1', 'aluno1@cancha.test', '$2a$10$jausRFk3j5ukNFT0ocQ6Tud4htqAdk/EhCMbB81HMkdakTji47wdi'),
    ('ALUNO', 'Aluno Teste 2', 'aluno2@cancha.test', '$2a$10$jausRFk3j5ukNFT0ocQ6Tud4htqAdk/EhCMbB81HMkdakTji47wdi');

INSERT INTO aluno (id, matricula_unb)
    SELECT id, '260000001' FROM usuario WHERE email = 'aluno1@cancha.test';
INSERT INTO aluno (id, matricula_unb)
    SELECT id, '260000002' FROM usuario WHERE email = 'aluno2@cancha.test';

-- As 5 disciplinas do Figma.
INSERT INTO disciplina (nome, periodo_letivo) VALUES
    ('Compiladores', '2026.2'),
    ('Gestão e Produção da Qualidade', '2026.2'),
    ('Projeto Integrador em Engenharia', '2026.2'),
    ('Teoria dos Números', '2026.2'),
    ('Métodos de Desenvolvimento de Software', '2026.2');

-- Os dois alunos de teste matriculados nas 5 disciplinas.
INSERT INTO matricula (aluno_id, disciplina_id, progresso_percentual, data_matricula)
    SELECT a.id, d.id, 0, CURRENT_DATE FROM aluno a CROSS JOIN disciplina d;
