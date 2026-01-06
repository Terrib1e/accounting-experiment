package com.accounting.platform;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class AccountingPlatformApplication {

    public static void main(String[] args) {
        SpringApplication.run(AccountingPlatformApplication.class, args);
    }
}
