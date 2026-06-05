import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaHeart, FaStar, FaStarHalfAlt, FaShoppingCart, FaLeaf } from 'react-icons/fa';
import { wishlistService } from '../services/wishlistService';
import { getImageUrl, handleImageError } from '../utils/imageHelper';

const renderStars = (rating) => {
    const stars = [];
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5;
    for (let i = 0; i < full; i++) stars.push(<FaStar key={`f${i}`} style={S.starFull} />);
    if (half) stars.push(<FaStarHalfAlt key="h" style={S.starFull} />);
    const empty = 5 - stars.length;
    for (let i = 0; i < empty; i++) stars.push(<FaStar key={`e${i}`} style={S.starEmpty} />);
    return stars;
};

export default function ProductCard({ product, onWishlistToggle }) {
    const navigate = useNavigate();
    const [inWishlist, setInWishlist] = useState(() => wishlistService.isInWishlist(product.id));

    // Keep in sync when wishlist changes from anywhere (same tab or other tab)
    useEffect(() => {
        const sync = () => setInWishlist(wishlistService.isInWishlist(product.id));
        window.addEventListener('wishlistUpdated', sync);
        window.addEventListener('storage', sync);
        return () => {
            window.removeEventListener('wishlistUpdated', sync);
            window.removeEventListener('storage', sync);
        };
    }, [product.id]);

    const handleWishlist = (e) => {
        e.stopPropagation();
        if (inWishlist) {
            wishlistService.removeFromWishlist(product.id);
            setInWishlist(false);
        } else {
            wishlistService.addToWishlist(product);
            setInWishlist(true);
        }
        onWishlistToggle?.();
    };

    const rating = product.rating || 0;
    const hasRating = rating > 0;

    return (
        <div
            style={S.card}
            onClick={() => navigate(`/product/${product.id}`)}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-6px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
        >
            {/* Image */}
            <div style={S.imgWrap}>
                <img
                    src={getImageUrl(product.image_url, product.image)}
                    alt={product.name}
                    onError={handleImageError}
                    style={S.img}
                />
                {/* Eco badge */}
                <div style={S.ecoBadge}>
                    <FaLeaf style={{ fontSize: '0.65rem' }} /> Eco
                </div>
                {/* Wishlist */}
                <button
                    style={{ ...S.wishBtn, ...(inWishlist ? S.wishActive : {}) }}
                    onClick={handleWishlist}
                    title={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
                >
                    <FaHeart />
                </button>
                {/* Out of stock overlay */}
                {product.stock === 0 && (
                    <div style={S.outOfStock}>Out of Stock</div>
                )}
            </div>

            {/* Content */}
            <div style={S.content}>
                {/* Seller */}
                <p style={S.seller}>{product.seller_name || 'Ecomarket Seller'}</p>

                {/* Name */}
                <h3 style={S.name}>{product.name}</h3>

                {/* Category tags */}
                <div style={S.tags}>
                    {product.eco_category_detail && (
                        <span style={S.tagGreen}>{product.eco_category_detail.name}</span>
                    )}
                    {product.product_category_detail && (
                        <span style={S.tagBlue}>{product.product_category_detail.name}</span>
                    )}
                </div>

                {/* Rating */}
                <div style={S.ratingRow}>
                    <div style={S.stars}>{renderStars(rating)}</div>
                    <span style={S.ratingText}>
                        {hasRating ? rating.toFixed(1) : 'No ratings'}
                    </span>
                </div>

                {/* Price + Cart */}
                <div style={S.footer}>
                    <span style={S.price}>Rs {Math.round(product.price)}</span>
                    <button
                        style={S.cartBtn}
                        onClick={e => { e.stopPropagation(); navigate(`/product/${product.id}`); }}
                        title="View product"
                    >
                        <FaShoppingCart />
                    </button>
                </div>
            </div>
        </div>
    );
}

const S = {
    card: {
        background: 'white',
        borderRadius: 16,
        overflow: 'hidden',
        boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
        border: '1px solid #f0f0f0',
        cursor: 'pointer',
        transition: 'transform 0.25s ease, box-shadow 0.25s ease',
        display: 'flex',
        flexDirection: 'column',
    },
    imgWrap: {
        position: 'relative',
        width: '100%',
        paddingTop: '75%', // 4:3 ratio
        background: '#f8f9fa',
        overflow: 'hidden',
    },
    img: {
        position: 'absolute',
        top: 0, left: 0,
        width: '100%', height: '100%',
        objectFit: 'cover',
        transition: 'transform 0.3s ease',
    },
    ecoBadge: {
        position: 'absolute',
        top: 10, left: 10,
        background: 'rgba(46,125,50,0.9)',
        color: 'white',
        fontSize: '0.68rem',
        fontWeight: 700,
        padding: '3px 8px',
        borderRadius: 20,
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        backdropFilter: 'blur(4px)',
    },
    wishBtn: {
        position: 'absolute',
        top: 10, right: 10,
        width: 32, height: 32,
        borderRadius: '50%',
        background: 'rgba(255,255,255,0.9)',
        border: 'none',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#ccc',
        fontSize: '0.85rem',
        backdropFilter: 'blur(4px)',
        transition: 'all 0.2s',
    },
    wishActive: {
        color: '#e53935',
        background: 'rgba(255,255,255,1)',
    },
    outOfStock: {
        position: 'absolute',
        bottom: 0, left: 0, right: 0,
        background: 'rgba(0,0,0,0.55)',
        color: 'white',
        textAlign: 'center',
        fontSize: '0.78rem',
        fontWeight: 700,
        padding: '6px',
    },
    content: {
        padding: '14px 16px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        flex: 1,
    },
    seller: {
        margin: 0,
        fontSize: '0.72rem',
        color: '#94a3b8',
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.4px',
    },
    name: {
        margin: 0,
        fontSize: '0.92rem',
        fontWeight: 700,
        color: '#1a1a2e',
        lineHeight: 1.35,
        minHeight: '2.7em',   /* always reserve space for 2 lines */
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
    },
    tags: {
        display: 'flex',
        gap: 5,
        flexWrap: 'wrap',
    },
    tagGreen: {
        fontSize: '0.68rem',
        fontWeight: 600,
        background: '#e8f5e9',
        color: '#2E7D32',
        padding: '2px 8px',
        borderRadius: 10,
    },
    tagBlue: {
        fontSize: '0.68rem',
        fontWeight: 600,
        background: '#e3f2fd',
        color: '#1565c0',
        padding: '2px 8px',
        borderRadius: 10,
    },
    ratingRow: {
        display: 'flex',
        alignItems: 'center',
        gap: 6,
    },
    stars: {
        display: 'flex',
        gap: 2,
    },
    starFull: { color: '#FFC107', fontSize: '0.75rem' },
    starEmpty: { color: '#e0e0e0', fontSize: '0.75rem' },
    ratingText: {
        fontSize: '0.75rem',
        color: '#64748b',
        fontWeight: 600,
    },
    footer: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 'auto',   /* always pins price+cart to the bottom */
        paddingTop: 8,
    },
    price: {
        fontSize: '1.1rem',
        fontWeight: 800,
        color: '#2E7D32',
    },
    cartBtn: {
        width: 34, height: 34,
        borderRadius: '50%',
        background: '#2E7D32',
        border: 'none',
        color: 'white',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '0.85rem',
        transition: 'background 0.2s',
    },
};
