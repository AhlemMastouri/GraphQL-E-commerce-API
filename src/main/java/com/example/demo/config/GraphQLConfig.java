package com.example.demo.config;

import com.example.demo.modal.Order;
import com.example.demo.modal.Product;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import reactor.core.publisher.Sinks;

@Configuration
public class GraphQLConfig {

    // ===================== PRODUCT =====================
    @Bean
    public Sinks.Many<Product> productCreatedSink() {
        return Sinks.many().multicast().onBackpressureBuffer(256, false); // ← false = no autoCancel
    }

    @Bean
    public Sinks.Many<Product> productUpdatedSink() {
        return Sinks.many().multicast().onBackpressureBuffer(256, false);
    }

    @Bean
    public Sinks.Many<Long> productDeletedSink() {
        return Sinks.many().multicast().onBackpressureBuffer(256, false);
    }

    // ===================== ORDER =====================
    @Bean
    public Sinks.Many<Order> orderCreatedSink() {
        return Sinks.many().multicast().onBackpressureBuffer(256, false);
    }

    @Bean
    public Sinks.Many<Order> orderUpdatedSink() {
        return Sinks.many().multicast().onBackpressureBuffer(256, false);
    }

    @Bean
    public Sinks.Many<Long> orderDeletedSink() {
        return Sinks.many().multicast().onBackpressureBuffer(256, false);
    }
}