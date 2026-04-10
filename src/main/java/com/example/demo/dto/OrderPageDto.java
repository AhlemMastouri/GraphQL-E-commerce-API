package com.example.demo.dto;

import com.example.demo.modal.Order;
import lombok.AllArgsConstructor;
import lombok.Data;
import java.util.List;

@Data
@AllArgsConstructor
public class OrderPageDto {
    private List<Order> content;
    private PageInfoDto pageInfo;
}