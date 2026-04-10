package com.example.demo.dto;


import lombok.Data;

@Data
public class ProductSortInput {
    private String field = "name";      // NAME, PRICE, CREATED_AT
    private String direction = "ASC";   // ASC, DESC
}
