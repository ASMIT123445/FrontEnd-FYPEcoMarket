import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FaArrowLeft, FaHome, FaChevronRight, FaHeart, FaChevronLeft } from 'react-icons/fa';
import axiosInstance from '../services/axiosInstance';
import { cartService } from '../services/cartService';
import { wishlistService } from '../services/wishlistService';
import Header from './Header';
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

  // Sample similar products (in real app, fetch from API based on category)
  const [similarProducts, setSimilarProducts] = useState([]);

  useEffect(() => {
    const fetchSimilarProducts = async () => {
      try {
        const response = await axiosInstance.get('/products/');
        // Filter out current product and take first 4
        const filtered = response.data
          .filter(p => p.id !== parseInt(id))
          .slice(0, 4);
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
            <Link to="/products">
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
                src={productImages[activeImage] || product.image_url || product.image} 
                alt={product.name} 
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
            <div className="category">Eco-Friendly Product</div>
            <h1 className="product-title">{product.name}</h1>
            
            <div className="rating">
              <div className="stars">
                {renderStars(product.rating || 4.5)}
              </div>
              <span className="rating-text">{product.rating || 4.5} (128 reviews)</span>
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
              <span>In Stock - {product.stock || 0} items available</span>
            </div>
            
            <div className="description">
              <p>{product.description}</p>
            </div>
            
            <ul className="features">
              <li><i className="fas fa-check"></i> Eco-friendly and sustainable</li>
              <li><i className="fas fa-check"></i> High quality materials</li>
              <li><i className="fas fa-check"></i> Environmentally conscious</li>
              <li><i className="fas fa-check"></i> Fast and secure delivery</li>
            </ul>
            
            {/* Add to Cart Section */}
            <div className="cart-controls">
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
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="reviews-section">
          <h2 className="section-title">Customer Reviews</h2>
          <div className="reviews-container">
            {reviews.map((review) => (
              <div key={review.id} className="review">
                <div className="review-header">
                  <div className="reviewer">
                    <div className="reviewer-avatar">{review.avatar}</div>
                    <div className="reviewer-info">
                      <h4>{review.name}</h4>
                      <div className="review-date">{review.date}</div>
                    </div>
                  </div>
                  <div className="review-stars">
                    {renderStars(review.rating)}
                  </div>
                </div>
                <div className="review-content">
                  <p>{review.content}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Similar Products Section */}
        <div className="similar-products">
          <h2 className="section-title">Similar Products</h2>
          <div className="products-grid">
            {similarProducts.map((similarProduct) => (
              <div key={similarProduct.id} className="product-card">
                <div className="product-card-img">
                  <img 
                    src={similarProduct.image_url || similarProduct.image} 
                    alt={similarProduct.name}
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
                    }}
                  />
                </div>
                <div className="product-card-content">
                  <h3 className="product-card-title">{similarProduct.name}</h3>
                  <div className="product-card-price">
                    <span className="product-card-current">Rs {Math.round(similarProduct.price)}</span>
                    {similarProduct.oldPrice && (
                      <span className="product-card-old">Rs {Math.round(similarProduct.oldPrice)}</span>
                    )}
                  </div>
                  <button 
                    className="add-to-cart-btn"
                    onClick={() => addProductToCart(similarProduct, similarProduct.name)}
                  >
                    <i className="fas fa-cart-plus"></i>
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="footer">
        <div className="container">
          <p>&copy; 2026 Ecomarket. All rights reserved. | Sustainable shopping for a better planet.</p>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;