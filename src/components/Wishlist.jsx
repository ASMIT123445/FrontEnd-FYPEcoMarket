import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaHome, FaChevronRight, FaHeart, FaShoppingCart, FaTrash, FaStar } from 'react-icons/fa';
import { wishlistService } from '../services/wishlistService';
import { cartService } from '../services/cartService';
import axiosInstance from '../services/axiosInstance';
import { getImageUrl, handleImageError } from '../utils/imageHelper';
import Header from './Header';
import '../styles/Wishlist.css';
import Footer from './Footer';
import { showConfirm, showToast } from './Toast';

const Wishlist = () => {
    const navigate = useNavigate();
    const [wishlistItems, setWishlistItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadWishlist = async () => {
            try {
                const saved = wishlistService.getWishlist();
                if (saved.length === 0) { setWishlistItems([]); setLoading(false); return; }

                // Fetch fresh product data for all wishlisted IDs
                const ids = saved.map(i => i.id);
                const results = await Promise.allSettled(
                    ids.map(id => axiosInstance.get(`/products/${id}/`))
                );

                const fresh = results.map((res, idx) => {
                    if (res.status === 'fulfilled') {
                        const p = res.value.data;
                        return {
                            id: p.id,
                            name: p.name,
                            price: p.price,
                            image: p.image_url || p.image,
                            image_url: p.image_url,
                            category: p.category_display || p.eco_category_detail?.name || p.category || '—',
                            seller: p.seller_name || '—',
                            rating: p.rating || 0,
                            rating_count: p.rating_count || 0,
                        };
                    }
                    // product may have been deleted — keep saved snapshot
                    return saved[idx];
                });

                setWishlistItems(fresh);
            } catch (error) {
                console.error('Error loading wishlist:', error);
                setWishlistItems(wishlistService.getWishlist());
            } finally {
                setLoading(false);
            }
        };

        loadWishlist();
    }, []);

    const removeFromWishlist = (productId) => {
        wishlistService.removeFromWishlist(productId);
        const updatedItems = wishlistService.getWishlist();
        setWishlistItems(updatedItems);
        showToast('Item removed from wishlist', 'info');
    };

    const addToCart = async (item) => {
        try {
            await cartService.addToCart(item.id, 1);
            showToast(`"${item.name}" added to cart!`, 'success');
        } catch (error) {
            console.error('Error adding to cart:', error);
            if (error.response?.status === 401) {
                showToast('Please login to add items to cart', 'warning');
                setTimeout(() => navigate('/login'), 2000);
            } else {
                showToast('Error adding item to cart', 'error');
            }
        }
    };

    const addAllToCart = async () => {
        try {
            for (const item of wishlistItems) {
                await cartService.addToCart(item.id, 1);
            }
            showToast(`Added ${wishlistItems.length} items to cart!`, 'success');
        } catch (error) {
            console.error('Error adding items to cart:', error);
            showToast('Error adding some items to cart', 'error');
        }
    };

    const clearWishlist = () => {
        showConfirm('Are you sure you want to clear your entire wishlist?', () => {
            wishlistService.clearWishlist();
            setWishlistItems([]);
            showToast('Wishlist cleared', 'info');
        });
    };

    const renderStars = (rating) => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;

        for (let i = 0; i < fullStars; i++) {
            stars.push(<FaStar key={i} className="star full" />);
        }

        if (hasHalfStar) {
            stars.push(<FaStar key="half" className="star half" />);
        }

        const emptyStars = 5 - stars.length;
        for (let i = 0; i < emptyStars; i++) {
            stars.push(<FaStar key={`empty-${i}`} className="star empty" />);
        }

        return stars;
    };

    if (loading) {
        return (
            <div className="wishlist-page">
                <Header />
                <div className="container">
                    <div className="loading-container">
                        <div className="loading-spinner"></div>
                        <p>Loading your wishlist...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="wishlist-page">
            <Header />

            {/* Breadcrumb */}
            <div className="breadcrumb">
                <div className="container">
                    <div className="breadcrumb-content">
                        <Link to="/main">
                            <FaHome /> Home
                        </Link>
                        <FaChevronRight />
                        <span>My Wishlist</span>
                    </div>
                </div>
            </div>

            <div className="container">
                {/* Wishlist Header */}
                <div className="wishlist-header">
                    <div className="wishlist-title">
                        <FaHeart className="wishlist-icon" />
                        <h1>My Wishlist</h1>
                        <span className="item-count">({wishlistItems.length} items)</span>
                    </div>
                    
                    {wishlistItems.length > 0 && (
                        <div className="wishlist-actions">
                            <button className="btn-add-all" onClick={addAllToCart}>
                                <FaShoppingCart />
                                Add All to Cart
                            </button>
                            <button className="btn-clear" onClick={clearWishlist}>
                                <FaTrash />
                                Clear Wishlist
                            </button>
                        </div>
                    )}
                </div>

                {/* Wishlist Content */}
                {wishlistItems.length === 0 ? (
                    <div className="empty-wishlist">
                        <FaHeart className="empty-icon" />
                        <h2>Your wishlist is empty</h2>
                        <p>Save items you love by clicking the heart icon on any product.</p>
                        <button className="btn-shop" onClick={() => navigate('/main')}>
                            Start Shopping
                        </button>
                    </div>
                ) : (
                    <div className="wishlist-grid">
                        {wishlistItems.map((item) => (
                            <div key={item.id} className="wishlist-item">
                                <div className="item-image" onClick={() => navigate(`/product/${item.id}`)}>
                                    <img 
                                        src={getImageUrl(item.image_url, item.image)} 
                                        alt={item.name}
                                        onError={handleImageError}
                                    />
                                    <button 
                                        className="remove-wishlist"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            removeFromWishlist(item.id);
                                        }}
                                    >
                                        <FaHeart />
                                    </button>
                                </div>
                                
                                <div className="item-details">
                                    <div className="item-category">{item.category}</div>
                                    <h3 className="item-title" onClick={() => navigate(`/product/${item.id}`)}>
                                        {item.name}
                                    </h3>
                                    
                                    <div className="item-rating">
                                        <div className="stars">
                                            {renderStars(item.rating || 0)}
                                        </div>
                                        <span className="rating-text">
                                            {item.rating > 0
                                                ? `${item.rating.toFixed(1)} ★ (${item.rating_count || 0} reviews)`
                                                : 'No ratings yet'}
                                        </span>
                                    </div>
                                    
                                    <div className="item-price">
                                        <span className="current-price">Rs {Math.round(item.price)}</span>
                                    </div>
                                    
                                    <div className="item-seller">by {item.seller || '—'}</div>
                                    
                                    <div className="item-actions">
                                        <button 
                                            className="btn-add-to-cart"
                                            onClick={() => addToCart(item)}
                                        >
                                            <FaShoppingCart />
                                            Add to Cart
                                        </button>
                                        <button 
                                            className="btn-remove"
                                            onClick={() => removeFromWishlist(item.id)}
                                        >
                                            <FaTrash />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <Footer />
        </div>
    );
};

export default Wishlist;