package com.example.demo.dto;

import com.example.demo.modal.Product;
import lombok.AllArgsConstructor;
import lombok.Data;
import java.util.List;

@Data
@AllArgsConstructor
public class ProductPageDto {
    private List<Product> content;
    private PageInfoDto pageInfo;
}