import {useEffect, useState, useRef} from "react";
import {Link, useNavigate, useSearchParams} from "react-router-dom";
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
    FaClipboardList,
    FaTrophy,
    FaCrown,
    FaMedal
} from "react-icons/fa";
import {logout, getUserFromToken} from "../utils/auth";
import {cartService} from "../services/cartService";
import Footer from './Footer';
import ProductCard from './ProductCard';
import {wishlistService} from "../services/wishlistService";
import axiosInstance from "../services/axiosInstance";
import {getImageUrl, handleImageError} from "../utils/imageHelper";
import "../styles/Home.css";
import { showToast, showConfirm } from './Toast';
import SortDropdown from './SortDropdown';
import { SearchBox } from './Header';

export default function Main() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [products, setProducts] = useState([]);
    const [recommendedProducts, setRecommendedProducts] = useState([]);
    const [trendingProducts, setTrendingProducts] = useState([]);
    const [newArrivalsProducts, setNewArrivalsProducts] = useState([]);
    const [topSellerProducts, setTopSellerProducts] = useState([]);
    const [cartItems, setCartItems] = useState(0);
    const [showSidebar, setShowSidebar] = useState(false);
    const [search, setSearch] = useState("");
    const [priceRange, setPriceRange] = useState(4000);
    const [sortBy, setSortBy] = useState("featured");
    const [selectedCategory, setSelectedCategory] = useState("");
    const [selectedEcoCategory, setSelectedEcoCategory] = useState("");
    const [selectedProductCategory, setSelectedProductCategory] = useState(() => {
        // Will be updated from searchParams in useEffect
        return "";
    });
    const [ecoCategories, setEcoCategories] = useState([]);
    const [productCategories, setProductCategories] = useState([]);
    const [user, setUser] = useState(null);
    const [showUserDropdown, setShowUserDropdown] = useState(false);
    const [userLoading, setUserLoading] = useState(true);
    const [showFilters, setShowFilters] = useState(false);
    const [minRating, setMinRating] = useState(0);
    const [inStockOnly, setInStockOnly] = useState(false);
    const [wishlistItems, setWishlistItems] = useState([]);
    
    // Seller panel states
    const [showSellerPanel, setShowSellerPanel] = useState(false);
    const [sellerTab, setSellerTab] = useState('products'); // 'products' or 'orders'
    const [sellerProducts, setSellerProducts] = useState([]);
    const [sellerOrders, setSellerOrders] = useState([]);

    // Leaderboard state
    const [leaderboardData, setLeaderboardData] = useState([]);
    const [leaderboardLoading, setLeaderboardLoading] = useState(true);

    // Sync category from URL params (e.g. from footer links)
    useEffect(() => {
        const cat = searchParams.get('category');
        const ecoCat = searchParams.get('eco_category');
        if (cat) setSelectedProductCategory(cat);
        if (ecoCat) setSelectedCategory(ecoCat);
    }, [searchParams]);

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

    // ── Per-section carousel hook ──────────────────────────
    const useCarousel = (deps = []) => {
        const ref = useRef(null);
        const [canLeft, setCanLeft] = useState(false);
        const [canRight, setCanRight] = useState(true);

        const check = () => {
            const el = ref.current;
            if (!el) return;
            setCanLeft(el.scrollLeft > 0);
            setCanRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 1);
        };

        useEffect(() => {
            const el = ref.current;
            if (!el) return;
            el.addEventListener('scroll', check);
            setTimeout(check, 120);
            return () => el.removeEventListener('scroll', check);
        // eslint-disable-next-line react-hooks/exhaustive-deps
        }, deps);

        const scrollL = () => ref.current?.scrollBy({ left: -236, behavior: 'smooth' });
        const scrollR = () => ref.current?.scrollBy({ left:  236, behavior: 'smooth' });

        return { ref, canLeft, canRight, scrollL, scrollR };
    };

    const carouselRec    = useCarousel([recommendedProducts]);
    const carouselTrend  = useCarousel([trendingProducts]);
    const carouselRecent = useCarousel([products]);
    const carouselTop    = useCarousel([topSellerProducts]);

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

        // Keep wishlist count in sync when items are toggled
        const syncWishlist = () => setWishlistItems(wishlistService.getWishlist());
        window.addEventListener('wishlistUpdated', syncWishlist);
        window.addEventListener('storage', syncWishlist);
        return () => {
            window.removeEventListener('wishlistUpdated', syncWishlist);
            window.removeEventListener('storage', syncWishlist);
        };

        const justRegistered = localStorage.getItem('justRegistered');
        if (justRegistered) {
            setTimeout(() => {
                showToast('Welcome to Ecomarket! Start exploring our eco-friendly products.', 'success');
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
                if (priceRange < 4000) {
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

    // Fetch leaderboard top 5
    useEffect(() => {
        axiosInstance.get('/auth/green-points/leaderboard/')
            .then(res => setLeaderboardData(res.data.leaderboard.slice(0, 5)))
            .catch(() => setLeaderboardData([]))
            .finally(() => setLeaderboardLoading(false));
    }, []);

    const handleDeleteProduct = async (productId, productName) => {
        showConfirm(`Delete "${productName}"? This cannot be undone.`, async () => {
            try {
                await axiosInstance.delete(`/products/${productId}/`);
                showToast('Product deleted successfully!', 'success');
                fetchSellerProducts();
            } catch (error) {
                console.error('Error deleting product:', error);
                showToast('Error deleting product', 'error');
            }
        });
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
                showToast('Please login to add items to cart', 'warning');
                navigate('/login');
            } else {
                showToast('Error adding item to cart. Please try again.', 'error');
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
        showConfirm('Are you sure you want to logout?', () => { logout(); });
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

    // (scroll functions replaced by per-section useCarousel hooks above)

    const applyFilters = (list) => list
        .filter(p => minRating > 0 ? (p.rating || 0) >= minRating : true)
        .filter(p => inStockOnly ? p.stock > 0 : true)
        .filter(p => parseFloat(p.price) <= priceRange)
        .sort((a, b) => {
            switch (sortBy) {
                case 'price_asc':  return parseFloat(a.price) - parseFloat(b.price);
                case 'price_desc': return parseFloat(b.price) - parseFloat(a.price);
                case 'name_asc':   return a.name.localeCompare(b.name);
                case 'name_desc':  return b.name.localeCompare(a.name);
                case 'newest':     return new Date(b.created_at) - new Date(a.created_at);
                case 'rating':     return (b.rating || 0) - (a.rating || 0);
                default:           return 0;
            }
        });

    // Render product section component
    const renderProductSection = (title, products, sectionId, carousel) => (
        <div className="home-products-container" key={sectionId}>
            <div className="section-heading">
                <h2>{title}</h2>
                <button
                    className="view-all-btn"
                    onClick={() => navigate(`/view-all${selectedCategory ? `?eco_category=${selectedCategory}` : ''}`)}
                >
                    View All
                </button>
            </div>

            <button className={`home-scroll-arrow left ${!carousel.canLeft ? 'disabled' : ''}`} onClick={carousel.scrollL} disabled={!carousel.canLeft}>
                <FaChevronLeft />
            </button>

            <div className="home-products-etsy-grid" ref={carousel.ref} style={{ display: 'flex', gap: 16, overflowX: 'auto', padding: '10px 0', scrollbarWidth: 'none' }}>
                {products.map(product => (
                    <div key={`${sectionId}-${product.id}`} style={{ flex: '0 0 220px', minWidth: 220 }}>
                        <ProductCard
                            product={product}
                            onWishlistToggle={() => setWishlistItems(wishlistService.getWishlist())}
                        />
                    </div>
                ))}
            </div>

            <button className={`home-scroll-arrow right ${!carousel.canRight ? 'disabled' : ''}`} onClick={carousel.scrollR} disabled={!carousel.canRight}>
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
                            <SearchBox onSearch={(q) => {
                                if (q) navigate(`/view-all?search=${encodeURIComponent(q)}`);
                                else navigate('/view-all');
                            }} />
                        </div>

                        <div className="nav-actions">
                            <div className="nav-icon"
                                onClick={
                                    () => navigate('/wishlist')
                            }>
                                <FaHeart/>
                                {wishlistItems.length > 0 && (
                                    <span className="badge">{wishlistItems.length}</span>
                                )}
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
                                        <div className="dropdown-item" onClick={() => navigate('/leaderboard')}>
                                            <FaTrophy/>
                                            Leaderboard
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

            {/* ── Hero Banner ── */}
            <div className="main-hero">
                <div className="main-hero-inner">
                    <div className="main-hero-text">
                        <span className="main-hero-eyebrow">🌿 Sustainable Shopping</span>
                        <h1 className="main-hero-title">
                            Shop Green,<br />Live Better
                        </h1>
                        <p className="main-hero-sub">
                            Discover thousands of eco-friendly products — from organic food to recycled goods — all in one place.
                        </p>
                    </div>
                    <div className="main-hero-stats">
                        <div className="hero-stat">
                            <span className="hero-stat-num">500+</span>
                            <span className="hero-stat-label">Eco Products</span>
                        </div>
                        <div className="hero-stat-divider" />
                        <div className="hero-stat">
                            <span className="hero-stat-num">100%</span>
                            <span className="hero-stat-label">Verified Sellers</span>
                        </div>
                        <div className="hero-stat-divider" />
                        <div className="hero-stat">
                            <span className="hero-stat-num">🌱</span>
                            <span className="hero-stat-label">Carbon Neutral</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="home-main-container">
                <div className="page-layout">
                    {/* ── Left Filter Sidebar ── */}
                    <aside className="filter-sidebar">
                        <div className="sidebar-header">
                            <FaFilter className="sidebar-header-icon" />
                            <h3>Filters</h3>
                            {(minRating > 0 || inStockOnly || priceRange < 4000 || selectedCategory) && (
                                <button className="sidebar-clear-btn" onClick={() => {
                                    setMinRating(0);
                                    setInStockOnly(false);
                                    setPriceRange(4000);
                                    setSelectedCategory('');
                                }}>Clear all</button>
                            )}
                        </div>

                        <div className="sidebar-section">
                            <h5>Price Range</h5>
                            <input type="range" min="0" max="4000"
                                value={priceRange} className="price-range"
                                onChange={(e) => setPriceRange(Number(e.target.value))} />
                            <div className="price-values">
                                <span>Rs 0</span>
                                <span>Rs {priceRange}</span>
                            </div>
                        </div>

                        <div className="sidebar-section">
                            <h5>Eco Rating</h5>
                            <div className="rating-filters">
                                {[5, 4, 3].map((rating) => (
                                    <label key={rating} className="rating-filter">
                                        <input type="radio" name="ecoRating"
                                            checked={minRating === rating}
                                            onChange={() => setMinRating(minRating === rating ? 0 : rating)} />
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

                        <div className="sidebar-section">
                            <h5>Availability</h5>
                            <label className="stock-filter">
                                <input type="checkbox"
                                    checked={inStockOnly}
                                    onChange={(e) => setInStockOnly(e.target.checked)} />
                                In Stock Only
                            </label>
                        </div>

                        <div className="sidebar-section">
                            <h5>Eco Category</h5>
                            <div className="sidebar-eco-list">
                                <label className="sidebar-eco-item">
                                    <input type="radio" name="ecoCategory"
                                        checked={selectedCategory === ''}
                                        onChange={() => setSelectedCategory('')} />
                                    <span>All Categories</span>
                                </label>
                                {ecoCategories.map(cat => (
                                    <label key={cat.id} className="sidebar-eco-item">
                                        <input type="radio" name="ecoCategory"
                                            checked={selectedCategory === cat.slug}
                                            onChange={() => setSelectedCategory(cat.slug)} />
                                        <span>{cat.name}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </aside>

                    {/* ── Right Content Area ── */}
                    <div className="content-area">
                        {/* Sort bar */}
                        <div className="content-topbar">
                            <span className="product-count">Explore eco-friendly products</span>
                            <SortDropdown value={sortBy} onChange={setSortBy} />
                        </div>

                        {/* Multiple Product Sections */}
                        {renderProductSection("Recommended for you", applyFilters(recommendedProducts), "recommended", carouselRec)}
                        {renderProductSection("Trending Now", applyFilters(trendingProducts), "trending", carouselTrend)}

                        {/* Recently Added */}
                        <div className="home-products-container">
                            <div className="section-heading">
                                <h2>Recently Added</h2>
                                <button className="view-all-btn"
                                    onClick={() => navigate(`/view-all${selectedCategory ? `?eco_category=${selectedCategory}` : ''}`)}>
                                    View All
                                </button>
                            </div>
                            <button className={`home-scroll-arrow left ${!carouselRecent.canLeft ? 'disabled' : ''}`}
                                onClick={carouselRecent.scrollL} disabled={!carouselRecent.canLeft}><FaChevronLeft/></button>
                            <div className="home-products-etsy-grid" ref={carouselRecent.ref}
                                style={{ display: 'flex', gap: 16, overflowX: 'auto', padding: '10px 0', scrollbarWidth: 'none' }}>
                                {applyFilters(products).map(product => (
                                    <div key={product.id} style={{ flex: '0 0 220px', minWidth: 220 }}>
                                        <ProductCard product={product}
                                            onWishlistToggle={() => setWishlistItems(wishlistService.getWishlist())} />
                                    </div>
                                ))}
                            </div>
                            <button className={`home-scroll-arrow right ${!carouselRecent.canRight ? 'disabled' : ''}`}
                                onClick={carouselRecent.scrollR} disabled={!carouselRecent.canRight}><FaChevronRight/></button>
                        </div>

                        {/* Top Seller */}
                        <div className="home-products-container">
                            <div className="section-heading">
                                <h2>Top Seller</h2>
                                <button className="view-all-btn"
                                    onClick={() => navigate(`/view-all${selectedCategory ? `?eco_category=${selectedCategory}` : ''}`)}>
                                    View All
                                </button>
                            </div>
                            <button className={`home-scroll-arrow left ${!carouselTop.canLeft ? 'disabled' : ''}`}
                                onClick={carouselTop.scrollL} disabled={!carouselTop.canLeft}><FaChevronLeft/></button>
                            <div className="home-products-etsy-grid" ref={carouselTop.ref}
                                style={{ display: 'flex', gap: 16, overflowX: 'auto', padding: '10px 0', scrollbarWidth: 'none' }}>
                                {applyFilters(topSellerProducts).map(product => (
                                    <div key={product.id} style={{ flex: '0 0 220px', minWidth: 220 }}>
                                        <ProductCard product={product}
                                            onWishlistToggle={() => setWishlistItems(wishlistService.getWishlist())} />
                                    </div>
                                ))}
                            </div>
                            <button className={`home-scroll-arrow right ${!carouselTop.canRight ? 'disabled' : ''}`}
                                onClick={carouselTop.scrollR} disabled={!carouselTop.canRight}><FaChevronRight/></button>
                        </div>
                    </div>
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
            <Footer />
        </div>
    );
}
