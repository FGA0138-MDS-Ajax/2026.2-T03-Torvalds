package com.cancha.auth.security;

import java.time.Duration;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Validated
@ConfigurationProperties(prefix = "cancha.security.jwt")
public record JwtProperties(
    @NotBlank String secret,
    @NotNull Duration expiration
){
    public JwtProperties{
        if(expiration!=null && (expiration.isZero() || expiration.isNegative())){
            throw new IllegalArgumentException(
                "A duração do token JWT deve ser positiva."
            );
        }
    }
}