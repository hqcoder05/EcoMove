package com.GiaoThongTM.demo.constants;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Getter
@Setter
@ConfigurationProperties(prefix = "spring.jwt")
public class JwtProperties {
    private String secret;
    private String issuer;
    private int accessTokenExpirationTime;
    private int refreshTokenExpirationTime;
}
