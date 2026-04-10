package com.example.demo.dto;


import lombok.Data;

@Data
public class ProductFilterInput {
    private String name;
    private Double minPrice;
    private Double maxPrice;
    private Long categoryId;
}