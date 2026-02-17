// Cart utility functions for managing shopping cart

// Get cart items from localStorage
export const getCartItems = () => {
  try {
    const cartItems = localStorage.getItem('cartItems');
    const items = cartItems ? JSON.parse(cartItems) : [];
    console.log('Retrieved cart items from localStorage:', items); // Debug log
    return items;
  } catch (error) {
    console.error('Error getting cart items:', error);
    return [];
  }
};

// Save cart items to localStorage
export const saveCartItems = (items) => {
  try {
    localStorage.setItem('cartItems', JSON.stringify(items));
  } catch (error) {
    console.error('Error saving cart items:', error);
  }
};

// Add item to cart
export const addToCart = (product, quantity = 1) => {
  try {
    console.log('Adding to cart:', product, 'quantity:', quantity); // Debug log
    const cartItems = getCartItems();
    const existingItemIndex = cartItems.findIndex(item => item.productId === product.id);
    
    if (existingItemIndex >= 0) {
      // Update quantity if item already exists
      cartItems[existingItemIndex].quantity += quantity;
      console.log('Updated existing item quantity:', cartItems[existingItemIndex]); // Debug log
    } else {
      // Add new item to cart
      const cartItem = {
        id: Date.now(), // Simple ID generation
        productId: product.id,
        name: product.name,
        category: product.category || "Eco-Friendly Product",
        description: product.description,
        price: product.price,
        image: product.image_url || product.image,
        quantity: quantity,
        stock: product.stock || 0
      };
      cartItems.push(cartItem);
      console.log('Added new item to cart:', cartItem); // Debug log
    }
    
    saveCartItems(cartItems);
    console.log('Cart after adding:', cartItems); // Debug log
    return cartItems;
  } catch (error) {
    console.error('Error adding to cart:', error);
    return getCartItems();
  }
};

// Remove item from cart
export const removeFromCart = (itemId) => {
  try {
    const cartItems = getCartItems();
    const updatedItems = cartItems.filter(item => item.id !== itemId);
    saveCartItems(updatedItems);
    return updatedItems;
  } catch (error) {
    console.error('Error removing from cart:', error);
    return getCartItems();
  }
};

// Update item quantity in cart
export const updateCartItemQuantity = (itemId, quantity) => {
  try {
    const cartItems = getCartItems();
    const itemIndex = cartItems.findIndex(item => item.id === itemId);
    
    if (itemIndex >= 0) {
      if (quantity <= 0) {
        // Remove item if quantity is 0 or less
        return removeFromCart(itemId);
      } else {
        cartItems[itemIndex].quantity = quantity;
        saveCartItems(cartItems);
      }
    }
    
    return cartItems;
  } catch (error) {
    console.error('Error updating cart item quantity:', error);
    return getCartItems();
  }
};

// Get total cart count
export const getCartCount = () => {
  try {
    const cartItems = getCartItems();
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  } catch (error) {
    console.error('Error getting cart count:', error);
    return 0;
  }
};

// Clear entire cart
export const clearCart = () => {
  try {
    localStorage.removeItem('cartItems');
  } catch (error) {
    console.error('Error clearing cart:', error);
  }
};