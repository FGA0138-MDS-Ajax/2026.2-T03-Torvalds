package com.cancha.common.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/** Documentação da API (Swagger UI em /swagger-ui.html, JSON em /v3/api-docs). */
@Configuration
public class OpenApiConfig {

  private static final String ESQUEMA_JWT = "bearerAuth";

  @Bean
  public OpenAPI canchaOpenApi() {
    return new OpenAPI()
        .info(
            new Info()
                .title("Cancha API")
                .version("0.0.1")
                .description("API do Cancha: disciplinas, entregas e materiais do aluno."))
        .components(
            new Components()
                .addSecuritySchemes(
                    ESQUEMA_JWT,
                    new SecurityScheme()
                        .type(SecurityScheme.Type.HTTP)
                        .scheme("bearer")
                        .bearerFormat("JWT")))
        .addSecurityItem(new SecurityRequirement().addList(ESQUEMA_JWT));
  }
}
