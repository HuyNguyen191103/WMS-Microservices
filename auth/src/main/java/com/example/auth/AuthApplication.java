package com.example.auth;

import com.example.auth.config.JwtProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

@SpringBootApplication
@EnableConfigurationProperties(JwtProperties.class)
public class AuthApplication {

	public static void main(String[] args) {
//		DotenvLoader.load();
		SpringApplication.run(AuthApplication.class, args);
	}

}
