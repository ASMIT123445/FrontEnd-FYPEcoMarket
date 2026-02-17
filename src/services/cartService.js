import axiosInstance from './axiosInstance';

// Cart API service functions
export const cartService = {
  // Get user's cart
  async getCart() {
    try {
      const response = await axiosInstance.get('/cart/');
      return response.data;
    } catch (error) {
      console.error('Error fetching cart:', error);
      throw error;
    }
  },

  // Add item to cart
  async addToCart(productId, quantity = 1) {
    try {
      const response = await axiosInstance.post('/cart/add/', {
        product_id: productId,
        quantity: quantity
      });
      return response.data;
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error;
    }
  },

  // Update cart item quantity
  async updateCartItem(itemId, quantity) {
    try {
      const response = await axiosInstance.put(`/cart/items/${itemId}/`, {
        quantity: quantity
      });
      return response.data;
    } catch (error) {
      console.error('Error updating cart item:', error);
      throw error;
    }
  },

  // Remove item from cart
  async removeFromCart(itemId) {
    try {
      const response = await axiosInstance.delete(`/cart/items/${itemId}/remove/`);
      return response.data;
    } catch (error) {
      console.error('Error removing from cart:', error);
      throw error;
    }
  },

  // Clear entire cart
  async clearCart() {
    try {
      const response = await axiosInstance.delete('/cart/clear/');
      return response.data;
    } catch (error) {
      console.error('Error clearing cart:', error);
      throw error;
    }
  },

  // Get cart count
  async getCartCount() {
    try {
      const response = await axiosInstance.get('/cart/count/');
      return response.data.count;
    } catch (error) {
      console.error('Error getting cart count:', error);
      return 0;
    }
  }
};