package com.example.demo.config;

import com.example.demo.modal.*;
import com.example.demo.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final OrderRepository orderRepository;

    @Override
    public void run(String... args) {
        log.info("🚀 Début DataSeeder...");

        seedCategories();
        seedUsers();
        seedProducts();
        seedOrders();

        log.info("🎉 DataSeeder terminé avec succès !");
    }

    // =========================
    // 1. CATEGORIES
    // =========================
    private void seedCategories() {
        if (categoryRepository.count() > 0) {
            log.info("✔ Categories already exist, skipping...");
            return;
        }

        // ✅ Utilisation des setters au lieu du constructeur avec args
        Category electronics = new Category();
        electronics.setName("Electronics");

        Category clothing = new Category();
        clothing.setName("Clothing");

        Category books = new Category();
        books.setName("Books");

        Category home = new Category();
        home.setName("Home & Kitchen");

        categoryRepository.saveAll(List.of(electronics, clothing, books, home));
        log.info("✔ 4 categories inserted");
    }

    // =========================
    // 2. USERS
    // =========================
    private void seedUsers() {
        if (userRepository.count() > 0) {
            log.info("✔ Users already exist, skipping...");
            return;
        }

        // ✅ Utilisation des setters
        User ahlem = new User();
        ahlem.setName("Ahlem");
        ahlem.setEmail("ahlem@mail.com");
        ahlem.setPassword("123456");

        User admin = new User();
        admin.setName("Admin");
        admin.setEmail("admin@mail.com");
        admin.setPassword("admin123");

        userRepository.saveAll(List.of(ahlem, admin));
        log.info("✔ 2 users inserted");
    }

    // =========================
    // 3. PRODUCTS
    // =========================
    private void seedProducts() {
        if (productRepository.count() > 0) {
            log.info("✔ Products already exist, skipping...");
            return;
        }

        // ✅ findByName retourne Optional<Category>
        Optional<Category> electronicsOpt = categoryRepository.findByName("Electronics");
        Optional<Category> clothingOpt    = categoryRepository.findByName("Clothing");
        Optional<Category> booksOpt       = categoryRepository.findByName("Books");

        if (electronicsOpt.isEmpty() || clothingOpt.isEmpty() || booksOpt.isEmpty()) {
            log.warn("⚠ Catégories manquantes, seedProducts() annulé.");
            return;
        }

        Category electronics = electronicsOpt.get();
        Category clothing    = clothingOpt.get();
        Category books       = booksOpt.get();

        // ✅ Utilisation des setters
        Product p1 = new Product(); p1.setName("iPhone 15");        p1.setPrice(3200.0); p1.setStock(10);  p1.setCategory(electronics);
        Product p2 = new Product(); p2.setName("Laptop HP");        p2.setPrice(2500.0); p2.setStock(5);   p2.setCategory(electronics);
        Product p3 = new Product(); p3.setName("T-shirt Nike");     p3.setPrice(80.0);   p3.setStock(50);  p3.setCategory(clothing);
        Product p4 = new Product(); p4.setName("Jeans Levi's");     p4.setPrice(120.0);  p4.setStock(30);  p4.setCategory(clothing);
        Product p5 = new Product(); p5.setName("Java Book");        p5.setPrice(60.0);   p5.setStock(100); p5.setCategory(books);
        Product p6 = new Product(); p6.setName("Spring Boot Guide");p6.setPrice(90.0);   p6.setStock(70);  p6.setCategory(books);

        productRepository.saveAll(List.of(p1, p2, p3, p4, p5, p6));
        log.info("✔ 6 products inserted");
    }

    // =========================
    // 4. ORDERS
    // =========================
    private void seedOrders() {
        if (orderRepository.count() > 0) {
            log.info("✔ Orders already exist, skipping...");
            return;
        }

        // ✅ findByEmail retourne Optional<User> — à ajouter dans UserRepository
        Optional<User> user1Opt = userRepository.findByEmail("ahlem@mail.com");
        Optional<User> user2Opt = userRepository.findByEmail("admin@mail.com");

        if (user1Opt.isEmpty() || user2Opt.isEmpty()) {
            log.warn("⚠ Utilisateurs manquants, seedOrders() annulé.");
            return;
        }

        User user1 = user1Opt.get();
        User user2 = user2Opt.get();

        // ✅ Utilisation des setters
        Order o1 = new Order(); o1.setUser(user1); o1.setTotalPrice(120.5); o1.setStatus("CONFIRMED");
        Order o2 = new Order(); o2.setUser(user1); o2.setTotalPrice(89.9);  o2.setStatus("PENDING");
        Order o3 = new Order(); o3.setUser(user2); o3.setTotalPrice(45.0);  o3.setStatus("SHIPPED");
        Order o4 = new Order(); o4.setUser(user2); o4.setTotalPrice(250.0); o4.setStatus("DELIVERED");

        orderRepository.saveAll(List.of(o1, o2, o3, o4));
        log.info("✔ 4 orders inserted");
    }
}