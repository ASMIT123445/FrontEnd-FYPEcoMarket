import { useState, useRef, useEffect } from 'react';
import { FaSortAmountDown, FaCheck, FaChevronDown } from 'react-icons/fa';

const SORT_OPTIONS = [
    { value: 'featured',   label: 'Featured' },
    { value: 'newest',     label: 'Newest First' },
    { value: 'price_asc',  label: 'Price: Low to High' },
    { value: 'price_desc', label: 'Price: High to Low' },
    { value: 'name_asc',   label: 'Name: A to Z' },
    { value: 'name_desc',  label: 'Name: Z to A' },
    { value: 'rating',     label: 'Highest Rated' },
];

export default function SortDropdown({ value, onChange }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    const selected = SORT_OPTIONS.find(o => o.value === value) || SORT_OPTIONS[0];

    // Close on outside click
    useEffect(() => {
        const handler = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    return (
        <div className="sort-dropdown" ref={ref}>
            <button
                className={`sort-dropdown-trigger ${open ? 'open' : ''}`}
                onClick={() => setOpen(o => !o)}
                type="button"
            >
                <FaSortAmountDown className="sort-icon" />
                <span className="sort-label">Sort by:</span>
                <span className="sort-value">{selected.label}</span>
                <FaChevronDown className={`sort-chevron ${open ? 'rotated' : ''}`} />
            </button>

            {open && (
                <div className="sort-dropdown-menu">
                    {SORT_OPTIONS.map(opt => (
                        <button
                            key={opt.value}
                            className={`sort-dropdown-item ${opt.value === value ? 'active' : ''}`}
                            onClick={() => { onChange(opt.value); setOpen(false); }}
                            type="button"
                        >
                            <span>{opt.label}</span>
                            {opt.value === value && <FaCheck className="sort-check" />}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
