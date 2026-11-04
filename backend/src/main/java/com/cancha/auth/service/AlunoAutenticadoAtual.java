package com.cancha.auth.service;


import com.cancha.auth.repository.AlunoRepository;
import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Component;

/** Identifica o aluno pelo subject do JWT validado pelo Spring Security. */
@Component
public class AlunoAutenticadoAtual implements AlunoAtual{
    private final AlunoRepository alunos;

    public AlunoAutenticadoAtual(AlunoRepository alunos) {
        this.alunos = alunos;
    }

    @Override
    public Long id(){
        var autenticacao = SecurityContextHolder.getContext().getAuthentication();

        if(!(autenticacao instanceof JwtAuthenticationToken jwt) || !jwt.isAuthenticated()){
            throw new AuthenticationCredentialsNotFoundException(
                    "Aluno não autenticado."
            );
        }

        String subject = jwt.getToken().getSubject();
        Long alunoId;

        try{
            alunoId = Long.valueOf(subject);
        } catch (NumberFormatException exception){
            throw new AuthenticationCredentialsNotFoundException(
                    "Identificação do aluno inválida.", exception
            );
        }

        if(alunoId <=0 || !alunos.existsById(alunoId)){
            throw new AuthenticationCredentialsNotFoundException(
                    "Aluno autenticado não encontrado."
            );
        }

        return alunoId;
    }
}
