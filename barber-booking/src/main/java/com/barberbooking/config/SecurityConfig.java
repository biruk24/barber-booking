package com.barberbooking.config;

import com.barberbooking.security.JwtAuthenticationFilter;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfigurationSource;

@Configuration
public class SecurityConfig {


    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationEntryPoint authenticationEntryPoint() {
        return (request, response, exception) -> {
            response.setStatus(HttpStatus.UNAUTHORIZED.value());
            response.setContentType("application/json");
            response.setCharacterEncoding("UTF-8");

            response.getWriter().write(
                    "{\"message\":\"Authentication is required to access this resource\"}"
            );
        };
    }

    @Bean
    public AccessDeniedHandler accessDeniedHandler() {
        return (request, response, exception) -> {
            response.setStatus(HttpStatus.FORBIDDEN.value());
            response.setContentType("application/json");
            response.setCharacterEncoding("UTF-8");

            response.getWriter().write(
                    "{\"message\":\"You are not allowed to access this resource\"}"
            );
        };
    }

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http,
            CorsConfigurationSource corsConfigurationSource
    ) throws Exception {

        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource))

                .csrf(csrf -> csrf.disable())

                .sessionManagement(session ->
                        session.sessionCreationPolicy(
                                SessionCreationPolicy.STATELESS
                        )
                )

                .exceptionHandling(exceptions -> exceptions
                        .authenticationEntryPoint(authenticationEntryPoint())
                        .accessDeniedHandler(accessDeniedHandler())
                )

                .authorizeHttpRequests(auth -> auth

                        // Public registration and login
                        .requestMatchers(
                                "/api/test/register",
                                "/api/test/login"
                        ).permitAll()

                        // Public list of all shops
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/shops"
                        ).permitAll()

                        // Public working hours
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/shops/*/working-hours"
                        ).permitAll()

                        // Public shop details
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/shops/*"
                        ).permitAll()

                        // Public services
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/shops/*/services"
                        ).permitAll()

                        // Public availability
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/shops/*/availability"
                        ).permitAll()

                        // Customers can book without logging in
                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/shops/*/appointments"
                        ).permitAll()

                        // Permit Spring's error endpoint
                        .requestMatchers("/error").permitAll()

                        // All other requests require authentication
                        .anyRequest().authenticated()
                )

                .formLogin(form -> form.disable())
                .httpBasic(basic -> basic.disable())

                .addFilterBefore(
                        jwtAuthenticationFilter,
                        UsernamePasswordAuthenticationFilter.class
                );

        return http.build();
    }


}
