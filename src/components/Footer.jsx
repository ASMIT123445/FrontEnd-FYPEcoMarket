import { useNavigate } from 'react-router-dom';
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn, FaMapMarkerAlt, FaPhone, FaEnvelope, FaHeart, FaLeaf } from 'react-icons/fa';

const CATEGORIES = [
    { label: 'Recycled Items', slug: 'recycled_items' },
    { label: 'Organic Products', slug: 'organic_products' },
    { label: 'Energy-Efficient', slug: 'energy_efficient' },
    { label: 'Reusable Household', slug: 'reusable_household' },
    { label: 'Handmade Crafts', slug: 'handmade_ecocraft' },
    { label: 'Sustainable Fashion', slug: 'sustainable_fashion' },
];

const QUICK_LINKS = [
    { label: 'Home', path: '/main' },
    { label: 'Profile', path: '/profile' },
    { label: 'Wishlist', path: '/wishlist' },
    { label: 'Dashboard', path: '/seller-dashboard' },
    { label: 'Shopping Cart', path: '/cart' },
];

export default function Footer() {
    const navigate = useNavigate();

    return (
        <footer style={S.footer}>
            <div style={S.container}>
                <div style={S.grid}>

                    {/* Brand */}
                    <div style={S.col}>
                        <div style={S.brand}>
                            <FaLeaf style={{ color: '#8BC34A', fontSize: '1.4rem' }} />
                            <span>Ecomarket</span>
                        </div>
                        <p style={S.desc}>
                            Your trusted marketplace for sustainable, eco-friendly products.
                            Making green shopping accessible to everyone.
                        </p>
                        <div style={S.socials}>
                            {[FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn].map((Icon, i) => (
                                <a key={i} href="#" style={S.socialIcon} onMouseEnter={e => e.currentTarget.style.background = '#2E7D32'} onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}>
                                    <Icon />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div style={S.col}>
                        <h4 style={S.heading}>Quick Links</h4>
                        <ul style={S.list}>
                            {QUICK_LINKS.map(({ label, path }) => (
                                <li key={label} style={S.listItem}>
                                    <a
                                        onClick={() => navigate(path)}
                                        style={S.link}
                                        onMouseEnter={e => e.currentTarget.style.color = '#8BC34A'}
                                        onMouseLeave={e => e.currentTarget.style.color = '#b0bec5'}
                                    >
                                        {label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Categories */}
                    <div style={S.col}>
                        <h4 style={S.heading}>Categories</h4>
                        <ul style={S.list}>
                            {CATEGORIES.map(({ label, slug }) => (
                                <li key={slug} style={S.listItem}>
                                    <a
                                        onClick={() => navigate(`/main?eco_category=${slug}`)}
                                        style={S.link}
                                        onMouseEnter={e => e.currentTarget.style.color = '#8BC34A'}
                                        onMouseLeave={e => e.currentTarget.style.color = '#b0bec5'}
                                    >
                                        {label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact */}
                    <div style={S.col}>
                        <h4 style={S.heading}>Contact Us</h4>
                        <ul style={S.list}>
                            <li style={{ ...S.listItem, display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                                <FaMapMarkerAlt style={{ color: '#8BC34A', marginTop: 3, flexShrink: 0 }} />
                                <span style={{ color: '#b0bec5', fontSize: '0.88rem' }}>Bhagwati Marg, Naxal, Kathmandu</span>
                            </li>
                            <li style={{ ...S.listItem, display: 'flex', alignItems: 'center', gap: 10 }}>
                                <FaPhone style={{ color: '#8BC34A', flexShrink: 0 }} />
                                <span style={{ color: '#b0bec5', fontSize: '0.88rem' }}>+977 9876543210</span>
                            </li>
                            <li style={{ ...S.listItem, display: 'flex', alignItems: 'center', gap: 10 }}>
                                <FaEnvelope style={{ color: '#8BC34A', flexShrink: 0 }} />
                                <span style={{ color: '#b0bec5', fontSize: '0.88rem' }}>info@ecomarket.com</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Divider */}
                <div style={S.divider} />

                {/* Copyright */}
                <div style={S.copyright}>
                    <p style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', justifyContent: 'center' }}>
                        &copy; 2026 Ecomarket. All rights reserved. | Designed with{' '}
                        <FaHeart style={{ color: '#ff6b6b' }} /> for a sustainable future.
                    </p>
                </div>
            </div>
        </footer>
    );
}

const S = {
    footer: {
        background: 'linear-gradient(135deg, #1B5E20 0%, #2E7D32 100%)',
        color: 'white',
        marginTop: 60,
        fontFamily: "'Segoe UI', system-ui, sans-serif",
    },
    container: {
        maxWidth: 1400,
        width: '95%',
        margin: '0 auto',
        padding: '56px 0 28px',
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '40px 32px',
        marginBottom: 40,
    },
    col: {},
    brand: {
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        fontSize: '1.4rem',
        fontWeight: 800,
        color: 'white',
        marginBottom: 14,
    },
    desc: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: '0.88rem',
        lineHeight: 1.75,
        margin: '0 0 20px',
    },
    socials: {
        display: 'flex',
        gap: 10,
    },
    socialIcon: {
        width: 36,
        height: 36,
        borderRadius: '50%',
        background: 'rgba(255,255,255,0.1)',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '0.9rem',
        textDecoration: 'none',
        transition: 'background 0.2s',
        cursor: 'pointer',
    },
    heading: {
        color: '#8BC34A',
        fontWeight: 700,
        fontSize: '1rem',
        margin: '0 0 18px',
        textTransform: 'uppercase',
        letterSpacing: '0.6px',
    },
    list: {
        listStyle: 'none',
        margin: 0,
        padding: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
    },
    listItem: {},
    link: {
        color: '#b0bec5',
        fontSize: '0.88rem',
        cursor: 'pointer',
        textDecoration: 'none',
        transition: 'color 0.2s',
    },
    divider: {
        borderTop: '1px solid rgba(255,255,255,0.15)',
        marginBottom: 24,
    },
    copyright: {
        textAlign: 'center',
        color: 'rgba(255,255,255,0.6)',
        fontSize: '0.85rem',
    },
};
