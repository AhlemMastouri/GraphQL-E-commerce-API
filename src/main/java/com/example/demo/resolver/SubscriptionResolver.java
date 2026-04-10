package com.example.demo.resolver;

import com.example.demo.modal.*;
import lombok.RequiredArgsConstructor;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.SubscriptionMapping;
import org.springframework.stereotype.Controller;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Sinks;

import java.util.Map;

@Controller
@RequiredArgsConstructor
public class SubscriptionResolver {

    private final Sinks.Many<Product> productCreatedSink;
    private final Sinks.Many<Order>   orderCreatedSink;
    private final Sinks.Many<Order>   orderUpdatedSink;
    private final Sinks.Many<Long>    orderDeletedSink;
    private final Sinks.Many<Long>    productDeletedSink;

    @SubscriptionMapping
    public Flux<Product> productCreated() {
        return productCreatedSink.asFlux();
    }

    @SubscriptionMapping
    public Flux<Product> productDeleted() {
        // On émet un Product "fantôme" avec juste l'id pour que Spring GraphQL
        // puisse sérialiser le type Product défini dans le schéma
        return productDeletedSink.asFlux()
                .map(id -> {
                    Product p = new Product();
                    p.setId(id);
                    return p;
                });
    }

    @SubscriptionMapping
    public Flux<Order> orderCreated() {
        return orderCreatedSink.asFlux();
    }

    @SubscriptionMapping
    public Flux<Order> orderUpdated() {
        return orderUpdatedSink.asFlux();
    }

    @SubscriptionMapping
    public Flux<Order> orderDeleted() {
        // Idem — on émet un Order "fantôme" avec juste l'id
        return orderDeletedSink.asFlux()
                .map(id -> {
                    Order o = new Order();
                    o.setId(id);
                    return o;
                });
    }

    @SubscriptionMapping
    public Flux<Order> orderByUser(@Argument Long userId) {
        return orderCreatedSink.asFlux()
                .filter(order -> order.getUser() != null
                        && order.getUser().getId().equals(userId));
    }
}
