-- O status de uma entrega para um aluno so pode ser um destes tres valores.
-- Os dados da V4 ja respeitam esta regra. Entrega sem linha em progresso_atividade conta como A_FAZER.
ALTER TABLE progresso_atividade
    ADD CONSTRAINT ck_progresso_status
        CHECK (status IN ('A_FAZER', 'EM_ANDAMENTO', 'CONCLUIDA'));
