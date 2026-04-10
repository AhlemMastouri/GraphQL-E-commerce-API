package com.example.demo.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class ClientCredentialsFilter extends OncePerRequestFilter {

    private final ClientCredentialsConfig config;

    // Chemins qui ne nécessitent pas d'authentification
    private static final String[] PUBLIC_PATHS = {
            "/graphiql", "/actuator"
    };

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        String path = request.getRequestURI();

        // Ignorer les chemins publics
        for (String publicPath : PUBLIC_PATHS) {
            if (path.contains(publicPath)) {
                filterChain.doFilter(request, response);
                return;
            }
        }

        // Lire les headers
        String clientId     = request.getHeader("X-Client-Id");
        String clientSecret = request.getHeader("X-Client-Secret");

        // Valider les credentials
        if (!config.getClientId().equals(clientId) ||
                !config.getClientSecret().equals(clientSecret)) {

            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json");
            response.getWriter().write("""
                {
                  "error": "Unauthorized",
                  "message": "Invalid client credentials. Provide X-Client-Id and X-Client-Secret headers."
                }
            """);
            return;
        }

        filterChain.doFilter(request, response);
    }


    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        // Ces chemins sont publics, pas de vérification credentials
        return path.contains("/graphiql")
                || path.contains("/graphql-ws")
                || path.contains("/actuator");
    }
}