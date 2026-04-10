package com.example.demo.resolver;

import com.example.demo.modal.*;
import com.example.demo.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.stereotype.Controller;
import reactor.core.publisher.Sinks;
import org.springframework.web.bind.annotation.CrossOrigin;

@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
@Slf4j
@Controller
@RequiredArgsConstructor
public class MutationResolver {

    private final ProductRepository productRepo;
    private final CategoryRepository categoryRepo;
    private final UserRepository userRepo;
    private final OrderRepository orderRepo;

    private final Sinks.Many<Product> productCreatedSink;
    private final Sinks.Many<Order> orderCreatedSink;
    private final Sinks.Many<Order> orderUpdatedSink;
    private final Sinks.Many<Long> orderDeletedSink;
    private final Sinks.Many<Long> productDeletedSink;

    @MutationMapping
    public Product createProduct(
            @Argument String name,
            @Argument Float price,
            @Argument Integer stock,
            @Argument Long categoryId) {

        log.info("Création produit: name={}, price={}", name, price);

        Category category = null;
        if (categoryId != null) {
            category = categoryRepo.findById(categoryId).orElse(null);
        }

        Product product = new Product();
        product.setName(name);
        product.setPrice(price != null ? price.doubleValue() : null);
        product.setStock(stock);
        product.setCategory(category);

        Product saved = productRepo.save(product);
        productCreatedSink.emitNext(saved, (signalType, emitResult) -> false);

        return saved;
    }

    @MutationMapping
    public Boolean deleteProduct(@Argument Long id) {
        log.info("Suppression produit: id={}", id);
        if (productRepo.existsById(id)) {
            productRepo.deleteById(id);
            productDeletedSink.emitNext(id, (signalType, emitResult) -> false);
            return true;
        }
        return false;
    }

    @MutationMapping
    public Order createOrder(@Argument Long userId) {
        log.info("Création commande: userId={}", userId);
        User user = userRepo.findById(userId).orElse(null);
        Order order = new Order();
        order.setUser(user);
        order.setStatus("PENDING");
        Order saved = orderRepo.save(order);
        orderCreatedSink.emitNext(saved, (signalType, emitResult) -> false);
        return saved;
    }

    @MutationMapping
    public Order updateOrderStatus(@Argument Long id, @Argument String status) {
        log.info("Mise à jour commande: id={}, status={}", id, status);
        Order order = orderRepo.findById(id).orElse(null);
        if (order != null) {
            order.setStatus(status);
            Order saved = orderRepo.save(order);
            orderUpdatedSink.emitNext(saved, (signalType, emitResult) -> false);
            return saved;
        }
        return null;
    }

    @MutationMapping
    public Boolean deleteOrder(@Argument Long id) {
        log.info("Suppression commande: id={}", id);
        if (orderRepo.existsById(id)) {
            orderRepo.deleteById(id);
            orderDeletedSink.emitNext(id, (signalType, emitResult) -> false);
            return true;
        }
        return false;
    }
}