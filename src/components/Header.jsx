import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FaLeaf, FaHeart, FaShoppingCart, FaChevronDown, FaUser, FaSignOutAlt,
  FaSearch, FaBars, FaTimes, FaTrophy, FaClock
} from 'react-icons/fa';
import { getUserFromToken, logout } from '../utils/auth';
import { cartService } from '../services/cartService';
import { wishlistService } from '../services/wishlistService';

// ── Search history helpers (localStorage) ────────────────────────────────────
const HISTORY_KEY = 'eco_search_history';
const MAX_HISTORY = 5;

function getHistory() {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY)) || []; }
  catch { return []; }
}
function saveToHistory(term) {
  if (!term.trim()) return;
  const prev = getHistory().filter(t => t.toLowerCase() !== term.toLowerCase());
  localStorage.setItem(HISTORY_KEY, JSON.stringify([term, ...prev].slice(0, MAX_HISTORY)));
}
function deleteFromHistory(term) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(getHistory().filter(t => t !== term)));
}

// ── SearchBox component ───────────────────────────────────────────────────────
export function SearchBox({ onSearch, autoFocus = false, initialQuery = '' }) {
  const [query, setQuery]         = useState(initialQuery);
  const [suggestions, setSuggestions] = useState([]);
  const [history, setHistory]     = useState(getHistory);
  const [open, setOpen]           = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const wrapperRef                = useRef(null);

  // Sync if initialQuery changes (e.g. URL param changes on same page)
  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);
  const debounceRef               = useRef(null);
  const inputRef                  = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
        setActiveIdx(-1);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Fetch from backend using plain fetch (no auth interceptor interference)
  const fetchSuggestions = async (q) => {
    try {
      const url = q.trim()
        ? `http://127.0.0.1:8000/api/products/suggestions/?q=${encodeURIComponent(q.trim())}`
        : `http://127.0.0.1:8000/api/products/suggestions/`;
      const res = await fetch(url);
      if (!res.ok) return;
      const data = await res.json();
      setSuggestions(data.suggestions || []);
    } catch {
      setSuggestions([]);
    }
  };

  // On focus: load immediately
  const handleFocus = () => {
    setOpen(true);
    fetchSuggestions(query);
  };

  // On typing: debounce 250ms
  const handleChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    setOpen(true);
    setActiveIdx(-1);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(val), 250);
  };

  const doSearch = (term) => {
    const q = (term !== undefined ? term : query).trim();
    if (q) saveToHistory(q);
    setHistory(getHistory());
    setOpen(false);
    setActiveIdx(-1);
    onSearch(q);
    setQuery(q);
  };

  // All items for keyboard nav
  const allItems = [
    ...(!query.trim() ? history.map(h => ({ type: 'history', label: h })) : []),
    ...suggestions.map(s => ({ type: 'suggestion', label: s.name })),
  ];

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIdx(i => Math.min(i + 1, allItems.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIdx(i => Math.max(i - 1, -1));
    } else if (e.key === 'Enter') {
      if (activeIdx >= 0 && allItems[activeIdx]) doSearch(allItems[activeIdx].label);
      else doSearch();
    } else if (e.key === 'Escape') {
      setOpen(false);
      setActiveIdx(-1);
    }
  };

  const showDropdown = open && allItems.length > 0;

  return (
    <div className={`search-wrapper${showDropdown ? ' dropdown-open' : ''}`} ref={wrapperRef}>
      {/* Search bar */}
      <div className={`header-search-bar ${open || query ? 'focused' : ''}`}>
        <FaSearch className="search-icon-left" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          autoFocus={autoFocus}
          onChange={handleChange}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          placeholder="Search eco products..."
          className="search-input"
          autoComplete="off"
        />
        {query && (
          <button
            className="search-clear-btn"
            onMouseDown={e => {
              e.preventDefault();
              setQuery('');
              setSuggestions([]);
              fetchSuggestions('');
              setOpen(true);
              inputRef.current?.focus();
            }}
            aria-label="Clear"
          >
            <FaTimes />
          </button>
        )}
        <button
          className="search-submit-btn"
          onMouseDown={() => doSearch()}
        >
          Search
        </button>
      </div>

      {/* Google-style dropdown */}
      {showDropdown && (
        <ul className="search-dropdown" role="listbox">
          {/* History items */}
          {!query.trim() && history.length > 0 && (
            <>
              <li className="search-dropdown-label">Recent searches</li>
              {history.map((term, i) => (
                <li
                  key={`h-${i}`}
                  role="option"
                  className={`search-dropdown-item ${activeIdx === i ? 'active' : ''}`}
                  onMouseEnter={() => setActiveIdx(i)}
                  onMouseDown={() => doSearch(term)}
                >
                  <FaClock className="item-icon history-icon" />
                  <span className="item-text">{term}</span>
                  <button
                    className="item-remove-btn"
                    onMouseDown={e => {
                      e.stopPropagation();
                      deleteFromHistory(term);
                      setHistory(getHistory());
                    }}
                    aria-label="Remove"
                  >
                    <FaTimes />
                  </button>
                </li>
              ))}
              {suggestions.length > 0 && <li className="search-dropdown-divider" />}
            </>
          )}

          {/* Product suggestions */}
          {suggestions.map((product, i) => {
            const flatIdx = (!query.trim() ? history.length : 0) + i;
            return (
              <li
                key={`s-${product.id}`}
                role="option"
                className={`search-dropdown-item ${activeIdx === flatIdx ? 'active' : ''}`}
                onMouseEnter={() => setActiveIdx(flatIdx)}
                onMouseDown={() => doSearch(product.name)}
              >
                <FaSearch className="item-icon suggestion-icon" />
                <span className="item-text">
                  {highlightMatch(product.name, query)}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

// Bold the matched portion of the product name
function highlightMatch(name, query) {
  if (!query.trim()) return name;
  const idx = name.toLowerCase().indexOf(query.toLowerCase().trim());
  if (idx === -1) return name;
  return (
    <>
      {name.slice(0, idx)}
      <strong>{name.slice(idx, idx + query.trim().length)}</strong>
      {name.slice(idx + query.trim().length)}
    </>
  );
}

// ── Main Header ───────────────────────────────────────────────────────────────
const Header = ({ cartCount, initialQuery = '' }) => {
  const navigate = useNavigate();
  const [user, setUser]                         = useState(null);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [userLoading, setUserLoading]           = useState(true);
  const [currentCartCount, setCurrentCartCount] = useState(0);
  const [wishlistCount, setWishlistCount]       = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen]     = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  useEffect(() => {
    const userInfo = getUserFromToken();
    setUser(userInfo);
    setUserLoading(false);

    if (cartCount !== undefined) {
      setCurrentCartCount(cartCount);
    } else if (userInfo) {
      cartService.getCartCount()
        .then(count => setCurrentCartCount(count))
        .catch(() => setCurrentCartCount(0));
    }

    setWishlistCount(wishlistService.getWishlistCount());
    const handleStorage = () => setWishlistCount(wishlistService.getWishlistCount());
    window.addEventListener('storage', handleStorage);
    window.addEventListener('wishlistUpdated', handleStorage);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('wishlistUpdated', handleStorage);
    };
  }, [cartCount]);

  const handleSearch = (q) => {
    if (q) navigate(`/view-all?search=${encodeURIComponent(q)}`);
    else navigate('/view-all');
    setMobileSearchOpen(false);
  };

  return (
    <header className="app-header">
      <div className="container">
        <div className="header-content">
          <div className="header-left">
            <Link to="/main" className="logo">
              <FaLeaf />
              <span className="logo-text">Ecomarket</span>
            </Link>
          </div>

          {/* Desktop Search */}
          <div className="desktop-search-area">
            <SearchBox onSearch={handleSearch} initialQuery={initialQuery} />
          </div>

          <div className="header-right">
            <div className="nav-actions">
              <div className="nav-icon mobile-search-toggle" onClick={() => setMobileSearchOpen(!mobileSearchOpen)}>
                <FaSearch />
              </div>
              <div className="nav-icon" onClick={() => navigate('/wishlist')}>
                <FaHeart />
                {wishlistCount > 0 && <span className="badge">{wishlistCount}</span>}
              </div>
              <div className="nav-icon" onClick={() => navigate('/cart')}>
                <FaShoppingCart />
                <span className="badge">{currentCartCount}</span>
              </div>
              <div className="user-menu-container desktop-user-menu">
                <div className="user-menu" onClick={() => setShowUserDropdown(!showUserDropdown)}>
                  <div className="user-avatar">
                    {userLoading ? '…' :
                     (user?.username ? user.username.charAt(0).toUpperCase() :
                      user?.first_name ? user.first_name.charAt(0).toUpperCase() : 'U')}
                  </div>
                  <span className="user-name">
                    {userLoading ? 'Loading…' :
                     (user?.username ||
                      (user?.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : 'User'))}
                  </span>
                  <FaChevronDown className={`dropdown-arrow ${showUserDropdown ? 'rotated' : ''}`} />
                </div>
                {showUserDropdown && (
                  <div className="user-dropdown">
                    <div className="dropdown-item" onClick={() => { navigate('/profile'); setShowUserDropdown(false); }}>
                      <FaUser /> Profile
                    </div>
                    <div className="dropdown-item" onClick={() => { navigate('/cart'); setShowUserDropdown(false); }}>
                      <FaShoppingCart /> My Orders
                    </div>
                    <div className="dropdown-item" onClick={() => { navigate('/wishlist'); setShowUserDropdown(false); }}>
                      <FaHeart /> Wishlist
                    </div>
                    <div className="dropdown-item" onClick={() => { navigate('/leaderboard'); setShowUserDropdown(false); }}>
                      <FaTrophy /> Leaderboard
                    </div>
                    <div className="dropdown-divider"></div>
                    <div className="dropdown-item logout-item" onClick={logout}>
                      <FaSignOutAlt /> Logout
                    </div>
                  </div>
                )}
              </div>
              <div className="nav-icon mobile-menu-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                {mobileMenuOpen ? <FaTimes /> : <FaBars />}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Search */}
        {mobileSearchOpen && (
          <div className="mobile-search-area">
            <SearchBox onSearch={handleSearch} autoFocus />
          </div>
        )}

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="mobile-menu">
            <div className="mobile-menu-user">
              <div className="user-avatar" style={{ width: 44, height: 44, fontSize: 18 }}>
                {userLoading ? '…' : (user?.username ? user.username.charAt(0).toUpperCase() : 'U')}
              </div>
              <span style={{ fontWeight: 600, color: '#333' }}>
                {userLoading ? 'Loading…' : (user?.username || 'User')}
              </span>
            </div>
            <div className="mobile-menu-item" onClick={() => { navigate('/profile'); setMobileMenuOpen(false); }}><FaUser /> Profile</div>
            <div className="mobile-menu-item" onClick={() => { navigate('/cart'); setMobileMenuOpen(false); }}><FaShoppingCart /> My Orders</div>
            <div className="mobile-menu-item" onClick={() => { navigate('/wishlist'); setMobileMenuOpen(false); }}><FaHeart /> Wishlist</div>
            <div className="mobile-menu-item" onClick={() => { navigate('/leaderboard'); setMobileMenuOpen(false); }}><FaTrophy /> Leaderboard</div>
            <div className="mobile-menu-divider"></div>
            <div className="mobile-menu-item logout" onClick={logout}><FaSignOutAlt /> Logout</div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
