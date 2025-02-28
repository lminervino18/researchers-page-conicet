package com.researchers_conicet.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

@Configuration  // Marks this class as a configuration class for Spring
public class CorsConfig {

    @Bean  // Indicates that this method produces a bean to be managed by Spring
    public CorsFilter corsFilter() {
        // Create new CORS configuration
        CorsConfiguration corsConfiguration = new CorsConfiguration();
        
        // Allow frontend URL (Vite default port)
        corsConfiguration.addAllowedOrigin("http://localhost:5173");
        // Allow alternative Vite port
        corsConfiguration.addAllowedOrigin("http://localhost:5174");
        
        // Allow common HTTP methods
        corsConfiguration.addAllowedMethod("GET");     // To fetch data
        corsConfiguration.addAllowedMethod("POST");    // To create new resources
        corsConfiguration.addAllowedMethod("PUT");     // To update existing resources
        corsConfiguration.addAllowedMethod("DELETE");  // To delete resources
        corsConfiguration.addAllowedMethod("OPTIONS"); // For preflight requests
        
        // Allow all headers
        corsConfiguration.addAllowedHeader("*");
        
        // Allow credentials (cookies, authorization headers, etc.)
        corsConfiguration.setAllowCredentials(true);
        
        // Create URL based configuration source
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        
        // Register CORS configuration for all paths
        source.registerCorsConfiguration("/**", corsConfiguration);
        
        // Create and return the CORS filter
        return new CorsFilter(source);
    }
}