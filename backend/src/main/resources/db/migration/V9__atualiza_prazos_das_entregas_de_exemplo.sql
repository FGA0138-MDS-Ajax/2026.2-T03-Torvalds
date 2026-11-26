-- Atualiza os prazos das entregas de exemplo em relacao ao dia da migration
-- Preserva IDs, nomes das disciplinas, matriculas e progressos dos alunos
-- Mantem duas entregas vencidas para os cenarios de atraso do CT-03
-- As datas ficam fixas depois que esta migration e aplicada

UPDATE entrega
SET prazo =
    CAST(CURRENT_DATE AS TIMESTAMP)
    + CASE titulo
        -- Compiladores: preserva as tres entregas e sua ordem por prazo
        WHEN 'Lista 2: análise léxica' THEN INTERVAL '1' DAY
        WHEN 'Trabalho: analisador sintático' THEN INTERVAL '8' DAY
        WHEN 'Prova 2 de Compiladores' THEN INTERVAL '22' DAY

        -- Gestao e Producao da Qualidade
        WHEN 'Estudo de caso: ISO 9001' THEN - INTERVAL '2' DAY
        WHEN 'Lista: ferramentas da qualidade' THEN INTERVAL '3' DAY
        WHEN 'Prova 2 de Qualidade' THEN INTERVAL '24' DAY
        WHEN 'Lista 1: conceitos de qualidade' THEN INTERVAL '5' DAY
        WHEN 'Seminário: Seis Sigma' THEN INTERVAL '12' DAY

        -- Projeto Integrador em Engenharia
        WHEN 'Diário de bordo' THEN INTERVAL '2' DAY
        WHEN 'Relatório parcial do PI' THEN INTERVAL '7' DAY
        WHEN 'Apresentação final do PI' THEN INTERVAL '27' DAY
        WHEN 'Proposta do projeto' THEN - INTERVAL '1' DAY
        WHEN 'Protótipo funcional' THEN INTERVAL '14' DAY

        -- Teoria dos Numeros
        WHEN 'Lista 2: divisibilidade' THEN INTERVAL '4' DAY
        WHEN 'Lista 3: congruências' THEN INTERVAL '9' DAY
        WHEN 'Prova 2 de Teoria dos Números' THEN INTERVAL '20' DAY
        WHEN 'Lista 1: indução e boa ordenação' THEN INTERVAL '6' DAY
        WHEN 'Prova 1 de Teoria dos Números' THEN INTERVAL '16' DAY

        -- Metodos de Desenvolvimento de Software
        WHEN 'Documento de Arquitetura' THEN INTERVAL '3' DAY
        WHEN 'Documento de Visão corrigido' THEN INTERVAL '10' DAY
        WHEN 'Release do incremento' THEN INTERVAL '17' DAY
        WHEN 'Prova 2 de MDS' THEN INTERVAL '28' DAY
        WHEN 'Documento de Visão' THEN INTERVAL '5' DAY
        WHEN 'Prova 1 de MDS' THEN INTERVAL '13' DAY
        WHEN 'Roteiro de testes funcionais' THEN INTERVAL '21' DAY
      END
    + INTERVAL '23:59' HOUR TO MINUTE
WHERE disciplina_id IN (
    SELECT id
    FROM disciplina
    WHERE nome IN (
        'Compiladores',
        'Gestão e Produção da Qualidade',
        'Projeto Integrador em Engenharia',
        'Teoria dos Números',
        'Métodos de Desenvolvimento de Software'
    )
)
AND titulo IN (
    'Lista 2: análise léxica',
    'Trabalho: analisador sintático',
    'Prova 2 de Compiladores',
    'Estudo de caso: ISO 9001',
    'Lista: ferramentas da qualidade',
    'Prova 2 de Qualidade',
    'Lista 1: conceitos de qualidade',
    'Seminário: Seis Sigma',
    'Diário de bordo',
    'Relatório parcial do PI',
    'Apresentação final do PI',
    'Proposta do projeto',
    'Protótipo funcional',
    'Lista 2: divisibilidade',
    'Lista 3: congruências',
    'Prova 2 de Teoria dos Números',
    'Lista 1: indução e boa ordenação',
    'Prova 1 de Teoria dos Números',
    'Documento de Arquitetura',
    'Documento de Visão corrigido',
    'Release do incremento',
    'Prova 2 de MDS',
    'Documento de Visão',
    'Prova 1 de MDS',
    'Roteiro de testes funcionais'
);