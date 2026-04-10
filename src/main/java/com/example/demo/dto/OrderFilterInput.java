package com.example.demo.dto;

import lombok.Data;

@Data
public class OrderFilterInput {
    private String status;
    private Long userId;
}