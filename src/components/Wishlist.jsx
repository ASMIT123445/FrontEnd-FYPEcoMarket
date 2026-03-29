import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaHome, FaChevronRight, FaHeart, FaShoppingCart, FaTrash, FaStar } from 'react-icons/fa';
import { wishlistService } from '../services/wishlistService';
import { cartService } from '../services/cartService';
import { getImageUrl, handleImageError } from '../utils/imageHelper';
import Header from './Header';
import '../styles/Wishlist.css';

const Wishlist = () => {
    const navigate = useNavigate();
    const [wishlistItems, setWishlistItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showMessage, setShowMessage] = useState('');

    useEffect(() => {
        const loadWishlist = () => {
            try {
                const items = wishlistService.getWishlist();
                setWishlistItems(items);
            } catch (error) {
                console.error('Error loading wishlist:', error);
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
        displayMessage('Item removed from wishlist');
    };

    const addToCart = async (item) => {
        try {
            await cartService.addToCart(item.id, 1);
            displayMessage(`"${item.name}" added to cart!`);
        } catch (error) {
            console.error('Error adding to cart:', error);
            if (error.response?.status === 401) {
                displayMessage('Please login to add items to cart');
                setTimeout(() => navigate('/login'), 2000);
            } else {
                displayMessage('Error adding item to cart');
            }
        }
    };

    const addAllToCart = async () => {
        try {
            for (const item of wishlistItems) {
                await cartService.addToCart(item.id, 1);
            }
            displayMessage(`Added ${wishlistItems.length} items to cart!`);
        } catch (error) {
            console.error('Error adding items to cart:', error);
            displayMessage('Error adding some items to cart');
        }
    };

    const clearWishlist = () => {
        if (window.confirm('Are you sure you want to clear your entire wishlist?')) {
            wishlistService.clearWishlist();
            setWishlistItems([]);
            displayMessage('Wishlist cleared');
        }
    };

    const displayMessage = (text) => {
        setShowMessage(text);
        setTimeout(() => setShowMessage(''), 3000);
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

            {/* Message Display */}
            {showMessage && (
                <div className="message-popup">
                    {showMessage}
                </div>
            )}

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
                                            {renderStars(item.eco_rating || 4.5)}
                                        </div>
                                        <span className="rating-text">({item.reviews || 100} reviews)</span>
                                    </div>
                                    
                                    <div className="item-price">
                                        <span className="current-price">Rs {Math.round(item.price)}</span>
                                        {item.oldPrice && (
                                            <span className="old-price">Rs {Math.round(item.oldPrice)}</span>
                                        )}
                                    </div>
                                    
                                    <div className="item-seller">by {item.seller}</div>
                                    
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

            {/* Footer */}
            <footer className="footer">
                <div className="container">
                    <p>&copy; 2026 Ecomarket. All rights reserved. | Sustainable shopping for a better planet.</p>
                </div>
            </footer>
        </div>
    );
};

export default Wishlist;