package com.researchers_conicet;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import io.github.cdimascio.dotenv.Dotenv;

@SpringBootApplication
public class InvestigadoresConicetBackendApplication {
    public static void main(String[] args) {
        // Carga el .env
        Dotenv dotenv = Dotenv.configure()
                              .directory(".")       // opcional si está en la raíz
                              .ignoreIfMissing()    // opcional
                              .load();

        // Forzamos a que estén disponibles en System.getenv()
        dotenv.entries().forEach(entry ->
            System.setProperty(entry.getKey(), entry.getValue())
        );
        SpringApplication.run(InvestigadoresConicetBackendApplication.class, args);
    }
}