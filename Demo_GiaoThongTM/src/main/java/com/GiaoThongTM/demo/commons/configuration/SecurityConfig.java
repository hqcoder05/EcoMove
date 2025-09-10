// package com.GiaoThongTM.demo.commons.configuration;

// import com.GiaoThongTM.demo.commons.constants.JwtProperties;
// import com.nimbusds.jose.JWSAlgorithm;
// import com.nimbusds.jose.jwk.JWKSet;
// import com.nimbusds.jose.jwk.OctetSequenceKey;
// import com.nimbusds.jose.jwk.source.ImmutableJWKSet;
// import lombok.RequiredArgsConstructor;
// import org.springframework.context.annotation.Bean;
// import org.springframework.context.annotation.Configuration;
// import org.springframework.security.config.annotation.web.builders.HttpSecurity;
// import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
// import org.springframework.security.config.http.SessionCreationPolicy;
// import org.springframework.security.core.authority.SimpleGrantedAuthority;
// import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
// import org.springframework.security.oauth2.jwt.JwtDecoder;
// import org.springframework.security.oauth2.jwt.JwtEncoder;
// import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
// import org.springframework.security.oauth2.jwt.NimbusJwtEncoder;
// import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
// import org.springframework.security.web.SecurityFilterChain;
// import org.springframework.web.cors.CorsConfiguration;
// import org.springframework.web.cors.CorsConfigurationSource;
// import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

// import javax.crypto.spec.SecretKeySpec;
// import java.util.List;

// @Configuration
// @EnableWebSecurity
// @RequiredArgsConstructor
// public class SecurityConfig {

//     private final JwtProperties jwtProperties;

//     @Bean
//     public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
//         http
//                 .cors() // <--- Bắt buộc: kích hoạt cấu hình CORS bạn đã viết ở bean corsConfigurationSource
//                 .and()
//                 .csrf(csrf -> csrf.disable())
//                 .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
//                 .authorizeHttpRequests(request -> request
//                         .requestMatchers("/ai/**").permitAll()
//                         .requestMatchers("/auth/sign-in", "/auth/sign-up", "/auth/password/**").permitAll()
//                         .anyRequest().authenticated()
//                 )
//                 .oauth2ResourceServer(oauth2 -> oauth2.jwt(
//                         jwtConfigurer -> jwtConfigurer.jwtAuthenticationConverter(new JwtAuthenticationConverter())
//                 ));


//         return http.build();
//     }

//     @Bean
//     public CorsConfigurationSource corsConfigurationSource() {
//         CorsConfiguration configuration = new CorsConfiguration();
//         configuration.setAllowedOrigins(List.of("http://localhost:3000")); // hoặc List.of("https://frontend.com") để giới hạn

//         configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
//         configuration.setAllowedHeaders(List.of("*"));
//         configuration.setAllowCredentials(true);

//         UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
//         source.registerCorsConfiguration("/**", configuration);
//         return source;
//     }

//     @Bean
//     public JwtDecoder jwtDecoder() {
//         SecretKeySpec secretKeySpec = new SecretKeySpec(jwtProperties.getSecret().getBytes(), JWSAlgorithm.HS512.toString());
//         NimbusJwtDecoder nimbusJwtDecoder = NimbusJwtDecoder
//                 .withSecretKey(secretKeySpec)
//                 .macAlgorithm(MacAlgorithm.HS512)
//                 .build();
//         return nimbusJwtDecoder;
//     }

//     @Bean
//     public JwtEncoder jwtEncoder(){
//         SecretKeySpec secretKeySpec = new SecretKeySpec(this.jwtProperties.getSecret().getBytes(),
//                 JWSAlgorithm.HS512.toString());
//         OctetSequenceKey jwk = new OctetSequenceKey.Builder(secretKeySpec.getEncoded())
//                 .algorithm(JWSAlgorithm.HS512)
//                 .build();
//         JWKSet jwkSet =  new JWKSet(jwk);
//         return new NimbusJwtEncoder(new ImmutableJWKSet<>(jwkSet));
//     }

//     @Bean
//     public JwtAuthenticationConverter jwtAuthenticationConverter() {
//         JwtAuthenticationConverter converter = new JwtAuthenticationConverter();

//         converter.setJwtGrantedAuthoritiesConverter(jwt -> {
//             String role = jwt.getClaimAsString("roles");

//             if (role != null && !role.isBlank()) {
//                 return List.of(new SimpleGrantedAuthority("ROLE_" + role));
//             }

//             return List.of();
//         });

//         return converter;
//     }
// }
package com.GiaoThongTM.demo.commons.configuration;

// import com.GiaoThongTM.demo.commons.constants.JwtProperties;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    // private final JwtProperties jwtProperties;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable()) // tắt CSRF
            .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth.anyRequest().permitAll()); // cho phép tất cả request

        return http.build();
    }
}
