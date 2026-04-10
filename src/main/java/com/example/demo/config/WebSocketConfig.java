package com.example.demo.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

/**
 * Configuration minimale WebSocket.
 * Spring GraphQL gère automatiquement /graphql-ws via application.properties.
 * Cette classe permet juste d'autoriser les origines cross-origin.
 */
@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer {

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        // Spring GraphQL enregistre son propre handler sur /graphql-ws
        // On n'ajoute rien ici — juste laisser Spring faire son travail
    }
}
