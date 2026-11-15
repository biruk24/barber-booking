package com.barberbooking.security;

import com.barberbooking.service.JwtService;
import io.jsonwebtoken.Claims;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;

    public JwtAuthenticationFilter(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {

        String path = request.getServletPath();
        String method = request.getMethod();

        // CORS preflight
        if ("OPTIONS".equalsIgnoreCase(method)) {
            return true;
        }

        // Public authentication
        if (path.equals("/api/auth/login")
                || path.equals("/api/auth/register")) {
            return true;
        }

        // Public shop GET endpoints
        if ("GET".equalsIgnoreCase(method)
                && (path.equals("/api/shops")
                || path.startsWith("/api/shops/"))) {
            return true;
        }

        // Public customer appointment booking
        return "POST".equalsIgnoreCase(method)
                && path.matches("/api/shops/[^/]+/appointments");
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");

        // No token: Spring Security decides access.
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = authHeader.substring(7).trim();

        try {
            Claims claims = jwtService.extractAllClaims(token);

            String email = claims.getSubject();
            String role = claims.get("role", String.class);

            if (email == null || email.isBlank()
                    || role == null || role.isBlank()) {
                SecurityContextHolder.clearContext();
                response.sendError(401, "Invalid authentication token");
                return;
            }

            String authority = role.startsWith("ROLE_")
                    ? role
                    : "ROLE_" + role;

            UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(
                            email,
                            null,
                            List.of(new SimpleGrantedAuthority(authority))
                    );

            SecurityContextHolder.getContext()
                    .setAuthentication(authentication);

        } catch (Exception exception) {
            SecurityContextHolder.clearContext();
            response.sendError(401, "Invalid or expired authentication token");
            return;
        }

        filterChain.doFilter(request, response);
    }
}