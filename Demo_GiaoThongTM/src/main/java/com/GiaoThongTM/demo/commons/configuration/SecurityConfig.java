package com.GiaoThongTM.demo.commons.configuration;

import com.GiaoThongTM.demo.commons.constants.JwtProperties;
import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.jwk.JWKSet;
import com.nimbusds.jose.jwk.OctetSequenceKey;
import com.nimbusds.jose.jwk.source.ImmutableJWKSet;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.web.SecurityFilterChain;

import javax.crypto.spec.SecretKeySpec;
import java.util.List;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtProperties jwtProperties;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http.csrf(csrf -> csrf.disable()).authorizeHttpRequests(request ->
                request.requestMatchers("/auth/sign-in", "/auth/sign-up", "/auth/password/**").permitAll()
                        .anyRequest().authenticated());

        http.oauth2ResourceServer(oauth2 -> oauth2.jwt(
                jwtConfigurer ->jwtConfigurer.jwtAuthenticationConverter(new JwtAuthenticationConverter())
        ));

        return http.build();
    }

    @Bean
    public JwtDecoder jwtDecoder() {
        SecretKeySpec secretKeySpec = new SecretKeySpec(jwtProperties.getSecret().getBytes(), JWSAlgorithm.HS512.toString());
        NimbusJwtDecoder nimbusJwtDecoder = NimbusJwtDecoder
                .withSecretKey(secretKeySpec)
                .macAlgorithm(MacAlgorithm.HS512)
                .build();
        return nimbusJwtDecoder;
    }

    @Bean
    public JwtEncoder jwtEncoder(){
        SecretKeySpec secretKeySpec = new SecretKeySpec(this.jwtProperties.getSecret().getBytes(),
                JWSAlgorithm.HS512.toString());
        OctetSequenceKey jwk = new OctetSequenceKey.Builder(secretKeySpec.getEncoded())
                .algorithm(JWSAlgorithm.HS512)
                .build();
        JWKSet jwkSet =  new JWKSet(jwk);
        return new NimbusJwtEncoder(new ImmutableJWKSet<>(jwkSet));
    }

    @Bean
    public JwtAuthenticationConverter jwtAuthenticationConverter() {
        JwtAuthenticationConverter converter = new JwtAuthenticationConverter();

        converter.setJwtGrantedAuthoritiesConverter(jwt -> {
            String role = jwt.getClaimAsString("roles");

            if (role != null && !role.isBlank()) {
                return List.of(new SimpleGrantedAuthority("ROLE_" + role));
            }

            return List.of();
        });

        return converter;
    }
}
