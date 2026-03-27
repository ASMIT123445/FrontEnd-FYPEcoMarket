/**
 * Get the full image URL for a product
 * Handles both absolute URLs and relative paths
 */
export const getImageUrl = (imageUrl, fallbackImage = null) => {
    // If no image provided, return fallback
    if (!imageUrl && !fallbackImage) {
        return 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
    }

    const image = imageUrl || fallbackImage;
    
    // If already a full URL (starts with http:// or https://), return as is
    if (image && (image.startsWith('http://') || image.startsWith('https://'))) {
        return image;
    }
    
    // If it's a relative path, prepend the backend URL
    if (image && image.startsWith('/media/')) {
        return `http://127.0.0.1:8000${image}`;
    }
    
    // If it starts with 'media/', add the leading slash and backend URL
    if (image && image.startsWith('media/')) {
        return `http://127.0.0.1:8000/${image}`;
    }
    
    // Default fallback
    return image || 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
};

/**
 * Handle image load error by setting a fallback image
 */
export const handleImageError = (e) => {
    e.target.src = 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
};
