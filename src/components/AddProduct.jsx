import { useState, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import axiosInstance from "../services/axiosInstance";
import Header from "./Header";
import { 
  FaArrowLeft,
  FaSpinner,
  FaCheckCircle,
  FaExclamationCircle,
  FaUpload,
  FaInfoCircle
} from "react-icons/fa";
import "../styles/Header.css";

export default function AddProduct() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editProductId = searchParams.get('edit');
  const [loading, setLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [sellerVerified, setSellerVerified] = useState(null); // null = loading
  const [message, setMessage] = useState({ type: "", text: "" });
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    eco_category: "", // Use eco_category instead of category
    product_category: "", // New product category field
    image: null
  });

  const [ecoCategories, setEcoCategories] = useState([]);
  const [productCategories, setProductCategories] = useState([]);

  // Check seller verification status on mount
  useEffect(() => {
    const checkVerification = async () => {
      try {
        const response = await axiosInstance.get('/profile/');
        const profile = response.data;
        if (profile.role === 'seller') {
          setSellerVerified(profile.is_verified === true);
        } else {
          setSellerVerified(false); // not a seller
        }
      } catch (err) {
        setSellerVerified(false);
      }
    };
    checkVerification();
  }, []);

  // Fetch eco categories on component mount
  useEffect(() => {
    const fetchEcoCategories = async () => {
      try {
        const response = await axiosInstance.get('/products/eco-categories/');
        setEcoCategories(response.data);
        // Set default category to first available category
        if (response.data.length > 0) {
          setFormData(prev => ({
            ...prev,
            eco_category: response.data[0].id
          }));
        }
      } catch (error) {
        console.error('Error fetching eco categories:', error);
        // Fallback to legacy categories API
        try {
          const fallbackResponse = await axiosInstance.get('/products/categories/');
          // Map the categories to the format expected
          const mappedCategories = fallbackResponse.data.map(cat => ({
            id: cat.id,
            name: cat.name,
            slug: cat.slug
          }));
          setEcoCategories(mappedCategories);
          if (mappedCategories.length > 0) {
            setFormData(prev => ({
              ...prev,
              eco_category: mappedCategories[0].id
            }));
          }
        } catch (fallbackError) {
          console.error('Error fetching fallback categories:', fallbackError);
          // Hard-coded fallback with IDs
          const hardcodedCategories = [
            { id: 1, name: 'Recycled Items', slug: 'recycled_items' },
            { id: 2, name: 'Organic Products', slug: 'organic_products' },
            { id: 3, name: 'Energy-Efficient', slug: 'energy_efficient' },
            { id: 4, name: 'Reusable Household', slug: 'reusable_household' },
            { id: 5, name: 'Handmade Eco-Crafts', slug: 'handmade_ecocraft' },
            { id: 6, name: 'Sustainable Fashion', slug: 'sustainable_fashion' },
            { id: 7, name: 'Eco Home & Garden', slug: 'eco_home_garden' },
          ];
          setEcoCategories(hardcodedCategories);
          setFormData(prev => ({
            ...prev,
            eco_category: hardcodedCategories[0].id
          }));
        }
      }
    };

    const fetchProductCategories = async () => {
      try {
        const response = await axiosInstance.get('/products/product-categories/');
        setProductCategories(response.data);
        // Set default product category to first available
        if (response.data.length > 0) {
          setFormData(prev => ({
            ...prev,
            product_category: response.data[0].id
          }));
        }
      } catch (error) {
        console.error('Error fetching product categories:', error);
      }
    };

    fetchEcoCategories();
    fetchProductCategories();
  }, []);

  // Load product data if in edit mode
  useEffect(() => {
    if (editProductId) {
      setIsEditMode(true);
      const loadProductData = async () => {
        try {
          const response = await axiosInstance.get(`/products/${editProductId}/`);
          const product = response.data;
          
          setFormData({
            name: product.name,
            description: product.description,
            price: product.price,
            stock: product.stock,
            eco_category: product.eco_category || '',
            product_category: product.product_category || '',
            image: null, // Don't load existing image, user can keep it or change it
          });
          
          setMessage({ 
            type: "info", 
            text: "Editing product. Leave image empty to keep current image." 
          });
        } catch (error) {
          console.error('Error loading product:', error);
          setMessage({ 
            type: "error", 
            text: "Error loading product data. Please try again." 
          });
        }
      };
      
      loadProductData();
    }
  }, [editProductId]);

  const handleInputChange = (e) => {
    const { name, value, type, files } = e.target;
    
    if (type === "file") {
      setFormData(prev => ({
        ...prev,
        [name]: files[0]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }

    // Clear messages when user starts typing
    if (message.text) {
      setMessage({ type: "", text: "" });
    }
  };

  const testAuth = async () => {
    try {
      const response = await axiosInstance.get('/products/test-auth/');
      console.log('Auth test response:', response.data);
      setMessage({ 
        type: "success", 
        text: `Auth working: ${response.data.user}` 
      });
    } catch (err) {
      console.error('Auth test error:', err);
      setMessage({ 
        type: "error", 
        text: `Auth failed: ${err.response?.data?.detail || err.message}` 
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Reset messages
    setMessage({ type: "", text: "" });

    // Validation
    if (!formData.name.trim()) {
      setMessage({ type: "error", text: "Product name is required" });
      return;
    }
    
    if (!formData.description.trim()) {
      setMessage({ type: "error", text: "Product description is required" });
      return;
    }
    
    if (!formData.price || parseFloat(formData.price) <= 0) {
      setMessage({ type: "error", text: "Please enter a valid price" });
      return;
    }
    
    if (!formData.stock || parseInt(formData.stock) < 0) {
      setMessage({ type: "error", text: "Please enter a valid stock quantity" });
      return;
    }
    
    // Image is required only for new products
    if (!isEditMode && !formData.image) {
      setMessage({ type: "error", text: "Product image is required" });
      return;
    }

    setLoading(true);

    try {
      // Create FormData for file upload
      const productData = new FormData();
      productData.append('name', formData.name.trim());
      productData.append('description', formData.description.trim());
      productData.append('price', parseFloat(formData.price));
      productData.append('stock', parseInt(formData.stock));
      productData.append('eco_category', formData.eco_category);
      productData.append('product_category', formData.product_category);
      
      // Only append image if a new one is selected
      if (formData.image) {
        productData.append('image', formData.image);
      }

      let response;
      
      if (isEditMode) {
        // Update existing product
        response = await axiosInstance.put(`/products/${editProductId}/`, productData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        
        if (response.status === 200) {
          setMessage({ 
            type: "success", 
            text: "Product updated successfully!" 
          });
          
          // Redirect to profile after 2 seconds
          setTimeout(() => {
            navigate("/profile");
          }, 2000);
        }
      } else {
        // Create new product
        response = await axiosInstance.post("/products/", productData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        if (response.status === 201) {
          setMessage({ 
            type: "success", 
            text: "Product added successfully!" 
          });
          
          // Reset form
          setFormData({
            name: "",
            description: "",
            price: "",
            stock: "",
            eco_category: ecoCategories.length > 0 ? ecoCategories[0].id : "",
            product_category: productCategories.length > 0 ? productCategories[0].id : "",
            image: null
          });
          
          // Reset file input
          const fileInput = document.getElementById('image');
          if (fileInput) fileInput.value = '';
          
          // Redirect to products page after 2 seconds
          setTimeout(() => {
            navigate("/main");
          }, 2000);
        }
      }

    } catch (err) {
      console.error("Add product error:", err);
      console.error("Error response:", err.response);
      console.error("Error data:", err.response?.data);
      
      let errorMessage = "Failed to add product. Please try again.";
      
      if (err.response?.data) {
        if (err.response.data.error) {
          errorMessage = err.response.data.error;
        } else if (err.response.data.message) {
          errorMessage = err.response.data.message;
        } else if (typeof err.response.data === 'object') {
          // Handle field-specific errors
          const errors = Object.values(err.response.data).flat();
          if (errors.length > 0) {
            errorMessage = errors.join(', ');
          }
        }
      } else if (err.response?.status === 401) {
        errorMessage = "Please login to add products";
        setTimeout(() => navigate("/login"), 2000);
      } else if (err.response?.status === 403) {
        errorMessage = "Only sellers can add products";
      }
      
      setMessage({ 
        type: "error", 
        text: errorMessage 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-product-page">
      {/* Header */}
      <Header cartCount={2} />

      {/* Page banner — consistent with SellerDashboard / SellerOnboarding */}
      <div className="add-product-banner">
        <div className="add-product-banner-inner">
          <h1>{isEditMode ? '✏️ Edit Product' : '📦 Add New Product'}</h1>
          <p>{isEditMode ? 'Update your product information' : 'Add your eco-friendly product to the marketplace'}</p>
        </div>
      </div>

      {/* Unverified seller block */}
      {sellerVerified === false && (
        <div className="add-product-container">
          <div className="add-product-content" style={{ textAlign: 'center', padding: '60px 40px' }}>
            <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🔒</div>
            <h2 style={{ color: '#e65100', marginBottom: '15px' }}>Account Not Verified</h2>
            <p style={{ color: '#666', fontSize: '1.1rem', marginBottom: '30px' }}>
              Your seller account is pending admin verification. You cannot add products until your account is approved.
            </p>
            <p style={{ color: '#999', fontSize: '0.95rem' }}>
              Please wait for admin to review your onboarding documents. You'll be able to add products once verified.
            </p>
            <button
              onClick={() => navigate('/main')}
              style={{
                marginTop: '30px', padding: '12px 30px', background: '#2E7D32',
                color: 'white', border: 'none', borderRadius: '10px',
                fontSize: '1rem', cursor: 'pointer', fontWeight: 600
              }}
            >
              Go Back to Home
            </button>
          </div>
        </div>
      )}

      {/* Show form only for verified sellers */}
      {sellerVerified === true && (
        <div className="add-product-container">
        <div className="add-product-content">

          {/* Success/Error Messages */}
          {message.type === "success" && (
            <div className="alert success">
              <FaCheckCircle /> {message.text}
            </div>
          )}
          
          {message.type === "error" && (
            <div className="alert error">
              <FaExclamationCircle /> {message.text}
            </div>
          )}

          {/* Form */}
          <form className="add-product-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Product Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                className="form-control"
                placeholder="Enter product name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Description *</label>
              <textarea
                id="description"
                name="description"
                className="form-control"
                placeholder="Describe your product, its eco-friendly features, and benefits"
                rows="4"
                value={formData.description}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="eco_category">Eco Category *</label>
              <select
                id="eco_category"
                name="eco_category"
                className="form-control"
                value={formData.eco_category}
                onChange={handleInputChange}
                required
              >
                {ecoCategories.length === 0 ? (
                  <option value="">Loading categories...</option>
                ) : (
                  ecoCategories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="product_category">Product Category *</label>
              <select
                id="product_category"
                name="product_category"
                className="form-control"
                value={formData.product_category}
                onChange={handleInputChange}
                required
              >
                {productCategories.length === 0 ? (
                  <option value="">Loading categories...</option>
                ) : (
                  productCategories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="price">Price (Rs) *</label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  className="form-control"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="stock">Stock Quantity *</label>
                <input
                  type="number"
                  id="stock"
                  name="stock"
                  className="form-control"
                  placeholder="0"
                  min="0"
                  value={formData.stock}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>


            <div className="form-group">
              <label htmlFor="image">
                Product Image {isEditMode ? '(Optional - leave empty to keep current)' : '*'}
              </label>
              <input
                type="file"
                id="image"
                name="image"
                className="form-control"
                accept="image/*"
                onChange={handleInputChange}
                required
              />
              <small className="help-text">
                <FaUpload /> Upload a high-quality image of your product (JPG, PNG, max 5MB)
              </small>
            </div>

            <button 
              type="submit" 
              className={`btn-submit ${loading ? 'loading' : ''}`}
              disabled={loading}
            >
              {loading ? <FaSpinner className="spinning" /> : <FaCheckCircle />}
              <span>
                {loading 
                  ? (isEditMode ? "Updating Product..." : "Adding Product...") 
                  : (isEditMode ? "Update Product" : "Add Product")
                }
              </span>
            </button>
          </form>

          {/* Info */}
          <div className="product-info">
            <FaInfoCircle />
            <div>
              <h4>Product Guidelines</h4>
              <ul>
                <li>Ensure your product is eco-friendly and sustainable</li>
                <li>Use clear, high-quality images</li>
                <li>Write detailed descriptions highlighting environmental benefits</li>
                <li>Set competitive and fair pricing</li>
              </ul>
            </div>
          </div>
        </div>
        </div>
      )} {/* end sellerVerified === true */}

      {/* Loading state */}
      {sellerVerified === null && (
        <div className="add-product-container">
          <div className="add-product-content" style={{ textAlign: 'center', padding: '60px' }}>
            <p style={{ color: '#666' }}>Checking verification status...</p>
          </div>
        </div>
      )}


      <style jsx>{`
        .add-product-page {
          background-color: #f5f6fa;
          min-height: 100vh;
        }

        .add-product-banner {
          background: linear-gradient(135deg, #1B5E20 0%, #2E7D32 60%, #388E3C 100%);
          padding: 28px 0 32px;
        }

        .add-product-banner-inner {
          max-width: 700px;
          margin: 0 auto;
          padding: 0 20px;
          text-align: center;
        }

        .add-product-banner-inner h1 {
          margin: 0 0 6px;
          font-size: 1.9rem;
          font-weight: 800;
          color: #ffffff;
        }

        .add-product-banner-inner p {
          margin: 0;
          font-size: 1rem;
          color: rgba(255, 255, 255, 0.8);
        }

        .add-product-container {
          max-width: 700px;
          margin: 0 auto;
          padding: 28px 20px 48px;
        }

        .add-product-content {
          background-color: white;
          border-radius: 16px;
          padding: 36px 40px;
          box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
        }

        .alert {
          padding: 15px;
          border-radius: 12px;
          margin-bottom: 25px;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .alert.success {
          background-color: rgba(76, 175, 80, 0.1);
          border-left: 4px solid #4CAF50;
          color: #1B5E20;
        }

        .alert.error {
          background-color: rgba(244, 67, 54, 0.1);
          border-left: 4px solid #f44336;
          color: #f44336;
        }

        .add-product-form {
          margin-bottom: 30px;
        }

        .form-group {
          margin-bottom: 25px;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        .form-group label {
          display: block;
          margin-bottom: 8px;
          font-weight: 600;
          color: #333333;
          font-size: 0.95rem;
        }

        .form-control {
          width: 100%;
          padding: 14px 20px;
          border: 2px solid #e0e0e0;
          border-radius: 10px;
          font-size: 15px;
          transition: all 0.3s;
          background-color: #f9f9f9;
        }

        .form-control:focus {
          outline: none;
          border-color: #2E7D32;
          background-color: white;
          box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.1);
        }

        textarea.form-control {
          resize: vertical;
          min-height: 100px;
        }

        input[type="file"].form-control {
          padding: 10px;
          background-color: white;
          cursor: pointer;
        }

        input[type="file"].form-control::-webkit-file-upload-button {
          background-color: #2E7D32;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          margin-right: 10px;
          cursor: pointer;
        }

        .help-text {
          font-size: 0.85rem;
          color: #888;
          margin-top: 5px;
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .btn-submit {
          width: 100%;
          padding: 16px 32px;
          background-color: #2E7D32;
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          margin-top: 30px;
        }

        .btn-submit:hover:not(:disabled) {
          background-color: #1B5E20;
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(46, 125, 50, 0.3);
        }

        .btn-submit:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .spinning {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .product-info {
          background-color: rgba(76, 175, 80, 0.1);
          border-left: 4px solid #2E7D32;
          padding: 20px;
          border-radius: 12px;
          display: flex;
          gap: 15px;
          align-items: flex-start;
        }

        .product-info svg {
          color: #2E7D32;
          font-size: 20px;
          margin-top: 2px;
        }

        .product-info h4 {
          color: #1B5E20;
          margin-bottom: 10px;
          font-size: 1rem;
        }

        .product-info ul {
          margin: 0;
          padding-left: 20px;
        }

        .product-info li {
          color: #666666;
          font-size: 0.9rem;
          margin-bottom: 5px;
        }

        @media (max-width: 768px) {
          .add-product-banner-inner h1 {
            font-size: 1.5rem;
          }

          .add-product-container {
            padding: 20px 12px 40px;
          }

          .add-product-content {
            padding: 24px 20px;
          }

          .form-row {
            grid-template-columns: 1fr;
            gap: 0;
          }

          .product-info {
            flex-direction: column;
            gap: 10px;
          }
        }
      `}</style>
    </div>
  );
}