package com.example.demo.dto;

import lombok.Data;

@Data
public class OrderSortInput {
    private String field;     // ID, STATUS
    private String direction; // ASC, DESC
}