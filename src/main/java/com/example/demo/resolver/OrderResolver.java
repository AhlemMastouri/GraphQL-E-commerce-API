package com.example.demo.resolver;

import com.example.demo.dto.*;
import com.example.demo.modal.Order;
import com.example.demo.repository.OrderRepository;
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
public class OrderResolver {

    private final OrderRepository orderRepository;

    @QueryMapping
    public OrderPageDto orders(
            @Argument Integer page,
            @Argument Integer size,
            @Argument OrderFilterInput filter,
            @Argument OrderSortInput sort) {

        int pageNum = (page != null) ? page : 0;
        int pageSize = (size != null) ? size : 10;

        Sort sortObj = buildSort(sort);
        Pageable pageable = PageRequest.of(pageNum, pageSize, sortObj);

        Specification<Order> spec = buildSpec(filter);
        Page<Order> result = orderRepository.findAll(pageable);

        PageInfoDto pageInfo = new PageInfoDto(
                result.getTotalElements(),
                result.getTotalPages(),
                result.getNumber(),
                result.getSize(),
                result.hasNext(),
                result.hasPrevious()
        );

        return new OrderPageDto(result.getContent(), pageInfo);
    }

    private Sort buildSort(OrderSortInput sort) {
        if (sort == null || sort.getField() == null) {
            return Sort.by(Sort.Direction.ASC, "id");
        }

        String field = "id";
        if ("STATUS".equalsIgnoreCase(sort.getField())) {
            field = "status";
        }

        Sort.Direction direction = "DESC".equalsIgnoreCase(sort.getDirection())
                ? Sort.Direction.DESC : Sort.Direction.ASC;

        return Sort.by(direction, field);
    }

    private Specification<Order> buildSpec(OrderFilterInput filter) {
        return (root, query, cb) -> {
            if (filter == null) return cb.conjunction();
            List<Predicate> predicates = new ArrayList<>();

            if (filter.getStatus() != null && !filter.getStatus().isBlank()) {
                predicates.add(cb.equal(root.get("status"), filter.getStatus()));
            }

            if (filter.getUserId() != null) {
                predicates.add(cb.equal(root.get("user").get("id"), filter.getUserId()));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}