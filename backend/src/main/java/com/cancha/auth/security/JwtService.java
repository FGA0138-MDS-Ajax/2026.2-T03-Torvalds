package com.cancha.auth.security;

import com.nimbusds.jose.JOSEException;
import com.nimbusds.jose.JOSEObjectType;
import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.JWSHeader;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.time.Instant;
import java.util.Date;

/** Emite tokens assinados que identificam o aluno pelo campo subject. */
@Service
public class JwtService {
    private final SecretKey secretKey;
    private final JwtProperties properties;

    public JwtService(SecretKey secretKey, JwtProperties properties) {
        this.secretKey = secretKey;
        this.properties = properties;
    }

    public String emitir(Long alunoId){
        if(alunoId == null || alunoId <=0){
            throw new IllegalArgumentException("O ID do aluno deve ser positivo.");
        }

        Instant agora = Instant.now();

        JWTClaimsSet claims =
                new JWTClaimsSet.Builder()
                        .subject(alunoId.toString())
                        .issueTime(Date.from(agora))
                        .expirationTime(Date.from(agora.plus(properties.expiration())))
                        .build();

        SignedJWT jwt =
                new SignedJWT(
                        new JWSHeader.Builder(JWSAlgorithm.HS256)
                                .type(JOSEObjectType.JWT)
                                .build(),
                        claims
                );

        try{
            jwt.sign(new MACSigner(secretKey.getEncoded()));
            return jwt.serialize();
        } catch(JOSEException exception){
            throw new IllegalStateException("Não foi possível emitir o token JWT.", exception);
        }
    }
}
