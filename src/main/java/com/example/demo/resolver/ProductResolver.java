package com.example.demo.resolver;

import com.example.demo.dto.*;
import com.example.demo.modal.Product;
import com.example.demo.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.stereotype.Controller;

import jakarta.persistence.criteria.Predicate;
import java.util.ArrayList;
import java.util.List;
import org.springframework.web.bind.annotation.CrossOrigin;

@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
@Controller
@RequiredArgsConstructor
public class ProductResolver {

    private final ProductRepository productRepository;

    @QueryMapping
    public ProductPageDto products(
            @Argument Integer page,
            @Argument Integer size,
            @Argument ProductFilterInput filter,
            @Argument ProductSortInput sort) {

        // Tri
        Sort sorting = Sort.by(
                sort != null && "DESC".equalsIgnoreCase(sort.getDirection())
                        ? Sort.Direction.DESC : Sort.Direction.ASC,
                resolveField(sort)
        );

        Pageable pageable = PageRequest.of(
                page != null ? page : 0,
                size != null ? size : 10,
                sorting
        );

        // Filtrage avec Specification
        Specification<Product> spec = buildSpec(filter);
        Page<Product> result = productRepository.findAll(spec, pageable);

        PageInfoDto pageInfo = new PageInfoDto(
                result.getTotalElements(),
                result.getTotalPages(),
                result.getNumber(),
                result.getSize(),
                result.hasNext(),
                result.hasPrevious()
        );

        return new ProductPageDto(result.getContent(), pageInfo);
    }

    private String resolveField(ProductSortInput sort) {
        if (sort == null || sort.getField() == null) return "name";
        return switch (sort.getField().toUpperCase()) {
            case "PRICE"      -> "price";
            case "CREATED_AT" -> "createdAt";
            default           -> "name";
        };
    }

    private Specification<Product> buildSpec(ProductFilterInput filter) {
        return (root, query, cb) -> {
            if (filter == null) return cb.conjunction();
            List<Predicate> predicates = new ArrayList<>();

            if (filter.getName() != null && !filter.getName().isBlank())
                predicates.add(cb.like(cb.lower(root.get("name")),
                        "%" + filter.getName().toLowerCase() + "%"));

            if (filter.getMinPrice() != null)
                predicates.add(cb.greaterThanOrEqualTo(root.get("price"), filter.getMinPrice()));

            if (filter.getMaxPrice() != null)
                predicates.add(cb.lessThanOrEqualTo(root.get("price"), filter.getMaxPrice()));

            if (filter.getCategoryId() != null)
                predicates.add(cb.equal(root.get("category").get("id"), filter.getCategoryId()));

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}