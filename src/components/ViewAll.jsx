import { useEffect, useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
    FaLeaf, FaHeart, FaUtensils, FaCouch, FaTools, FaPalette,
    FaSearch, FaShoppingCart, FaChevronDown, FaFilter,
    FaStar, FaStarHalfAlt, FaUser, FaBox,
    FaSignOutAlt, FaSpinner
} from 'react-icons/fa';
import { wishlistService } from '../services/wishlistService';
import { cartService } from '../services/cartService';
import axiosInstance from '../services/axiosInstance';
import { getUserFromToken, logout } from '../utils/auth';
import { getImageUrl, handleImageError } from '../utils/imageHelper';
import '../styles/Home.css';
import Footer from './Footer';
import ProductCard from './ProductCard';
import { showConfirm } from './Toast';
import SortDropdown from './SortDropdown';

const PRODUCT_CATEGORIES = [
    { id: 'all', name: 'All Products', icon: <FaLeaf />, slug: '' },
    { id: 'accessories', name: 'Accessories', icon: <FaHeart />, slug: 'accessories' },
    { id: 'kitchen_items', name: 'Kitchen Items', icon: <FaUtensils />, slug: 'kitchen_items' },
    { id: 'home_living', name: 'Home & Living', icon: <FaCouch />, slug: 'home_living' },
    { id: 'craft_tools', name: 'Craft & Tools', icon: <FaTools />, slug: 'craft_tools' },
    { id: 'art_supplies', name: 'Art Supplies', icon: <FaPalette />, slug: 'art_supplies' },
];

export default function ViewAll() {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    // All state initialized from URL params — no race condition
    const [searchQuery, setSearchQuery] = useState(() => searchParams.get('search') || '');
    const [productCategory, setProductCategory] = useState(() => searchParams.get('category') || '');
    const [ecoCategory, setEcoCategory] = useState(() => searchParams.get('eco_category') || '');
    const [priceRange, setPriceRange] = useState(2500);
    const [minRating, setMinRating] = useState(0);
    const [inStockOnly, setInStockOnly] = useState(false);
    const [sortBy, setSortBy] = useState('featured');

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [ecoCategories, setEcoCategories] = useState([]);
    const [wishlistItems, setWishlistItems] = useState([]);
    const [user, setUser] = useState(null);
    const [cartItems, setCartItems] = useState(0);
    const [showUserDropdown, setShowUserDropdown] = useState(false);

    // Load More state
    const PAGE_SIZE = 12;
    const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

    // Init user + cart
    useEffect(() => {
        const init = async () => {
            const userInfo = getUserFromToken();
            if (userInfo) setUser(userInfo);
            try { setCartItems(await cartService.getCartCount()); } catch {}
            setWishlistItems(wishlistService.getWishlist());
        };
        init();
    }, []);

    // Fetch eco categories
    useEffect(() => {
        axiosInstance.get('/products/categories/').then(r => setEcoCategories(r.data)).catch(() => {
            setEcoCategories([
                { id: 1, name: 'Recycled Items', slug: 'recycled_items' },
                { id: 2, name: 'Organic Products', slug: 'organic_products' },
                { id: 3, name: 'Energy-Efficient', slug: 'energy_efficient' },
                { id: 4, name: 'Reusable Household', slug: 'reusable_household' },
                { id: 5, name: 'Handmade Eco-Crafts', slug: 'handmade_ecocraft' },
                { id: 6, name: 'Sustainable Fashion', slug: 'sustainable_fashion' },
            ]);
        });
    }, []);

    // Sync URL params → state when URL changes (e.g. footer category click)
    useEffect(() => {
        const cat = searchParams.get('category') || '';
        const eco = searchParams.get('eco_category') || '';
        const q = searchParams.get('search') || '';
        setProductCategory(cat);
        setEcoCategory(eco);
        setSearchQuery(q);
    }, [searchParams]);

    // Fetch products from backend
    useEffect(() => {
        const fetch = async () => {
            setLoading(true);
            try {
                const params = new URLSearchParams();
                if (productCategory) params.append('product_category', productCategory);
                if (ecoCategory) params.append('category', ecoCategory);
                if (searchQuery.trim()) params.append('search', searchQuery.trim());
                if (priceRange < 2500) params.append('max_price', priceRange);
                const url = '/products/' + (params.toString() ? '?' + params.toString() : '');
                const res = await axiosInstance.get(url);
                setProducts(res.data);
            } catch { setProducts([]); }
            finally { setLoading(false); }
        };
        fetch();
    }, [productCategory, ecoCategory, searchQuery, priceRange]);

    // Client-side filters (rating, stock, sort)
    const filteredProducts = useMemo(() => {
        setVisibleCount(PAGE_SIZE); // reset to first page on any filter/sort change
        return products
            .filter(p => minRating > 0 ? (p.rating || 0) >= minRating : true)
            .filter(p => inStockOnly ? p.stock > 0 : true)
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
    }, [products, minRating, inStockOnly, sortBy]);

    const visibleProducts = filteredProducts.slice(0, visibleCount);
    const hasMore = visibleCount < filteredProducts.length;

    const handleSearch = (e) => {
        if (e.key === 'Enter' || e.type === 'click') {
            const p = new URLSearchParams();
            if (searchQuery.trim()) p.set('search', searchQuery.trim());
            if (productCategory) p.set('category', productCategory);
            if (ecoCategory) p.set('eco_category', ecoCategory);
            setSearchParams(p);
        }
    };

    const handleLogout = () => {
        showConfirm('Are you sure you want to logout?', () => { logout(); navigate('/login'); });
    };

    const handleProductCategoryClick = (slug) => {
        const p = new URLSearchParams(searchParams);
        if (slug) p.set('category', slug); else p.delete('category');
        setSearchParams(p);
    };

    const handleEcoCategoryChange = (slug) => {
        const p = new URLSearchParams(searchParams);
        if (slug) p.set('eco_category', slug); else p.delete('eco_category');
        setSearchParams(p);
    };

    const clearAll = () => {
        setSearchParams({});
        setPriceRange(2500);
        setMinRating(0);
        setInStockOnly(false);
        setSortBy('featured');
    };

    const toggleWishlist = (product, e) => {
        e.stopPropagation();
        wishlistService.isInWishlist(product.id)
            ? wishlistService.removeFromWishlist(product.id)
            : wishlistService.addToWishlist(product);
        setWishlistItems(wishlistService.getWishlist());
    };

    const renderStars = (rating) => {
        const stars = [];
        const full = Math.floor(rating);
        const half = rating % 1 >= 0.5;
        for (let i = 0; i < full; i++) stars.push(<FaStar key={`f${i}`} className="star full" />);
        if (half) stars.push(<FaStarHalfAlt key="h" className="star half" />);
        const empty = 5 - stars.length;
        for (let i = 0; i < empty; i++) stars.push(<FaStar key={`e${i}`} className="star empty" />);
        return stars;
    };

    return (
        <div className="home-container">
            {/* Header */}
            <header className="header1">
                <div className="container">
                    <nav className="navbar">
                        <a href="#" className="logo" onClick={() => navigate('/main')}>
                            <FaLeaf className="logo-icon" />
                            <span className="logo-text">Ecomarket</span>
                        </a>
                        <div className="search-bar">
                            <FaSearch className="search-icon" onClick={handleSearch} />
                            <input
                                type="text"
                                placeholder="Search products..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                onKeyDown={handleSearch}
                            />
                            <button className="search-button" onClick={handleSearch}>Search</button>
                        </div>
                        <div className="nav-actions">
                            <div className="nav-icon" onClick={() => navigate('/wishlist')}><FaHeart /></div>
                            <div className="nav-icon" id="cart-icon" onClick={() => navigate('/cart')}>
                                <FaShoppingCart /><span className="badge">{cartItems}</span>
                            </div>
                            <div className="user-menu-container">
                                <div className="user-menu" onClick={() => setShowUserDropdown(!showUserDropdown)}>
                                    <div className="user-avatar">{user?.username?.[0]?.toUpperCase() || 'U'}</div>
                                    <span className="user-name">{user?.username || 'User'}</span>
                                    <FaChevronDown className={`dropdown-arrow ${showUserDropdown ? 'rotated' : ''}`} />
                                </div>
                                {showUserDropdown && (
                                    <div className="user-dropdown">
                                        <div className="dropdown-item" onClick={() => navigate('/profile')}>
                                            <FaUser /> Profile
                                        </div>
                                        {user?.role === 'seller' && (
                                            <div className="dropdown-item" onClick={() => navigate('/seller-dashboard')}>
                                                <FaBox /> Seller Dashboard
                                            </div>
                                        )}
                                        <div className="dropdown-item" onClick={() => navigate('/cart')}>
                                            <FaShoppingCart /> My Orders
                                        </div>
                                        <div className="dropdown-item" onClick={() => navigate('/wishlist')}>
                                            <FaHeart /> Wishlist
                                        </div>
                                        <div className="dropdown-divider"></div>
                                        <div className="dropdown-item logout-item" onClick={handleLogout}>
                                            <FaSignOutAlt /> Logout
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </nav>
                </div>
            </header>

            {/* Product Category Tabs */}
            <div className="categories-nav">
                <div className="home-main-container">
                    <div className="categories-scroll">
                        {PRODUCT_CATEGORIES.map(cat => (
                            <button
                                key={cat.id}
                                className={`category-tab ${productCategory === cat.slug ? 'active' : ''}`}
                                onClick={() => handleProductCategoryClick(cat.slug)}
                            >
                                <span className="category-icon">{cat.icon}</span>
                                <span className="category-name">{cat.name}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="home-main-container">
                {/* Breadcrumb */}
                <div style={{ margin: '20px 0 0', fontSize: 14, color: '#666' }}>
                    <span onClick={() => navigate('/main')} style={{ color: '#2E7D32', cursor: 'pointer' }}>Home</span>
                    <span style={{ margin: '0 8px' }}>&gt;</span>
                    <span style={{ color: '#333', fontWeight: 500 }}>
                        {searchQuery ? `Search: "${searchQuery}"` : 'All Products'}
                    </span>
                </div>

                <div className="page-layout">
                    {/* ── Left Filter Sidebar ── */}
                    <aside className="filter-sidebar">
                        <div className="sidebar-header">
                            <FaFilter className="sidebar-header-icon" />
                            <h3>Filters</h3>
                            {(minRating > 0 || inStockOnly || priceRange < 2500 || ecoCategory) && (
                                <button className="sidebar-clear-btn" onClick={clearAll}>Clear all</button>
                            )}
                        </div>

                        <div className="sidebar-section">
                            <h5>Price Range</h5>
                            <input type="range" min="0" max="2500" value={priceRange} className="price-range"
                                onChange={e => setPriceRange(Number(e.target.value))} />
                            <div className="price-values"><span>Rs 0</span><span>Rs {priceRange}</span></div>
                        </div>

                        <div className="sidebar-section">
                            <h5>Eco Rating</h5>
                            <div className="rating-filters">
                                {[5, 4, 3].map(r => (
                                    <label key={r} className="rating-filter">
                                        <input type="radio" name="ecoRating"
                                            checked={minRating === r}
                                            onChange={() => setMinRating(minRating === r ? 0 : r)} />
                                        <span className="stars">
                                            {Array(r).fill().map((_, i) => <FaStar key={i} className="star small" />)}
                                            <span className="rating-text">& up</span>
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="sidebar-section">
                            <h5>Availability</h5>
                            <label className="stock-filter">
                                <input type="checkbox" checked={inStockOnly}
                                    onChange={e => setInStockOnly(e.target.checked)} />
                                In Stock Only
                            </label>
                        </div>

                        <div className="sidebar-section">
                            <h5>Eco Category</h5>
                            <div className="sidebar-eco-list">
                                <label className="sidebar-eco-item">
                                    <input type="radio" name="ecoCategory"
                                        checked={ecoCategory === ''}
                                        onChange={() => handleEcoCategoryChange('')} />
                                    <span>All Categories</span>
                                </label>
                                {ecoCategories.map(c => (
                                    <label key={c.id} className="sidebar-eco-item">
                                        <input type="radio" name="ecoCategory"
                                            checked={ecoCategory === c.slug}
                                            onChange={() => handleEcoCategoryChange(c.slug)} />
                                        <span>{c.name}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </aside>

                    {/* ── Right Content Area ── */}
                    <div className="content-area">
                        {/* Sort + count bar */}
                        <div className="content-topbar">
                            <span className="product-count">
                                {loading ? 'Loading...' : `${visibleCount < filteredProducts.length ? `${visibleCount} of ` : ''}${filteredProducts.length} products`}
                            </span>
                            <SortDropdown value={sortBy} onChange={setSortBy} />
                        </div>

                        {/* Products Grid */}
                        <div className="home-products-container">
                            <div className="section-heading">
                                <h2>
                                    {searchQuery ? `Results for "${searchQuery}"` :
                                     productCategory || ecoCategory ? 'Filtered Products' : 'All Products'}
                                </h2>
                            </div>

                            {loading ? (
                                <div style={{ textAlign: 'center', padding: 40, color: '#666' }}>Loading products...</div>
                            ) : filteredProducts.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: 40, color: '#666' }}>
                                    <p>No products found. Try adjusting your filters.</p>
                                    <button onClick={clearAll} style={{ marginTop: 15, padding: '10px 20px', background: '#2E7D32', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer' }}>
                                        Clear Filters
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <div className="products-grid">
                                        {visibleProducts.map(product => (
                                            <ProductCard
                                                key={product.id}
                                                product={product}
                                                onWishlistToggle={() => setWishlistItems(wishlistService.getWishlist())}
                                            />
                                        ))}
                                    </div>

                                    {/* Load More / See Less — text link, right-aligned */}
                                    {filteredProducts.length > PAGE_SIZE && (
                                        <div className="see-more-row">
                                            <span className="see-more-count">
                                                Showing {Math.min(visibleCount, filteredProducts.length)} of {filteredProducts.length}
                                            </span>
                                            {hasMore ? (
                                                <span
                                                    className="see-more-link"
                                                    onClick={() => setVisibleCount(c => c + PAGE_SIZE)}
                                                >
                                                    See more
                                                </span>
                                            ) : (
                                                <span
                                                    className="see-more-link"
                                                    onClick={() => setVisibleCount(PAGE_SIZE)}
                                                >
                                                    See less
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}
