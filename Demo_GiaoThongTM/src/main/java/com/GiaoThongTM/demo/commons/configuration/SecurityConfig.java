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
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import javax.crypto.spec.SecretKeySpec;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Objects;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtProperties jwtProperties;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                // Public
                .requestMatchers("/ai/**").permitAll()
                .requestMatchers("/auth/sign-in"
                    , "/auth/sign-up"
                    , "/auth/password/**"
                    , "/vehicles/**"
                    ,"/stations/**"
                    ,"/bookings/**"
                    , "/payments/**"
                    , "/users/**"
                    , "/roles/**"
                    , "/permissions/**"
                    ).permitAll()
                .anyRequest().authenticated()
            )

            .oauth2ResourceServer(oauth2 -> oauth2
                .jwt(jwt -> jwt.jwtAuthenticationConverter(jwtAuthenticationConverter()))
            );

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration cfg = new CorsConfiguration();
        // Thêm cả 3000 và 5173 (React/Vite)
        cfg.setAllowedOrigins(List.of("http://localhost:3000", "http://localhost:5173"));
        cfg.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        cfg.setAllowedHeaders(List.of("Authorization", "Content-Type", "Accept", "Origin", "X-Requested-With"));
        cfg.setExposedHeaders(List.of("Authorization", "Content-Type"));
        cfg.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", cfg);
        return source;
    }

    @Bean
    public JwtDecoder jwtDecoder() {
        SecretKeySpec secretKeySpec = new SecretKeySpec(jwtProperties.getSecret().getBytes(), JWSAlgorithm.HS512.toString());
        return NimbusJwtDecoder
            .withSecretKey(secretKeySpec)
            .macAlgorithm(MacAlgorithm.HS512)
            .build();
    }

    @Bean
    public JwtEncoder jwtEncoder() {
        SecretKeySpec secretKeySpec = new SecretKeySpec(this.jwtProperties.getSecret().getBytes(),
                JWSAlgorithm.HS512.toString());
        OctetSequenceKey jwk = new OctetSequenceKey.Builder(secretKeySpec.getEncoded())
                .algorithm(JWSAlgorithm.HS512)
                .build();
        JWKSet jwkSet = new JWKSet(jwk);
        return new NimbusJwtEncoder(new ImmutableJWKSet<>(jwkSet));
    }

    @Bean
    public JwtAuthenticationConverter jwtAuthenticationConverter() {
        JwtAuthenticationConverter converter = new JwtAuthenticationConverter();

        converter.setJwtGrantedAuthoritiesConverter(jwt -> {
            // Hỗ trợ cả "roles" dạng String lẫn List<String>
            Object raw = jwt.getClaim("roles");
            Collection<GrantedAuthority> authorities = new ArrayList<>();

            if (raw instanceof String str && !str.isBlank()) {
                authorities.add(new SimpleGrantedAuthority(prefixRole(str)));
            } else if (raw instanceof Collection<?> coll) {
                for (Object r : coll) {
                    if (r != null) {
                        String s = Objects.toString(r, "").trim();
                        if (!s.isEmpty()) {
                            authorities.add(new SimpleGrantedAuthority(prefixRole(s)));
                        }
                    }
                }
            }

            // Bảo đảm tối thiểu ROLE_user (để user luôn có full quyền như yêu cầu)
            if (authorities.stream().noneMatch(a -> a.getAuthority().equals("ROLE_user"))) {
                authorities.add(new SimpleGrantedAuthority("ROLE_user"));
            }

            return authorities;
        });

        return converter;
    }

    private static String prefixRole(String role) {
        // Chuẩn hoá: bỏ khoảng trắng, về lowercase cho đồng nhất
        String r = role.trim();
        if (r.startsWith("ROLE_")) return r;
        return "ROLE_" + r.toLowerCase();
    }
}
