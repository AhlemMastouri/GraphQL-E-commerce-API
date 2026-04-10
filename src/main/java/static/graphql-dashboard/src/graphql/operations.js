export const GET_PRODUCTS = `
  query GetProducts($page: Int, $size: Int, $filter: ProductFilter, $sort: ProductSort) {
    products(page: $page, size: $size, filter: $filter, sort: $sort) {
      content {
        id name price stock
        category { id name }
      }
      pageInfo {
        totalElements totalPages currentPage pageSize hasNext hasPrevious
      }
    }
  }
`;

export const GET_ORDERS = `
  query GetOrders($page: Int, $size: Int, $filter: OrderFilter, $sort: OrderSort) {
    orders(page: $page, size: $size, filter: $filter, sort: $sort) {
      content {
        id status
        user { id name }
      }
      pageInfo {
        totalElements
        totalPages
        currentPage
        pageSize
        hasNext
        hasPrevious
      }
    }
  }
`;

export const GET_CATEGORIES = `
  query GetCategories {
    categories { id name }
  }
`;

export const GET_USERS = `
  query GetUsers {
    users { id name }
  }
`;

export const CREATE_PRODUCT = `
  mutation CreateProduct($name: String!, $price: Float!, $stock: Int!, $categoryId: ID) {
    createProduct(name: $name, price: $price, stock: $stock, categoryId: $categoryId) {
      id name price stock
      category { id name }
    }
  }
`;
export const DELETE_USER = `
  mutation DeleteUser($id: ID!) {
    deleteUser(id: $id)
  }
`;
export const DELETE_PRODUCT = `
  mutation DeleteProduct($id: ID!) {
    deleteProduct(id: $id)
  }
`;

export const CREATE_ORDER = `
  mutation CreateOrder($userId: ID!) {
    createOrder(userId: $userId) {
      id status
      user { id name }
    }
  }
`;

export const UPDATE_ORDER_STATUS = `
  mutation UpdateOrderStatus($id: ID!, $status: String!) {
    updateOrderStatus(id: $id, status: $status) {
      id status
      user { id name }
    }
  }
`;

export const DELETE_ORDER = `
  mutation DeleteOrder($id: ID!) {
    deleteOrder(id: $id)
  }
`;

export const SUB_PRODUCT_CREATED = `
  subscription {
    productCreated { id name price stock category { id name } }
  }
`;

export const SUB_PRODUCT_DELETED = `
  subscription {
    productDeleted { id }
  }
`;

export const SUB_ORDER_CREATED = `
  subscription {
    orderCreated { id status user { id name } }
  }
`;

export const SUB_ORDER_UPDATED = `
  subscription {
    orderUpdated { id status user { id name } }
  }
`;

export const SUB_ORDER_DELETED = `
  subscription {
    orderDeleted { id }
  }
`;

