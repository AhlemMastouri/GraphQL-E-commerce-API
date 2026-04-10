package com.example.demo.resolver;


import org.springframework.graphql.data.method.annotation.SchemaMapping;
import org.springframework.stereotype.Controller;

import java.util.Map;
import org.springframework.web.bind.annotation.CrossOrigin;

@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
@Controller
public class DeletedTypeResolver {

    /**
     * Résout le champ 'id' pour le type DeletedOrder
     */
    @SchemaMapping(typeName = "DeletedOrder", field = "id")
    public String resolveDeletedOrderId(Map<String, Object> deletedOrder) {
        Object id = deletedOrder.get("id");
        return id != null ? id.toString() : null;
    }

    /**
     * Résout le champ 'id' pour le type DeletedProduct
     */
    @SchemaMapping(typeName = "DeletedProduct", field = "id")
    public String resolveDeletedProductId(Map<String, Object> deletedProduct) {
        Object id = deletedProduct.get("id");
        return id != null ? id.toString() : null;
    }
}
