package com.cancha.auth.security;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;

/** Verifica a proteção dos endpoints por meio de requisições HTTP simuladas. */
@SpringBootTest
@AutoConfigureMockMvc
class SegurancaIntegracaoTest {

    @Autowired private MockMvc mockMvc;

    @Test
    void rotaProtegidaSemTokenRetorna401() throws Exception {
        mockMvc.perform(get("/disciplinas")).andExpect(status().isUnauthorized());
    }

    @Test
    void permitePreflightDoFrontendComAuthorization() throws Exception{
        mockMvc
                .perform(
                        options("/disciplinas")
                                .header("Origin", "http://localhost:5173")
                                .header("Access-Control-Request-Method", "GET")
                                .header("Access-Control-Request-Headers", "Authorization"))
                .andExpect(status().isOk())
                .andExpect(header().string("Access-Control-Allow-Origin", "http://localhost:5173"))
                .andExpect(
                        header()
                                .string(
                                        "Access-Control-Allow-Headers",
                                        org.hamcrest.Matchers.containsStringIgnoringCase("Authorization")));

    }
}