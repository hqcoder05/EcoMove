package com.GiaoThongTM.demo;

import com.GiaoThongTM.demo.constants.JwtProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.data.redis.RedisProperties;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

@SpringBootApplication
@EnableConfigurationProperties({ JwtProperties.class})
public class DemoGiaoThongTmApplication {

	public static void main(String[] args) {
		SpringApplication.run(DemoGiaoThongTmApplication.class, args);
	}

}
