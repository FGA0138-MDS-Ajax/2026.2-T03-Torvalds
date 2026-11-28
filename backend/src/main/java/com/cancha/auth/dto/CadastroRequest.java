package com.cancha.auth.dto;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.util.Objects;

/** Dados públicos para criar uma conta de aluno. */
public record CadastroRequest(
    @NotBlank @Size(max = 120) String nome,
    @NotBlank @Email @Size(max = 160) String email,
    @NotBlank @Size(min = 8, max = 72) String senha,
    @NotBlank String confirmacaoSenha,
    @Pattern(regexp = "(?:[0-9]{9})?") String matriculaUnB) {

  @AssertTrue(message = "A senha deve ser igual à confirmação.")
  @JsonIgnore
  public boolean isSenhaConfirmada() {
    return Objects.equals(senha, confirmacaoSenha);
  }
}
