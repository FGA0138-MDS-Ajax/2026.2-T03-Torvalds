package com.cancha.auth.dto;

/** Token utilizado nas próximas requisições à API. */
public record LoginResponse(String token) {}