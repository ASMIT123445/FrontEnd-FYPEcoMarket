// Wishlist Service - Using localStorage for now (can be replaced with API later)

class WishlistService {
    constructor() {
        this.storageKey = 'ecomarket_wishlist';
    }

    // Get all wishlist items
    getWishlist() {
        try {
            const wishlist = localStorage.getItem(this.storageKey);
            return wishlist ? JSON.parse(wishlist) : [];
        } catch (error) {
            console.error('Error getting wishlist:', error);
            return [];
        }
    }

    // Add item to wishlist
    addToWishlist(product) {
        try {
            const wishlist = this.getWishlist();
            const existingIndex = wishlist.findIndex(item => item.id === product.id);
            
            if (existingIndex === -1) {
                wishlist.push({
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    oldPrice: product.oldPrice,
                    image: product.image_url || product.image,
                    category: product.category_display || product.category,
                    seller: product.seller,
                    eco_rating: product.eco_rating,
                    reviews: product.reviews,
                    addedAt: new Date().toISOString()
                });
                
                localStorage.setItem(this.storageKey, JSON.stringify(wishlist));
                window.dispatchEvent(new Event('wishlistUpdated'));
                return true;
            }
            return false; // Already in wishlist
        } catch (error) {
            console.error('Error adding to wishlist:', error);
            return false;
        }
    }

    // Remove item from wishlist
    removeFromWishlist(productId) {
        try {
            const wishlist = this.getWishlist();
            const filteredWishlist = wishlist.filter(item => item.id !== productId);
            localStorage.setItem(this.storageKey, JSON.stringify(filteredWishlist));
            window.dispatchEvent(new Event('wishlistUpdated'));
            return true;
        } catch (error) {
            console.error('Error removing from wishlist:', error);
            return false;
        }
    }

    // Check if item is in wishlist
    isInWishlist(productId) {
        try {
            const wishlist = this.getWishlist();
            return wishlist.some(item => item.id === productId);
        } catch (error) {
            console.error('Error checking wishlist:', error);
            return false;
        }
    }

    // Get wishlist count
    getWishlistCount() {
        return this.getWishlist().length;
    }

    // Clear entire wishlist
    clearWishlist() {
        try {
            localStorage.removeItem(this.storageKey);
            return true;
        } catch (error) {
            console.error('Error clearing wishlist:', error);
            return false;
        }
    }
}

export const wishlistService = new WishlistService();