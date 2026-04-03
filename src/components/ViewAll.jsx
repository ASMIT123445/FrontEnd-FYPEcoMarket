import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
    FaLeaf, FaHeart, FaUtensils, FaCouch, FaTools, FaPalette, 
    FaSearch, FaShoppingCart, FaChevronDown, FaFilter, FaTimes, 
    FaSortAmountDown, FaStar, FaStarHalfAlt
} from 'react-icons/fa';
import { wishlistService } from '../services/wishlistService';
import { cartService } from '../services/cartService';
import axiosInstance from '../services/axiosInstance';
import { getUserFromToken } from '../utils/auth';
import { getImageUrl, handleImageError } from '../utils/imageHelper';
import '../styles/Home.css';

export default function ViewAll() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [wishlistItems, setWishlistItems] = useState([]);
    const [user, setUser] = useState(null);
    const [cartItems, setCartItems] = useState(0);
    const [showFilters, setShowFilters] = useState(false);
    const [priceRange, setPriceRange] = useState(2500);
    const [appliedFilters, setAppliedFilters] = useState({ecoRating: [], stockStatus: [], maxPrice: 2500});
    const [ecoCategories, setEcoCategories] = useState([]);


    // Get search query from URL params
    useEffect(() => {
        const query = searchParams.get('search');
        const category = searchParams.get('category');
        if (query) setSearchQuery(query);
        if (category) setSelectedCategory(category);
    }, [searchParams]);

    // Categories for top navigation (same as Home page)
    const categories = [
        { id: 'all', name: 'All Products', icon: <FaLeaf /> },
        { id: 'accessories', name: 'Accessories', icon: <FaHeart /> },
        { id: 'kitchen_items', name: 'Kitchen Items', icon: <FaUtensils /> },
        { id: 'home_living', name: 'Home & Living', icon: <FaCouch /> },
        { id: 'craft_tools', name: 'Craft & Tools', icon: <FaTools /> },
        { id: 'art_supplies', name: 'Art Supplies', icon: <FaPalette /> }
    ];

    // Initialize user and cart
    useEffect(() => {
        const initializeUser = async () => {
            const userInfo = getUserFromToken();
            if (userInfo) {
                setUser(userInfo);
            }

            try {
                const cartCount = await cartService.getCartCount();
                setCartItems(cartCount);
            } catch (error) {
                console.error('Error getting cart count:', error);
                setCartItems(0);
            }

            const wishlist = wishlistService.getWishlist();
            setWishlistItems(wishlist);
        };

        initializeUser();
    }, []);

    // Fetch eco categories
    useEffect(() => {
        const fetchEcoCategories = async () => {
            try {
                const response = await axiosInstance.get('/products/categories/');
                setEcoCategories(response.data);
            } catch (error) {
                console.error('Error fetching eco categories:', error);
                // Fallback to hardcoded categories
                setEcoCategories([
                    { id: 1, name: 'Recycled Items', slug: 'recycled_items' },
                    { id: 2, name: 'Organic Products', slug: 'organic_products' },
                    { id: 3, name: 'Energy-Efficient', slug: 'energy_efficient' },
                    { id: 4, name: 'Reusable Household', slug: 'reusable_household' },
                    { id: 5, name: 'Handmade Eco-Crafts', slug: 'handmade_ecocraft' },
                    { id: 6, name: 'Sustainable Fashion', slug: 'sustainable_fashion' },
                    { id: 7, name: 'Eco Home & Garden', slug: 'eco_home_garden' }
                ]);
            }
        };

        fetchEcoCategories();
    }, []);

    // Fetch products based on filters
    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                let url = '/products/';
                const params = new URLSearchParams();

                if (selectedCategory && selectedCategory !== 'all') {
                    params.append('category', selectedCategory);
                }
                if (searchQuery.trim()) {
                    params.append('search', searchQuery.trim());
                }
                if (priceRange < 2500) {
                    params.append('max_price', priceRange);
                }

                if (params.toString()) {
                    url += '?' + params.toString();
                }

                const response = await axiosInstance.get(url);
                setProducts(response.data);
            } catch (error) {
                console.error('Error fetching products:', error);
                setProducts([]);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [selectedCategory, searchQuery, priceRange]);

    const handleSearch = (e) => {
        // Only search on Enter key press or button/icon click
        if (e.key === 'Enter' || e.type === 'click') {
            // Update URL with search query
            const params = new URLSearchParams();
            if (searchQuery.trim()) {
                params.append('search', searchQuery.trim());
            }
            if (selectedCategory && selectedCategory !== 'all') {
                params.append('category', selectedCategory);
            }
            
            const newUrl = params.toString() ? `/view-all?${params.toString()}` : '/view-all';
            navigate(newUrl, { replace: true });
        }
    };

    const toggleWishlist = (product, event) => {
        event.stopPropagation();
        
        const isCurrentlyInWishlist = wishlistService.isInWishlist(product.id);
        
        if (isCurrentlyInWishlist) {
            wishlistService.removeFromWishlist(product.id);
        } else {
            wishlistService.addToWishlist(product);
        }
        
        const updatedWishlist = wishlistService.getWishlist();
        setWishlistItems(updatedWishlist);
    };

    const toggleFilters = () => {
        setShowFilters(!showFilters);
    };

    const renderStars = (rating) => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;

        for (let i = 0; i < fullStars; i++) {
            stars.push(<FaStar key={`full-${i}`} className="star full" />);
        }

        if (hasHalfStar) {
            stars.push(<FaStarHalfAlt key="half" className="star half" />);
        }

        const emptyStars = 5 - stars.length;
        for (let i = 0; i < emptyStars; i++) {
            stars.push(<FaStar key={`empty-${i}`} className="star empty" />);
        }

        return stars;
    };

    return (
        <div className="home-container">
            {/* Header - Same as Home page */}
            <header className="header1">
                <div className="container">
                    <nav className="navbar">
                        <a href="#" className="logo" onClick={() => navigate('/main')}>
                            <FaLeaf className="logo-icon"/>
                            <span className="logo-text">Ecomarket</span>
                        </a>

                        <div className="search-bar">
                            <FaSearch className="search-icon" onClick={handleSearch}/>
                            <input 
                                type="text" 
                                placeholder="Search for handmade, vintage, or sustainable goods..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyPress={handleSearch}
                            />
                            <button className="search-button" onClick={handleSearch}>
                                Search
                            </button>
                        </div>

                        <div className="nav-actions">
                            <div className="nav-icon" onClick={() => navigate('/wishlist')}>
                                <FaHeart/>
                            </div>
                            <div className="nav-icon" id="cart-icon" onClick={() => navigate('/cart')}>
                                <FaShoppingCart/>
                                <span className="badge">{cartItems}</span>
                            </div>
                            <div className="user-menu-container">
                                <div className="user-menu">
                                    <div className="user-avatar">
                                        {user?.username ? user.username.charAt(0).toUpperCase() : 'U'}
                                    </div>
                                    <span className="user-name">
                                        {user?.username || 'User'}
                                    </span>
                                    <FaChevronDown className="dropdown-arrow"/>
                                </div>
                            </div>
                        </div>
                    </nav>
                </div>
            </header>

            {/* Categories Navigation - Same as Home page */}
            <div className="categories-nav">
                <div className="home-main-container">
                    <div className="categories-scroll">
                        {categories.map((category) => (
                            <button 
                                key={category.id}
                                className={`category-tab ${
                                    (category.id === 'all' && selectedCategory === '') || 
                                    selectedCategory === category.id ? 'active' : ''
                                }`}
                                onClick={() => setSelectedCategory(category.id === 'all' ? '' : category.id)}
                            >
                                <span className="category-icon">{category.icon}</span>
                                <span className="category-name">{category.name}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="home-main-container">
                {/* Breadcrumb */}
                <div className="breadcrumb" style={{margin: '20px 0', fontSize: '14px', color: '#666'}}>
                    <span onClick={() => navigate('/main')} style={{color: '#2E7D32', cursor: 'pointer'}}>Home</span>
                    <span style={{margin: '0 8px'}}> &gt; </span>
                    <span style={{color: '#333', fontWeight: '500'}}>
                        {searchQuery ? `Search: "${searchQuery}"` : 'All Products'}
                    </span>
                </div>

                {/* Filter and Sort Bar - Same as Home page */}
                <div className="filter-sort-bar">
                    <div className="filter-dropdown">
                        <button className="filter-toggle" onClick={toggleFilters}>
                            <FaFilter/>
                            Filters {appliedFilters.ecoRating.length > 0 && `(${appliedFilters.ecoRating.length})`}
                        </button>

                        {showFilters && (
                            <div className="filter-panel">
                                <div className="filter-header">
                                    <h4>Filters</h4>
                                    <button className="close-filters" onClick={() => setShowFilters(false)}>
                                        <FaTimes/>
                                    </button>
                                </div>

                                <div className="filter-section">
                                    <h5>Price Range</h5>
                                    <input 
                                        type="range" 
                                        min="0" 
                                        max="2000"
                                        value={priceRange}
                                        className="price-range"
                                        onChange={(e) => setPriceRange(e.target.value)}
                                    />
                                    <div className="price-values">
                                        <span>Rs 0</span>
                                        <span>Rs {priceRange}</span>
                                    </div>
                                </div>

                                <div className="filter-section">
                                    <h5>Eco Rating</h5>
                                    <div className="rating-filters">
                                        {[5, 4, 3].map((rating) => (
                                            <label key={rating} className="rating-filter">
                                                <input 
                                                    type="checkbox"
                                                    checked={appliedFilters.ecoRating.includes(rating)}
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            setAppliedFilters(prev => ({
                                                                ...prev,
                                                                ecoRating: [...prev.ecoRating, rating]
                                                            }));
                                                        } else {
                                                            setAppliedFilters(prev => ({
                                                                ...prev,
                                                                ecoRating: prev.ecoRating.filter(r => r !== rating)
                                                            }));
                                                        }
                                                    }}
                                                />
                                                <span className="stars">
                                                    {Array(rating).fill().map((_, i) => (
                                                        <FaStar key={i} className="star small"/>
                                                    ))}
                                                    <span className="rating-text">& up</span>
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div className="filter-section">
                                    <h5>Stock Status</h5>
                                    <label className="stock-filter">
                                        <input 
                                            type="checkbox"
                                            checked={appliedFilters.stockStatus.includes('in_stock')}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setAppliedFilters(prev => ({
                                                        ...prev,
                                                        stockStatus: [...prev.stockStatus, 'in_stock']
                                                    }));
                                                } else {
                                                    setAppliedFilters(prev => ({
                                                        ...prev,
                                                        stockStatus: prev.stockStatus.filter(s => s !== 'in_stock')
                                                    }));
                                                }
                                            }}
                                        />
                                        In Stock Only
                                    </label>
                                </div>

                                <div className="filter-actions">
                                    <button className="btn-apply" onClick={() => {
                                        console.log('Applying filters:', appliedFilters);
                                        setShowFilters(false);
                                    }}>
                                        Apply Filters
                                    </button>
                                    <button className="btn-clear" onClick={() => {
                                        setAppliedFilters({ecoRating: [], stockStatus: [], maxPrice: 2500});
                                        setPriceRange(2500);
                                    }}>
                                        Clear All
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="sort-options">
                        <FaSortAmountDown/>
                        <select 
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                        >
                            <option value="">All Categories</option>
                            {ecoCategories.map(category => (
                                <option key={category.id} value={category.slug}>
                                    {category.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Products Section */}
                <div className="home-products-container">
                    <div className="section-heading">
                        <h2>
                            {searchQuery ? `Search Results for "${searchQuery}"` : 
                             selectedCategory ? 'Filtered Products' : 'All Products'}
                        </h2>
                        <span style={{fontSize: '14px', color: '#666'}}>
                            {loading ? 'Loading...' : 
                             searchQuery ? `${products.length} products found for "${searchQuery}"` :
                             `${products.length} products found`}
                        </span>
                    </div>

                    {loading ? (
                        <div style={{textAlign: 'center', padding: '40px', color: '#666'}}>
                            Loading products...
                        </div>
                    ) : products.length === 0 ? (
                        <div style={{textAlign: 'center', padding: '40px', color: '#666'}}>
                            <p>
                                {searchQuery ? 
                                    `No products found matching "${searchQuery}". Try a different search term.` :
                                    'No products found matching your criteria.'
                                }
                            </p>
                            <button 
                                onClick={() => {
                                    setSelectedCategory('');
                                    setSearchQuery('');
                                    navigate('/view-all');
                                }}
                                style={{
                                    marginTop: '15px',
                                    padding: '10px 20px',
                                    background: '#2E7D32',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: 'pointer'
                                }}
                            >
                                {searchQuery ? 'Clear Search' : 'View All Products'}
                            </button>
                        </div>
                    ) : (
                        <div className="home-products-etsy-grid" style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '15px'}}>
                            {products.map((product) => (
                                <div 
                                    key={product.id} 
                                    className="home-etsy-product-card"
                                    onClick={() => navigate(`/product/${product.id}`)}
                                >
                                    <div className="home-product-image-container">
                                        <img 
                                            src={getImageUrl(product.image_url, product.image)} 
                                            alt={product.name}
                                            onError={handleImageError}
                                        />
                                        {product.badge && (
                                            <div className="product-badge">{product.badge}</div>
                                        )}
                                        {product.discount > 0 && (
                                            <div className="discount-badge">-{product.discount}%</div>
                                        )}
                                        <button 
                                            className={`wishlist-button ${wishlistService.isInWishlist(product.id) ? 'active' : ''}`}
                                            onClick={(e) => toggleWishlist(product, e)}
                                        >
                                            <FaHeart />
                                        </button>
                                    </div>

                                    <div className="product-info">
                                        <div className="seller-info">
                                            <span className="seller-name">{product.seller}</span>
                                            <span className="shipping-info">{product.shipping}</span>
                                        </div>

                                        <h3 className="product-title">{product.name}</h3>

                                        <div className="rating-info">
                                            <div className="stars">
                                                {renderStars(product.eco_rating || 4.5)}
                                                <span className="rating-number">{product.eco_rating || 4.5}</span>
                                            </div>
                                            <span className="review-count">({product.reviews || 100})</span>
                                        </div>

                                        <div className="price-section">
                                            {product.oldPrice ? (
                                                <div className="price-with-discount">
                                                    <span className="" style={{fontSize: "10px"}}>
                                                        Rs {Math.round(product.price)}
                                                    </span>
                                                    <span className="original-price">
                                                        Rs {Math.round(product.oldPrice)}
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="current-price">
                                                    Rs {Math.round(product.price)}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}