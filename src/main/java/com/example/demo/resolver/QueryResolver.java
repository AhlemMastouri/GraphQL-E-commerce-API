package com.example.demo.resolver;

import com.example.demo.modal.*;
import com.example.demo.repository.*;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.graphql.data.method.annotation.SchemaMapping;
import org.springframework.stereotype.Controller;

import java.util.List;
import org.springframework.web.bind.annotation.CrossOrigin;

@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
@Controller
public class QueryResolver {

    private final ProductRepository  productRepo;
    private final OrderRepository    orderRepo;
    private final CategoryRepository categoryRepo;
    private final UserRepository     userRepo;

    public QueryResolver(ProductRepository  productRepo,
                         OrderRepository    orderRepo,
                         CategoryRepository categoryRepo,
                         UserRepository     userRepo) {
        this.productRepo  = productRepo;
        this.orderRepo    = orderRepo;
        this.categoryRepo = categoryRepo;
        this.userRepo     = userRepo;
    }

    @QueryMapping
    public List<Category> categories() {
        return categoryRepo.findAll();
    }

    @QueryMapping
    public List<User> users() {
        return userRepo.findAll();
    }

    @QueryMapping
    public Order orderById(@Argument Long id) {
        return orderRepo.findById(id).orElse(null);
    }

    @QueryMapping
    public Product productById(@Argument Long id) {
        return productRepo.findById(id).orElse(null);
    }

    @QueryMapping
    public User userById(@Argument Long id) {
        return userRepo.findById(id).orElse(null);
    }

    @QueryMapping
    public Category categoryById(@Argument Long id) {
        return categoryRepo.findById(id).orElse(null);
    }

    @SchemaMapping(typeName = "Product", field = "category")
    public Category productCategory(Product product) {
        if (product.getCategory() == null) return null;
        return categoryRepo.findById(product.getCategory().getId()).orElse(null);
    }

    @SchemaMapping(typeName = "Order", field = "user")
    public User orderUser(Order order) {
        if (order.getUser() == null) return null;
        return userRepo.findById(order.getUser().getId()).orElse(null);
    }
}