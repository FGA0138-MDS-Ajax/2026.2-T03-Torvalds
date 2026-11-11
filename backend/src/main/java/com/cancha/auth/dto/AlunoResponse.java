package com.cancha.auth.dto;

import com.cancha.auth.model.Aluno;

/** Dados públicos do perfil autenticado, sem credenciais. */
public record AlunoResponse(
        Long id, String nome, String email, String matriculaUnB) {

    public static AlunoResponse de(Aluno aluno) {
        return new AlunoResponse(
                aluno.getId(),
                aluno.getNome(),
                aluno.getEmail(),
                aluno.getMatriculaUnB());
    }
}