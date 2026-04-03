import {useEffect, useState, useRef} from "react";
import {Link, useNavigate} from "react-router-dom";
import {
    FaLeaf,
    FaTruck,
    FaQuestionCircle,
    FaPhone,
    FaSearch,
    FaHeart,
    FaShoppingCart,
    FaChevronDown,
    FaRecycle,
    FaSeedling,
    FaSolarPanel,
    FaWineBottle,
    FaPaintBrush,
    FaTshirt,
    FaHome,
    FaFilter,
    FaCheckCircle,
    FaCartPlus,
    FaBars,
    FaMapMarkerAlt,
    FaEnvelope,
    FaFacebookF,
    FaTwitter,
    FaInstagram,
    FaLinkedinIn,
    FaSignOutAlt,
    FaUser,
    FaPlus,
    FaStar,
    FaStarHalfAlt,
    FaTimes,
    FaSortAmountDown,
    FaChevronRight,
    FaChevronLeft,
    FaUtensils,
    FaCouch,
    FaTools,
    FaPalette,
    FaBox,
    FaEdit,
    FaTrash,
    FaEye,
    FaClipboardList
} from "react-icons/fa";
import {logout, getUserFromToken} from "../utils/auth";
import {cartService} from "../services/cartService";
import {wishlistService} from "../services/wishlistService";
import axiosInstance from "../services/axiosInstance";
import {getImageUrl, handleImageError} from "../utils/imageHelper";
import "../styles/Home.css";

export default function Main() {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [recommendedProducts, setRecommendedProducts] = useState([]);
    const [trendingProducts, setTrendingProducts] = useState([]);
    const [newArrivalsProducts, setNewArrivalsProducts] = useState([]);
    const [topSellerProducts, setTopSellerProducts] = useState([]);
    const [cartItems, setCartItems] = useState(0);
    const [showSidebar, setShowSidebar] = useState(false);
    const [search, setSearch] = useState("");
    const [priceRange, setPriceRange] = useState(2500);
    const [sortBy, setSortBy] = useState("featured");
    const [selectedCategory, setSelectedCategory] = useState("");
    const [selectedEcoCategory, setSelectedEcoCategory] = useState("");
    const [selectedProductCategory, setSelectedProductCategory] = useState("");
    const [ecoCategories, setEcoCategories] = useState([]);
    const [productCategories, setProductCategories] = useState([]);
    const [user, setUser] = useState(null);
    const [showUserDropdown, setShowUserDropdown] = useState(false);
    const [userLoading, setUserLoading] = useState(true);
    const [showFilters, setShowFilters] = useState(false);
    const [appliedFilters, setAppliedFilters] = useState({minRating: 0, stockStatus: [], maxPrice: 2500});
    const [wishlistItems, setWishlistItems] = useState([]);
    
    // Seller panel states
    const [showSellerPanel, setShowSellerPanel] = useState(false);
    const [sellerTab, setSellerTab] = useState('products'); // 'products' or 'orders'
    const [sellerProducts, setSellerProducts] = useState([]);
    const [sellerOrders, setSellerOrders] = useState([]);

    // Fetch eco categories on component mount
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

        const fetchProductCategories = async () => {
            try {
                const response = await axiosInstance.get('/products/product-categories/');
                setProductCategories(response.data);
            } catch (error) {
                console.error('Error fetching product categories:', error);
            }
        };

        fetchEcoCategories();
        fetchProductCategories();
    }, []);

    // Ref for horizontal scrolling
    const productsScrollRef = useRef(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);

    useEffect(() => {
        const initializeUser = async () => {
            const userInfo = getUserFromToken();

            try {
                const cartCount = await cartService.getCartCount();
                setCartItems(cartCount);
            } catch (error) {
                console.error('Error getting cart count:', error);
                setCartItems(0);
            }

            // Initialize wishlist
            const wishlist = wishlistService.getWishlist();
            setWishlistItems(wishlist);

            if (userInfo) {
                setUser(userInfo);
                await fetchUserProfile();
            } else {
                setUserLoading(false);
            }
        };

        initializeUser();

        const justRegistered = localStorage.getItem('justRegistered');
        if (justRegistered) {
            setTimeout(() => {
                alert('Welcome to Ecomarket! Start exploring our eco-friendly products.');
                localStorage.removeItem('justRegistered');
            }, 500);
        }
    }, []);

    const fetchUserProfile = async () => {
        try {
            const token = localStorage.getItem('access');
            if (! token) {
                setUserLoading(false);
                return;
            }

            const response = await fetch('http://127.0.0.1:8000/api/profile/', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const profileData = await response.json();
                setUser(prevUser => ({
                    ...prevUser,
                    ... profileData,
                    username: profileData.username || prevUser ?. username,
                    email: profileData.email || prevUser ?. email,
                    first_name: profileData.first_name || prevUser ?. first_name,
                    last_name: profileData.last_name || prevUser ?. last_name,
                    role: profileData.role || prevUser ?. role || 'customer'
                }));
            }
        } catch (error) {
            console.error('Error fetching user profile:', error);
        } finally {
            setUserLoading(false);
        }
    };

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                let url = '/products/';
                const params = new URLSearchParams();

                if (selectedCategory && selectedCategory !== 'all') {
                    params.append('category', selectedCategory);
                }
                if (selectedProductCategory) {
                    params.append('product_category', selectedProductCategory);
                }
                if (priceRange < 2500) {
                    params.append('max_price', priceRange);
                }

                if (params.toString()) {
                    url += '?' + params.toString();
                }

                const response = await axiosInstance.get(url);
                
                // Create different sections from the same data with meaningful ordering
                const allProducts = response.data;
                
                // Recommended: highest rated products (rating desc)
                const recommended = [...allProducts]
                    .sort((a, b) => (b.rating || 0) - (a.rating || 0));
                
                // Trending: most recently added (newest first)
                const trending = [...allProducts]
                    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
                
                // New Arrivals: same as trending but offset (next 10 newest)
                const newArrivals = [...allProducts]
                    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                    .slice(10, 20);
                
                // Recently Added: newest first (for the main scrollable grid)
                const recentlySorted = [...allProducts]
                    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

                // Top Seller: lowest price first (best value / most accessible)
                const topSellers = [...allProducts]
                    .sort((a, b) => a.price - b.price);

                setProducts(recentlySorted);
                setRecommendedProducts(recommended);
                setTrendingProducts(trending);
                setNewArrivalsProducts(newArrivals);
                setTopSellerProducts(topSellers);
            } catch (error) {
                console.error('Error fetching products:', error);
                // Fallback to empty arrays when API fails
                setProducts([]);
                setRecommendedProducts([]);
                setTrendingProducts([]);
                setNewArrivalsProducts([]);
                setTopSellerProducts([]);
            }
        };

        fetchProducts();
    }, [selectedCategory, selectedProductCategory, priceRange]); // Added selectedProductCategory

    // Fetch seller products and orders
    const fetchSellerProducts = async () => {
        try {
            const response = await axiosInstance.get('/products/seller/my-products/');
            setSellerProducts(response.data);
        } catch (error) {
            console.error('Error fetching seller products:', error);
        }
    };

    const fetchSellerOrders = async () => {
        try {
            const response = await axiosInstance.get('/orders/history/');
            setSellerOrders(response.data);
        } catch (error) {
            console.error('Error fetching seller orders:', error);
        }
    };

    useEffect(() => {
        if (user?.role === 'seller' && showSellerPanel) {
            if (sellerTab === 'products') {
                fetchSellerProducts();
            } else if (sellerTab === 'orders') {
                fetchSellerOrders();
            }
        }
    }, [user, showSellerPanel, sellerTab]);

    const handleDeleteProduct = async (productId, productName) => {
        if (!window.confirm(`Delete "${productName}"?`)) return;
        
        try {
            await axiosInstance.delete(`/products/${productId}/`);
            alert('Product deleted successfully!');
            fetchSellerProducts();
        } catch (error) {
            console.error('Error deleting product:', error);
            alert('Error deleting product');
        }
    };

    const addToCartHandler = async (product) => {
        try {
            const response = await cartService.addToCart(product.id, 1);
            const newCartCount = await cartService.getCartCount();
            setCartItems(newCartCount);

            // Show temporary success message
            const button = document.querySelector(`[data-product-id="${
                product.id
            }"]`);
            if (button) {
                const originalText = button.innerHTML;
                button.innerHTML = '<FaCheckCircle /> Added!';
                button.style.backgroundColor = '#4CAF50';

                setTimeout(() => {
                    button.innerHTML = originalText;
                    button.style.backgroundColor = '';
                }, 2000);
            }
        } catch (error) {
            console.error('Error adding to cart:', error);
            if (error.response ?. status === 401) {
                alert('Please login to add items to cart');
                navigate('/login');
            } else {
                alert('Error adding item to cart. Please try again.');
            }
        }
    };

    const handleSearch = (e) => {
        // Only redirect on Enter key press or button/icon click
        if (e.key === 'Enter' || e.type === 'click') {
            if (search.trim()) {
                // Redirect to ViewAll page with search query
                navigate(`/view-all?search=${encodeURIComponent(search.trim())}`);
            } else {
                // If search is empty, just go to ViewAll page
                navigate('/view-all');
            }
        }
    };

    const handleLogout = () => {
        if (window.confirm('Are you sure you want to logout?')) {
            logout();
        }
    };

    const toggleFilters = () => {
        setShowFilters(!showFilters);
    };

    const toggleWishlist = (product, event) => {
        event.stopPropagation(); // Prevent navigation to product detail
        
        const isCurrentlyInWishlist = wishlistService.isInWishlist(product.id);
        
        if (isCurrentlyInWishlist) {
            wishlistService.removeFromWishlist(product.id);
        } else {
            wishlistService.addToWishlist(product);
        }
        
        // Update local state
        const updatedWishlist = wishlistService.getWishlist();
        setWishlistItems(updatedWishlist);
    };

    const renderStars = (rating) => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;

        for (let i = 0; i < fullStars; i++) {
            stars.push (
                <FaStar key={
                        `full-${i}`
                    }
                    className="star full"/>
            );
        }

        if (hasHalfStar) {
            stars.push (
                <FaStarHalfAlt key="half" className="star half"/>
            );
        }

        const emptyStars = 5 - stars.length;
        for (let i = 0; i < emptyStars; i++) {
            stars.push (
                <FaStar key={
                        `empty-${i}`
                    }
                    className="star empty"/>
            );
        }

        return stars;
    };

    // Horizontal scroll functions
    const scrollLeft = () => {
        if (productsScrollRef.current) {
            productsScrollRef.current.scrollBy({
                left: -220, // Scroll by one card width + gap
                behavior: 'smooth'
            });
        }
    };

    const scrollRight = () => {
        if (productsScrollRef.current) {
            productsScrollRef.current.scrollBy({
                left: 220, // Scroll by one card width + gap
                behavior: 'smooth'
            });
        }
    };

    const checkScrollButtons = () => {
        if (productsScrollRef.current) {
            const {scrollLeft, scrollWidth, clientWidth} = productsScrollRef.current;
            setCanScrollLeft(scrollLeft > 0);
            setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
        }
    };

    // Add scroll event listener
    useEffect(() => {
        const scrollContainer = productsScrollRef.current;
        if (scrollContainer) {
            scrollContainer.addEventListener('scroll', checkScrollButtons);
            checkScrollButtons(); // Initial check

            return() => {
                scrollContainer.removeEventListener('scroll', checkScrollButtons);
            };
        }
    }, [products]);

    // Check scroll buttons when products change
    useEffect(() => {
        setTimeout(checkScrollButtons, 100);
    }, [recommendedProducts, trendingProducts, newArrivalsProducts, topSellerProducts]);

    const applyFilters = (list) => list
        .filter(p => appliedFilters.minRating > 0 ? (p.rating || 0) >= appliedFilters.minRating : true)
        .filter(p => appliedFilters.stockStatus.includes('in_stock') ? p.stock > 0 : true)
        .filter(p => parseFloat(p.price) <= appliedFilters.maxPrice);

    // Render product section component
    const renderProductSection = (title, products, sectionId) => (
        <div className="home-products-container" key={sectionId}>
            {/* Section Heading */}
            <div className="section-heading">
                <h2>{title}</h2>
                <button 
                    className="view-all-btn"
                    onClick={() => navigate(`/view-all${selectedCategory ? `?category=${selectedCategory}` : ''}`)}
                >
                    View All
                </button>
            </div>
            
            <button 
                className={`home-scroll-arrow left ${!canScrollLeft ? 'disabled' : ''}`}
                onClick={scrollLeft}
                disabled={!canScrollLeft}
            >
                <FaChevronLeft />
            </button>
            
            <div className="home-products-etsy-grid" ref={productsScrollRef}>
                {
                products.map((product) => (
                    <div className="home-etsy-product-card"
                        key={`${sectionId}-${product.id}`}>
                        <div className="home-product-image-container"
                            onClick={() => navigate(`/product/${product.id}`)}>
                            <img src={getImageUrl(product.image_url, product.image)}
                                alt={product.name}
                                onError={handleImageError}
                            />
                            {product.badge && (
                                <div className="product-badge">
                                    {product.badge}
                                </div>
                            )}
                            {product.discount > 0 && (
                                <div className="discount-badge">-{product.discount}%</div>
                            )}
                            <button 
                                className={`wishlist-button ${wishlistService.isInWishlist(product.id) ? 'active' : ''}`}
                                onClick={(e) => toggleWishlist(product, e)}
                            >
                                <FaHeart/>
                            </button>
                        </div>

                        <div className="product-info"
                            onClick={() => navigate(`/product/${product.id}`)}>
                            <div className="seller-info">
                                <span className="seller-name">
                                    {product.seller_name || 'Ecomarket Seller'}
                                </span>
                                <span className="shipping-info">
                                    {product.shipping}
                                </span>
                            </div>

                            <h3 className="product-title">
                                {product.name}
                            </h3>

                            <div className="rating-info">
                                <div className="stars">
                                    {renderStars(product.rating || 0)}
                                    <span className="rating-number">
                                        {product.rating ? product.rating.toFixed(1) : 'No ratings'}
                                    </span>
                                </div>
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
                ))
            }
            </div>
            
            <button 
                className={`home-scroll-arrow right ${!canScrollRight ? 'disabled' : ''}`}
                onClick={scrollRight}
                disabled={!canScrollRight}
            >
                <FaChevronRight />
            </button>
        </div>
    );

    return (
        <div className="home-container">
            {/* Header */}
            <header className="header1">
                <div className="container">
                    <nav className="navbar">
                        <a href="#" className="logo">
                            <FaLeaf className="logo-icon"/>
                            <span className="logo-text">Ecomarket</span>
                        </a>

                        <div className="search-bar">
                            <FaSearch className="search-icon"
                                onClick={handleSearch}/>
                            <input type="text" placeholder="Search for handmade, vintage, or sustainable goods..."
                                value={search}
                                onChange={
                                    (e) => setSearch(e.target.value)
                                }
                                onKeyPress={handleSearch}/>
                            <button className="search-button" onClick={handleSearch}>
                                Search
                            </button>
                        </div>

                        <div className="nav-actions">
                            <div className="nav-icon"
                                onClick={
                                    () => navigate('/wishlist')
                            }>
                                <FaHeart/>
                            </div>
                            <div className="nav-icon" id="cart-icon"
                                onClick={
                                    () => navigate('/cart')
                            }>
                                <FaShoppingCart/>
                                <span className="badge">
                                    {cartItems}</span>
                            </div>
                            <div className="user-menu-container">
                                <div className="user-menu"
                                    onClick={
                                        () => setShowUserDropdown(!showUserDropdown)
                                }>
                                    <div className="user-avatar">
                                        {
                                        userLoading ? '...' : (user ?. username ? user.username.charAt(0).toUpperCase() : user ?. first_name ? user.first_name.charAt(0).toUpperCase() : 'U')
                                    } </div>
                                    <span className="user-name">
                                        {
                                        userLoading ? 'Loading...' : (user ?. username || (user ?. first_name ? `${
                                            user.first_name
                                        } ${
                                            user.last_name || ''
                                        }`.trim() : 'User'))
                                    } </span>
                                    <FaChevronDown className={
                                        `dropdown-arrow ${
                                            showUserDropdown ? 'rotated' : ''
                                        }`
                                    }/>
                                </div>
                                {
                                showUserDropdown && (
                                    <div className="user-dropdown">
                                        <div className="dropdown-item" onClick={() => navigate('/profile')}>
                                            <FaUser/>
                                            Profile
                                        </div>
                                        {user?.role === 'seller' && (
                                            <div className="dropdown-item" onClick={() => navigate('/seller-dashboard')}>
                                                <FaBox/>
                                                Seller Dashboard
                                            </div>
                                        )}
                                        <div className="dropdown-item" onClick={() => navigate('/cart')}>
                                            <FaShoppingCart/>
                                            My Orders
                                            
                                        </div>
                                        <div className="dropdown-item" onClick={() => navigate('/wishlist')}>
                                            <FaHeart/>
                                            Wishlist
                                        </div>
                                        <div className="dropdown-divider"></div>
                                        <div className="dropdown-item logout-item"
                                            onClick={handleLogout}>
                                            <FaSignOutAlt/>
                                            Logout
                                        </div>
                                    </div>
                                )
                            } </div>
                        </div>
                    </nav>
                </div>
            </header>

            {/* Categories Navigation */}
            <div className="categories-nav">
                <div className="home-main-container">
                    <div className="categories-scroll">
                        <button 
                            className={`category-tab ${selectedProductCategory === '' ? 'active' : ''}`}
                            onClick={() => setSelectedProductCategory('')}
                        >
                            <span className="category-icon"><FaLeaf/></span>
                            <span className="category-name">All Products</span>
                        </button>
                        {productCategories.map((category) => {
                            // Map icons based on category slug
                            const iconMap = {
                                'accessories': <FaHeart/>,
                                'kitchen_items': <FaUtensils/>,
                                'home_living': <FaCouch/>,
                                'craft_tools': <FaTools/>,
                                'art_supplies': <FaPalette/>
                            };
                            

                            return (
                                <button 
                                    key={category.id}
                                    className={`category-tab ${selectedProductCategory === category.slug ? 'active' : ''}`}
                                    onClick={() => setSelectedProductCategory(category.slug)}
                                >
                                    <span className="category-icon">
                                        {iconMap[category.slug] || <FaLeaf/>}
                                    </span>
                                    <span className="category-name">{category.name}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="home-main-container">
                {/* Filter and Sort Bar */}
                <div className="filter-sort-bar">
                    <div className="filter-dropdown">
                        <button className="filter-toggle"
                            onClick={toggleFilters}>
                            <FaFilter/>
                            Filters {appliedFilters.minRating > 0 && `(${appliedFilters.minRating}★+)`}</button>


                        {
                        showFilters && (
                            <div className="filter-panel">
                                <div className="filter-header">
                                    <h4>Filters</h4>
                                    <button className="close-filters"
                                        onClick={
                                            () => setShowFilters(false)
                                    }>
                                        <FaTimes/>
                                    </button>
                                </div>

                                <div className="filter-section">
                                    <h5>Price Range</h5>
                                    <input type="range" min="0" max="2000"
                                        value={priceRange}
                                        className="price-range"
                                        onChange={
                                            (e) => setPriceRange(e.target.value)
                                        }/>
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
                                                    type="radio"
                                                    name="ecoRating"
                                                    checked={appliedFilters.minRating === rating}
                                                    onChange={() => setAppliedFilters(prev => ({
                                                        ...prev,
                                                        minRating: prev.minRating === rating ? 0 : rating
                                                    }))}
                                                />
                                                <span className="stars">
                                                    {Array(rating).fill().map((_, i) => (
                                                        <FaStar key={i} className="star small"/>
                                                    ))}
                                                    <span className="rating-text">& up</span>
                                                </span>
                                            </label>
                                        ))}
                                        {appliedFilters.minRating > 0 && (
                                            <button
                                                style={{fontSize:'0.8rem', color:'#888', background:'none', border:'none', cursor:'pointer', padding:'4px 0'}}
                                                onClick={() => setAppliedFilters(prev => ({...prev, minRating: 0}))}
                                            >
                                                Clear rating
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div className="filter-section">
                                    <h5>Stock Status</h5>
                                    <label className="stock-filter">
                                        <input type="checkbox"
                                            checked={
                                                appliedFilters.stockStatus.includes('in_stock')
                                            }
                                            onChange={
                                                (e) => {
                                                    if (e.target.checked) {
                                                        setAppliedFilters(prev => ({
                                                            ...prev,
                                                            stockStatus: [
                                                                ...prev.stockStatus,
                                                                'in_stock'
                                                            ]
                                                        }));
                                                    } else {
                                                        setAppliedFilters(prev => ({
                                                            ...prev,
                                                            stockStatus: prev.stockStatus.filter(s => s !== 'in_stock')
                                                        }));
                                                    }
                                                }
                                            }/>
                                        In Stock Only
                                    </label>
                                </div>

                                <div className="filter-actions">
                                    <button className="btn-apply"
                                        onClick={
                                            () => {
                                                console.log('Applying filters:', appliedFilters);
                                                setShowFilters(false);
                                            }
                                    }>
                                        Apply Filters
                                    </button>
                                    <button className="btn-clear"
                                        onClick={
                                            () => {
                                                setAppliedFilters({minRating: 0, stockStatus: [], maxPrice: 2500});
                                                setPriceRange(2500);
                                            }
                                    }>
                                        Clear All
                                    </button>
                                </div>
                            </div>
                        )
                    } </div>

                    <div className="sort-options">
                        <FaSortAmountDown/>
                        <select value={selectedCategory}
                            onChange={
                                (e) => setSelectedCategory(e.target.value)
                        }>
                            <option value="">All Categories</option>
                            {ecoCategories.map(category => (
                                <option key={category.id} value={category.slug}>
                                    {category.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Multiple Product Sections */}
                {renderProductSection("Recommended for you", applyFilters(recommendedProducts), "recommended")}
                {renderProductSection("Trending Now", applyFilters(trendingProducts), "trending")}
                {/* {renderProductSection("New Arrivals", newArrivalsProducts, "new-arrivals")} */}

                {/* Products Grid with Horizontal Scroll */}
                <div className="home-products-container">
                    {/* Section Heading */}
                    <div className="section-heading">
                        <h2>Recently Added</h2>
                        <button 
                            className="view-all-btn"
                            onClick={() => navigate(`/view-all${selectedCategory ? `?category=${selectedCategory}` : ''}`)}
                        >
                            View All
                        </button>
                    </div>

                    <button className={
                            `home-scroll-arrow left ${
                                !canScrollLeft ? 'disabled' : ''
                            }`
                        }
                        onClick={scrollLeft}
                        disabled={
                            !canScrollLeft
                    }>
                        <FaChevronLeft/>
                    </button>

                    <div className="home-products-etsy-grid"
                        ref={productsScrollRef}>
                        {
                        applyFilters(products).map((product) => (
                            <div className="home-etsy-product-card"
                                key={
                                    product.id
                            }>
                                <div className="home-product-image-container"
                                    onClick={
                                        () => navigate(`/product/${
                                            product.id
                                        }`)
                                }>
                                    <img src={
                                            product.image_url || product.image
                                        }
                                        alt={
                                            product.name
                                        }
                                        onError={
                                            (e) => {
                                                e.target.src = 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
                                            }
                                        }/> {
                                    product.badge && (
                                        <div className="product-badge">
                                            {
                                            product.badge
                                        }</div>
                                    )
                                }
                                    {
                                    product.discount > 0 && (
                                        <div className="discount-badge">-{
                                            product.discount
                                        }%</div>
                                    )
                                }
                                    <button className="wishlist-button">
                                        <FaHeart/>
                                    </button>
                                </div>

                                <div className="product-info"
                                    onClick={
                                        () => navigate(`/product/${
                                            product.id
                                        }`)
                                }>
                                    <div className="seller-info">
                                        <span className="seller-name">
                                            {product.seller_name || 'Ecomarket Seller'}
                                        </span>
                                        <span className="shipping-info">
                                            {
                                            product.shipping
                                        }</span>
                                    </div>

                                    <h3 className="product-title">
                                        {
                                        product.name
                                    }</h3>

                                    <div className="rating-info">
                                        <div className="stars">
                                            {
                                            renderStars(product.rating || 0)
                                        }
                                            <span className="rating-number">
                                                {
                                                product.rating ? product.rating.toFixed(1) : 'No ratings'
                                            }</span>
                                        </div>
                                    </div>

                                    <div className="price-section">
                                        {
                                        product.oldPrice ? (
                                            <div className="price-with-discount">
                                                <span className=""
                                                    style={
                                                        {fontSize: "10px"}
                                                }>Rs {
                                                    Math.round(product.price)
                                                }</span>
                                                <span className="original-price">Rs {
                                                    Math.round(product.oldPrice)
                                                }</span>
                                            </div>
                                        ) : (
                                            <span className="current-price">Rs {
                                                Math.round(product.price)
                                            }</span>
                                        )
                                    } </div>
                                </div>
                            </div>
                        ))
                    } </div>

                    <button className={
                            `home-scroll-arrow right ${
                                !canScrollRight ? 'disabled' : ''
                            }`
                        }
                        onClick={scrollRight}
                        disabled={
                            !canScrollRight
                    }>
                        <FaChevronRight/>
                    </button>
                </div>

                {/* Products Grid with Horizontal Scroll */}
                <div className="home-products-container">
                    {/* Section Heading */}
                    <div className="section-heading">
                        <h2>Top Seller</h2>
                        <button 
                            className="view-all-btn"
                            onClick={() => navigate(`/view-all${selectedCategory ? `?category=${selectedCategory}` : ''}`)}
                        >
                            View All
                        </button>
                    </div>

                    <button className={
                            `home-scroll-arrow left ${
                                !canScrollLeft ? 'disabled' : ''
                            }`
                        }
                        onClick={scrollLeft}
                        disabled={
                            !canScrollLeft
                    }>
                        <FaChevronLeft/>
                    </button>

                    <div className="home-products-etsy-grid"
                        ref={productsScrollRef}>
                        {
                        applyFilters(topSellerProducts).map((product) => (
                            <div className="home-etsy-product-card"
                                key={
                                    product.id
                            }>
                                <div className="home-product-image-container"
                                    onClick={
                                        () => navigate(`/product/${
                                            product.id
                                        }`)
                                }>
                                    <img src={
                                            product.image_url || product.image
                                        }
                                        alt={
                                            product.name
                                        }
                                        onError={
                                            (e) => {
                                                e.target.src = 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
                                            }
                                        }/> {
                                    product.badge && (
                                        <div className="product-badge">
                                            {
                                            product.badge
                                        }</div>
                                    )
                                }
                                    {
                                    product.discount > 0 && (
                                        <div className="discount-badge">-{
                                            product.discount
                                        }%</div>
                                    )
                                }
                                    <button className="wishlist-button">
                                        <FaHeart/>
                                    </button>
                                </div>

                                <div className="product-info"
                                    onClick={
                                        () => navigate(`/product/${
                                            product.id
                                        }`)
                                }>
                                    <div className="seller-info">
                                        <span className="seller-name">
                                            {product.seller_name || 'Ecomarket Seller'}
                                        </span>
                                        <span className="shipping-info">
                                            {
                                            product.shipping
                                        }</span>
                                    </div>

                                    <h3 className="product-title">
                                        {
                                        product.name
                                    }</h3>

                                    <div className="rating-info">
                                        <div className="stars">
                                            {
                                            renderStars(product.rating || 0)
                                        }
                                            <span className="rating-number">
                                                {
                                                product.rating ? product.rating.toFixed(1) : 'No ratings'
                                            }</span>
                                        </div>
                                    </div>

                                    <div className="price-section">
                                        {
                                        product.oldPrice ? (
                                            <div className="price-with-discount">
                                                <span className=""
                                                    style={
                                                        {fontSize: "10px"}
                                                }>Rs {
                                                    Math.round(product.price)
                                                }</span>
                                                <span className="original-price">Rs {
                                                    Math.round(product.oldPrice)
                                                }</span>
                                            </div>
                                        ) : (
                                            <span className="current-price">Rs {
                                                Math.round(product.price)
                                            }</span>
                                        )
                                    } </div>
                                </div>
                            </div>
                        ))
                    } </div>

                    <button className={
                            `home-scroll-arrow right ${
                                !canScrollRight ? 'disabled' : ''
                            }`
                        }
                        onClick={scrollRight}
                        disabled={
                            !canScrollRight
                    }>
                        <FaChevronRight/>
                    </button>
                </div>

            </div>

            {/* Floating Add Product Button - Only for Sellers */}
            {
            user && user.role === 'seller' && (
                <Link to="/add-product" className="floating-add-button">
                    <FaPlus/>
                    <span>Add Product on Ecomarket</span>
                </Link>
            )
        }

            {/* Footer */}
            <footer>
                <div className="home-main-container">
                    <div className="footer-content">
                        <div className="footer-column">
                            <h3>Ecomarket</h3>
                            <p>Your trusted marketplace for sustainable, eco-friendly products. Making green shopping accessible to everyone.</p>
                            <div className="social-icons">
                                <a href="#"><FaFacebookF/></a>
                                <a href="#"><FaTwitter/></a>
                                <a href="#"><FaInstagram/></a>
                                <a href="#"><FaLinkedinIn/></a>
                            </div>
                        </div>

                        <div className="footer-column">
                            <h3>Quick Links</h3>
                            <ul className="footer-links">
                                <li>
                                    <a href="#">Home</a>
                                </li>
                                <li>
                                    <a href="#">Shop</a>
                                </li>
                                <li>
                                    <a href="#">Categories</a>
                                </li>
                                <li>
                                    <a href="#">About Us</a>
                                </li>
                                <li>
                                    <a href="#">Contact</a>
                                </li>
                            </ul>
                        </div>

                        <div className="footer-column">
                            <h3>Categories</h3>
                            <ul className="footer-links">
                                <li>
                                    <a href="#">Recycled Items</a>
                                </li>
                                <li>
                                    <a href="#">Organic Products</a>
                                </li>
                                <li>
                                    <a href="#">Energy-Efficient</a>
                                </li>
                                <li>
                                    <a href="#">Reusable Household</a>
                                </li>
                                <li>
                                    <a href="#">Handmade Crafts</a>
                                </li>
                            </ul>
                        </div>

                        <div className="footer-column">
                            <h3>Contact Us</h3>
                            <ul className="footer-links">
                                <li><FaMapMarkerAlt/>
                                    Bhagwati Marg, Naxal</li>
                                <li><FaPhone/>
                                    +977 9876543210</li>
                                <li><FaEnvelope/>
                                    info@ecomarket.com</li>
                            </ul>
                        </div>
                    </div>

                    <div className="copyright">
                        <p>&copy; 2026 Ecomarket. All rights reserved. | Designed with
                            <FaHeart style={
                                {color: '#ff6b6b'}
                            }/>
                            for a sustainable future.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
