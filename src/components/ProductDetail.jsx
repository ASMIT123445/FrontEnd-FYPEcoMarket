import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FaArrowLeft, FaHome, FaChevronRight, FaHeart, FaChevronLeft, FaLeaf, FaShieldAlt, FaRecycle, FaTruck } from 'react-icons/fa';
import axiosInstance from '../services/axiosInstance';
import { cartService } from '../services/cartService';
import { wishlistService } from '../services/wishlistService';
import { getImageUrl, handleImageError } from '../utils/imageHelper';
import Header from './Header';
import ProductCard from './ProductCard';
import Footer from './Footer';
import '../styles/ProductDetail.css';
import '../styles/Header.css';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // State management
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [cartCount, setCartCount] = useState(0);
  const [showMessage, setShowMessage] = useState('');
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [hasRated, setHasRated] = useState(false);
  const [averageRating, setAverageRating] = useState(0);
  const [ratingCount, setRatingCount] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [userReviews, setUserReviews] = useState([]);
  const [similarProducts, setSimilarProducts] = useState([]);
  const similarProductsScrollRef = useRef(null);
  const [canScrollLeftSimilar, setCanScrollLeftSimilar] = useState(false);
  const [canScrollRightSimilar, setCanScrollRightSimilar] = useState(true);

  // Initialize cart count
  useEffect(() => {
    const getInitialCartCount = async () => {
      try {
        const count = await cartService.getCartCount();
        setCartCount(count);
      } catch (error) {
        console.error('Error getting cart count:', error);
        setCartCount(0);
      }
    };
    
    getInitialCartCount();
  }, []);

  // Fetch product data from API
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get(`/products/${id}/`);
        setProduct(response.data);
        setError(null);
        
        // Fetch ratings
        await fetchRatings();
        
        // Fetch user's rating if logged in
        const token = localStorage.getItem('access');
        if (token) {
          await fetchUserRating();
        }
      } catch (err) {
        console.error('Error fetching product:', err);
        setError('Product not found');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  // Sample reviews data (in real app, this would also come from API)
  const reviews = [
    {
      id: 1,
      name: "Sarah Miller",
      avatar: "SM",
      date: "November 15, 2026",
      rating: 5,
      content: "Excellent product! Great quality and eco-friendly. Highly recommended!"
    },
    {
      id: 2,
      name: "Ethan Johnson",
      avatar: "EJ",
      date: "November 8, 2026",
      rating: 4.5,
      content: "Good quality product. Fast delivery and great customer service."
    },
    {
      id: 3,
      name: "Alex Morgan",
      avatar: "AM",
      date: "October 25, 2026",
      rating: 4,
      content: "Decent product. Love the eco-friendly aspect. Will buy again."
    }
  ];

  // Fetch ratings
  const fetchRatings = async () => {
    try {
      const response = await axiosInstance.get(`/products/${id}/ratings/`);
      setAverageRating(response.data.average_rating);
      setRatingCount(response.data.rating_count);
      setUserReviews(response.data.ratings || []);
    } catch (error) {
      console.error('Error fetching ratings:', error);
    }
  };

  // Fetch user's rating
  const fetchUserRating = async () => {
    try {
      const response = await axiosInstance.get(`/products/${id}/my-rating/`);
      if (response.data.rating !== null) {
        setUserRating(response.data.rating);
        setReviewText(response.data.review || '');
        setHasRated(true);
      }
    } catch (error) {
      console.error('Error fetching user rating:', error);
    }
  };

  // Submit rating
  const submitRating = async (rating) => {
    try {
      const token = localStorage.getItem('access');
      if (!token) {
        displayMessage('Please login to rate this product');
        setTimeout(() => navigate('/login'), 2000);
        return;
      }

      await axiosInstance.post(`/products/${id}/ratings/`, {
        rating: rating,
        review: reviewText
      });

      setUserRating(rating);
      setHasRated(true);
      displayMessage(hasRated ? 'Rating updated!' : 'Thank you for your rating!');
      
      // Refresh ratings
      await fetchRatings();
    } catch (error) {
      console.error('Error submitting rating:', error);
      displayMessage('Error submitting rating. Please try again.');
    }
  };

  // Handle star click
  const handleStarClick = (rating) => {
    submitRating(rating);
  };

  // Handle post review
  const handlePostReview = () => {
    if (userRating === 0) {
      displayMessage('Please select a rating first');
      return;
    }
    submitRating(userRating);
  };

  // Horizontal scroll functions for similar products
  const scrollLeftSimilar = () => {
    if (similarProductsScrollRef.current) {
      similarProductsScrollRef.current.scrollBy({
        left: -220,
        behavior: 'smooth'
      });
    }
  };

  const scrollRightSimilar = () => {
    if (similarProductsScrollRef.current) {
      similarProductsScrollRef.current.scrollBy({
        left: 220,
        behavior: 'smooth'
      });
    }
  };

  const checkScrollButtonsSimilar = () => {
    if (similarProductsScrollRef.current) {
      const {scrollLeft, scrollWidth, clientWidth} = similarProductsScrollRef.current;
      setCanScrollLeftSimilar(scrollLeft > 0);
      setCanScrollRightSimilar(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  // Add scroll event listener for similar products
  useEffect(() => {
    const scrollContainer = similarProductsScrollRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', checkScrollButtonsSimilar);
      checkScrollButtonsSimilar();

      return() => {
        scrollContainer.removeEventListener('scroll', checkScrollButtonsSimilar);
      };
    }
  }, [similarProducts]);

  useEffect(() => {
    const fetchSimilarProducts = async () => {
      try {
        const response = await axiosInstance.get('/products/');
        // Filter out current product and unverified products
        const filtered = response.data
          .filter(p => p.id !== parseInt(id) && p.is_validated)
          .slice(0, 7);
        setSimilarProducts(filtered);
      } catch (err) {
        console.error('Error fetching similar products:', err);
      }
    };

    if (id) {
      fetchSimilarProducts();
    }
  }, [id]);

  // Quantity controls
  const increaseQty = () => {
    if (product && quantity < product.stock) {
      setQuantity(quantity + 1);
    } else if (product) {
      displayMessage(`Only ${product.stock} items available`);
    }
  };

  const decreaseQty = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleQuantityChange = (e) => {
    let value = parseInt(e.target.value);
    if (value < 1) value = 1;
    if (product && value > product.stock) {
      value = product.stock;
      displayMessage(`Only ${product.stock} items available`);
    }
    setQuantity(value);
  };

  // Cart functions
  const addToCartHandler = async () => {
    if (!product) return;
    
    try {
      // Add to cart using Django API
      await cartService.addToCart(product.id, quantity);
      
      // Update cart count
      const newCartCount = await cartService.getCartCount();
      setCartCount(newCartCount);
      
      displayMessage(`Added ${quantity} item(s) to cart!`);
    } catch (error) {
      console.error('Error adding to cart:', error);
      if (error.response?.status === 401) {
        displayMessage('Please login to add items to cart');
        setTimeout(() => navigate('/login'), 2000);
      } else if (error.response?.data?.error) {
        displayMessage(error.response.data.error);
      } else {
        displayMessage('Error adding item to cart. Please try again.');
      }
    }
  };

  const buyNow = () => {
    addToCartHandler();
    setTimeout(() => {
      displayMessage('Redirecting to cart...');
      navigate('/cart');
    }, 500);
  };

  const addProductToCart = async (productData, productName) => {
    try {
      // Add to cart using Django API
      await cartService.addToCart(productData.id, 1);
      
      // Update cart count
      const newCartCount = await cartService.getCartCount();
      setCartCount(newCartCount);
      
      displayMessage(`Added "${productName}" to cart!`);
    } catch (error) {
      console.error('Error adding to cart:', error);
      displayMessage('Error adding item to cart');
    }
  };

  // Image controls
  const changeImage = (index) => {
    setActiveImage(index);
  };

  // Message display
  const displayMessage = (text) => {
    setShowMessage(text);
    setTimeout(() => setShowMessage(''), 3000);
  };

  // Render star rating
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<i key={i} className="fas fa-star"></i>);
    }
    
    if (hasHalfStar) {
      stars.push(<i key="half" className="fas fa-star-half-alt"></i>);
    }
    
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<i key={`empty-${i}`} className="far fa-star"></i>);
    }
    
    return stars;
  };

  // Loading state
  if (loading) {
    return (
      <div className="product-detail-page">
        <Header cartCount={cartCount} />
        <div className="container">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading product details...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !product) {
    return (
      <div className="product-detail-page">
        <Header cartCount={cartCount} />
        <div className="container">
          <div className="error-container">
            <h2>Product Not Found</h2>
            <p>{error || 'The product you are looking for does not exist.'}</p>
            <button className="btn btn-primary" onClick={() => navigate('/products')}>
              <FaArrowLeft /> Back to Products
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Create image array (use the full image URL)
  const productImages = product.image_url ? [product.image_url, product.image_url, product.image_url] : [];

  return (
    <div className="product-detail-page">
      {/* Header */}
      <Header 
        cartCount={cartCount}
      />

      {/* Breadcrumb */}
      <div className="breadcrumb">
        <div className="container">
          <div className="breadcrumb-content">
            <Link to="/main">
              <FaHome /> Home
            </Link>
            <FaChevronRight />
            <span>{product ? product.name : 'Product Detail'}</span>
          </div>
        </div>
      </div>

      {/* Message Display */}
      {showMessage && (
        <div className="message-popup">
          {showMessage}
        </div>
      )}

      {/* Main Product Section */}
      <div className="container">
        <div className="product-section">
          {/* Product Images */}
          <div className="product-images">
            <div className="main-image">
              <img 
                src={getImageUrl(productImages[activeImage] || product.image_url, product.image)} 
                alt={product.name}
                onError={handleImageError}
              />
            </div>
            {productImages.length > 1 && (
              <div className="thumbnails">
                {productImages.map((image, index) => (
                  <div 
                    key={index}
                    className={`thumbnail ${activeImage === index ? 'active' : ''}`}
                    onClick={() => changeImage(index)}
                  >
                    <img src={image} alt={`Thumbnail ${index + 1}`} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="product-details">
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '14px' }}>
              <div className="category">🌿 Eco-Friendly</div>
              {product.eco_category_detail && (
                <div className="category" style={{ background: '#e3f2fd', color: '#1565c0' }}>
                  {product.eco_category_detail.name}
                </div>
              )}
              {product.product_category_detail && (
                <div className="category" style={{ background: '#fce4ec', color: '#880e4f' }}>
                  {product.product_category_detail.name}
                </div>
              )}
            </div>
            <h1 className="product-title">{product.name}</h1>

            {/* Seller */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', color: '#555', fontSize: '0.88rem' }}>
              <span style={{ background: '#f5f5f5', padding: '4px 12px', borderRadius: '20px', fontWeight: 600 }}>
                🏪 {product.seller_name || 'Ecomarket Seller'}
              </span>
            </div>
            
            <div className="rating">
              <div className="stars">
                {renderStars(averageRating || product.rating || 0)}
              </div>
              <span className="rating-text">
                {averageRating ? averageRating.toFixed(1) : (product.rating || 0)} ({ratingCount} review{ratingCount !== 1 ? 's' : ''})
              </span>
            </div>
            
            <div className="price-section">
              <div className="current-price">Rs {Math.round(product.price)}</div>
              {product.oldPrice && (
                <>
                  <div className="old-price">Rs {Math.round(product.oldPrice)}</div>
                  <div className="discount">Save {Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)}%</div>
                </>
              )}
            </div>
            
            <div className="stock">
              <i className="fas fa-check-circle"></i>
              <span>{product.stock > 0 ? `${product.stock} items in stock` : 'Out of stock'}</span>
            </div>
            
            <div className="description">
              <p>{product.description}</p>
            </div>
            
            <ul className="features">
              <li><FaLeaf /> Eco-friendly and sustainable</li>
              <li><FaShieldAlt /> High quality materials</li>
              <li><FaRecycle /> Environmentally conscious</li>
              <li><FaTruck /> Fast and secure delivery</li>
            </ul>
            
            {/* Add to Cart Section */}
            <div className="cart-controls">
              {product.is_validated ? (
                <>
                  <div className="quantity-selector">
                    <button className="qty-btn" onClick={decreaseQty}>-</button>
                    <input 
                      type="number" 
                      className="qty-input" 
                      value={quantity}
                      min="1" 
                      max={product.stock || 1}
                      onChange={handleQuantityChange}
                    />
                    <button className="qty-btn" onClick={increaseQty}>+</button>
                  </div>
                  
                  <div className="action-buttons">
                    <button className="btn btn-primary" onClick={addToCartHandler}>
                      <i className="fas fa-cart-plus"></i>
                      Add to Cart
                    </button>
                    <button className="btn btn-secondary" onClick={buyNow}>
                      <i className="fas fa-bolt"></i>
                      Buy Now
                    </button>
                    <button 
                      className={`btn btn-wishlist ${wishlistService.isInWishlist(product.id) ? 'active' : ''}`}
                      onClick={() => {
                        const isInWishlist = wishlistService.isInWishlist(product.id);
                        if (isInWishlist) {
                          wishlistService.removeFromWishlist(product.id);
                          displayMessage('Removed from wishlist');
                        } else {
                          wishlistService.addToWishlist(product);
                          displayMessage('Added to wishlist');
                        }
                      }}
                    >
                      <FaHeart />
                      {wishlistService.isInWishlist(product.id) ? 'Remove from Wishlist' : 'Add to Wishlist'}
                    </button>
                  </div>
                </>
              ) : (
                <div style={{
                  background: '#fff3e0', border: '1px solid #ffb74d',
                  borderRadius: '10px', padding: '20px', textAlign: 'center'
                }}>
                  <p style={{ color: '#e65100', fontWeight: 600, fontSize: '1rem', margin: 0 }}>
                    ⏳ This product is pending admin verification and is not available for purchase yet.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="reviews-section">
          <h2 className="section-title">Customer Reviews</h2>

          
          
          {/* Rate the Product Section */}
          <div className="rate-product-box">
            <span className="rate-label">Rate the product:</span>
            <div className="interactive-stars">
              {[1, 2, 3, 4, 5].map((star) => (
                <i
                  key={star}
                  className={`fas fa-star ${
                    star <= (hoverRating || userRating) ? 'active' : ''
                  }`}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => handleStarClick(star)}
                  style={{ cursor: 'pointer' }}
                ></i>
              ))}
              {hasRated && (
                <span className="your-rating-text">Your rating: {userRating}★</span>
              )}
            </div>
          
            {/* Review Comment Section */}
            <div className="review-input-section">
              <textarea
                className="review-textarea"
                placeholder="Share your thoughts about this product... (optional)"
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                rows="3"
              />
              <button 
                className="post-review-btn"
                onClick={handlePostReview}
                disabled={userRating === 0}
              >
                <i className="fas fa-paper-plane"></i>
                {hasRated ? 'Update Review' : 'Post Review'}
              </button>
            </div>
          </div>
          
          <div className="reviews-container">
            {userReviews.length > 0 ? (
              userReviews.map((review) => (
                <div key={review.id} className="review">
                  <div className="review-header">
                    <div className="reviewer">
                      <div className="reviewer-avatar">{review.user_avatar}</div>
                      <div className="reviewer-info">
                        <h4>{review.user_name}</h4>
                        <div className="review-date">
                          {new Date(review.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </div>
                      </div>
                    </div>
                    <div className="review-stars">
                      {renderStars(review.rating)}
                    </div>
                  </div>
                  {review.review && (
                    <div className="review-content">
                      <p>{review.review}</p>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="no-reviews">
                <p>No reviews yet. Be the first to review this product!</p>
              </div>
            )}
          </div>
        </div>

        {/* Similar Products Section */}
        <div className="similar-products">
          <h2 className="section-title">Similar Products</h2>
          
          <button 
            className={`similar-scroll-arrow left ${!canScrollLeftSimilar ? 'disabled' : ''}`}
            onClick={scrollLeftSimilar}
            disabled={!canScrollLeftSimilar}
          >
            <FaChevronLeft />
          </button>
          
          <div className="products-grid-scroll" ref={similarProductsScrollRef} style={{ display: 'flex', gap: 16, overflowX: 'auto', padding: '10px 0', scrollbarWidth: 'none' }}>
            {similarProducts.map(similarProduct => (
              <div key={similarProduct.id} style={{ flex: '0 0 220px', minWidth: 220 }}>
                <ProductCard
                  product={similarProduct}
                  onWishlistToggle={() => {}}
                />
              </div>
            ))}
          </div>
          
          <button 
            className={`similar-scroll-arrow right ${!canScrollRightSimilar ? 'disabled' : ''}`}
            onClick={scrollRightSimilar}
            disabled={!canScrollRightSimilar}
          >
            <FaChevronRight />
          </button>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default ProductDetail;