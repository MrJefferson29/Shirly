import React, { useState, useEffect } from 'react';
import { useAuthContext } from '../contexts';
import { notify } from '../utils/utils';
import { 
  HiOutlinePlus, 
  HiOutlineSearch, 
  HiOutlineFilter,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineEye,
  HiOutlineEyeOff,
  HiOutlineStar,
  HiOutlineClock,
  HiOutlineCheckCircle,
  HiOutlineXCircle
} from 'react-icons/hi';

const AdminProducts = () => {
  const { token, userInfo } = useAuthContext();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    brand: '',
    category: '',
    subcategory: '',
    gender: 'Unisex',
    weight: '',
    price: '',
    newPrice: '',
    quantity: '',
    images: '',
    features: '',
    tags: '',
    trending: false,
    isActive: true,
    specifications: {}
  });

  const [selectedImages, setSelectedImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);

  useEffect(() => {
    if (userInfo?.role !== 'admin') {
      notify('error', 'Access denied. Admin privileges required.');
      return;
    }
    fetchProducts();
  }, [userInfo]);

  // Filter and sort products
  useEffect(() => {
    let filtered = [...products];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (categoryFilter) {
      filtered = filtered.filter(product => product.category === categoryFilter);
    }

    // Status filter
    if (statusFilter) {
      filtered = filtered.filter(product => {
        if (statusFilter === 'active') return product.isActive;
        if (statusFilter === 'inactive') return !product.isActive;
        if (statusFilter === 'trending') return product.trending;
        return true;
      });
    }

    // Sort products
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'oldest':
          return new Date(a.createdAt) - new Date(b.createdAt);
        case 'name':
          return a.name.localeCompare(b.name);
        case 'priceHigh':
          return b.price - a.price;
        case 'priceLow':
          return a.price - b.price;
        case 'rating':
          return b.rating - a.rating;
        default:
          return 0;
      }
    });

    setFilteredProducts(filtered);
  }, [products, searchTerm, categoryFilter, statusFilter, sortBy]);

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || "https://shirlyblack.onrender.com/api"}/admin/products`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setProducts(data.data.products);
      } else {
        notify('error', 'Failed to fetch products');
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      notify('error', 'Error fetching products');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    
    // Validate file types
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const invalidFiles = files.filter(file => !validTypes.includes(file.type));
    
    if (invalidFiles.length > 0) {
      notify('error', 'Please select only image files (JPEG, PNG, WebP)');
        return;
      }

    // Validate file sizes (max 5MB per file)
    const maxSize = 5 * 1024 * 1024; // 5MB
    const oversizedFiles = files.filter(file => file.size > maxSize);
    
    if (oversizedFiles.length > 0) {
      notify('error', 'Image files must be smaller than 5MB');
      return;
    }
    
    // Validate total number of images (max 5)
    if (selectedImages.length + files.length > 5) {
      notify('error', 'Maximum 5 images allowed per product');
      return;
    }
    
    setSelectedImages(prev => [...prev, ...files]);
  };

  const handleImageRemove = (index) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate that at least one image is available (either existing or new)
    if (selectedImages.length === 0 && existingImages.length === 0) {
      notify('error', 'Please select at least one product image');
      return;
    }
    
    try {
      const formDataToSend = new FormData();
      
      // Add all form fields (excluding images which are handled separately)
      Object.keys(formData).forEach(key => {
        if (key === 'images') {
          // Skip images field - it's handled separately with selectedImages
          return;
        } else if (key === 'dimensions' || key === 'specifications') {
          formDataToSend.append(key, JSON.stringify(formData[key]));
        } else if (key === 'newPrice') {
          // Only add newPrice if it has a value, otherwise skip it
          if (formData[key] && formData[key].trim() !== '') {
            formDataToSend.append(key, parseFloat(formData[key]));
          }
        } else if (key === 'price' || key === 'quantity') {
          // Parse numeric fields
          formDataToSend.append(key, parseFloat(formData[key]));
        } else {
          formDataToSend.append(key, formData[key]);
        }
      });
      
      // Add images
      selectedImages.forEach((image, index) => {
        formDataToSend.append('images', image);
      });

      const url = editingProduct 
        ? `${process.env.REACT_APP_API_URL || "https://shirlyblack.onrender.com/api"}/admin/products/${editingProduct._id}`
        : `${process.env.REACT_APP_API_URL || "https://shirlyblack.onrender.com/api"}/admin/products`;
      
      const method = editingProduct ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend
      });

      if (response.ok) {
        notify('success', editingProduct ? 'Product updated successfully!' : 'Product created successfully!');
        setShowAddForm(false);
        setEditingProduct(null);
        resetForm();
        fetchProducts();
      } else {
        const errorData = await response.json();
        if (errorData.errors && Array.isArray(errorData.errors)) {
          // Handle validation errors
          const errorMessages = errorData.errors.map(err => err.msg || err.message).join(', ');
          notify('error', `Validation failed: ${errorMessages}`);
        } else {
          notify('error', errorData.message || 'Error saving product');
        }
      }
    } catch (error) {
      console.error('Submit error:', error);
      notify('error', 'Error saving product');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      brand: '',
      category: '',
      subcategory: '',
      gender: 'Unisex',
      weight: '',
      price: '',
      newPrice: '',
      quantity: '',
      images: '',
      features: '',
      tags: '',
      isActive: true,
      trending: false,
      specifications: {}
    });
    setSelectedImages([]);
    setExistingImages([]);
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setExistingImages(product.images || []);
    setSelectedImages([]);
    setFormData({
      name: product.name,
      description: product.description,
      brand: product.brand,
      category: product.category,
      subcategory: product.subcategory || '',
      gender: product.gender || 'Unisex',
      weight: product.weight || '',
      price: product.price.toString(),
      newPrice: product.newPrice?.toString() || '',
      quantity: product.quantity.toString(),
      images: product.images?.join(', ') || '',
      features: product.features?.join(', ') || '',
      tags: product.tags?.join(', ') || '',
      isActive: product.isActive !== undefined ? product.isActive : true,
      trending: product.trending || false,
      specifications: product.specifications || {}
    });
    setShowAddForm(true);
  };

  const handleDelete = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || "https://shirlyblack.onrender.com/api"}/admin/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        notify('success', 'Product deleted successfully!');
        fetchProducts();
      } else {
        notify('error', 'Error deleting product');
      }
    } catch (error) {
      console.error('Delete error:', error);
      notify('error', 'Error deleting product');
    }
  };

  const toggleProductStatus = async (productId, currentStatus) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || "https://shirlyblack.onrender.com/api"}/admin/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isActive: !currentStatus })
      });

      if (response.ok) {
        notify('success', `Product ${!currentStatus ? 'activated' : 'deactivated'} successfully!`);
        fetchProducts();
      } else {
        notify('error', 'Error updating product status');
      }
    } catch (error) {
      console.error('Toggle status error:', error);
      notify('error', 'Error updating product status');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <HiOutlineCheckCircle className="w-4 h-4" />;
      case 'inactive':
        return <HiOutlineXCircle className="w-4 h-4" />;
      case 'trending':
        return <HiOutlineStar className="w-4 h-4" />;
      default:
        return <HiOutlineClock className="w-4 h-4" />;
    }
  };

  const getStatusColor = (product) => {
    if (!product.isActive) return 'bg-red-100 text-red-800';
    if (product.trending) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  const clearFilters = () => {
    setSearchTerm('');
    setCategoryFilter('');
    setStatusFilter('');
    setSortBy('newest');
  };

  if (userInfo?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <HiOutlineXCircle className="mx-auto h-12 w-12 text-red-500" />
          <h1 className="text-2xl font-semibold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-600">You need admin privileges to access this page.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
          <div>
              <h1 className="text-4xl md:text-5xl font-light text-black mb-2">
                Product <span className="font-semibold">Management</span>
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                Manage your product inventory with ease
              </p>
          </div>
          <button
            onClick={() => {
              setShowAddForm(true);
              setEditingProduct(null);
                resetForm();
              }}
              className="flex items-center gap-2 bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors font-semibold"
            >
              <HiOutlinePlus className="w-5 h-5" />
            Add Product
          </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 card">
          <div className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <HiOutlineSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search products by name, brand, or category..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                  />
                </div>
              </div>

              {/* Filter Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <HiOutlineFilter className="w-5 h-5" />
                Filters
              </button>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="name">Name A-Z</option>
                <option value="priceHigh">Price: High to Low</option>
                <option value="priceLow">Price: Low to High</option>
                <option value="rating">Rating</option>
              </select>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Category Filter */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                    <select
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                    >
                      <option value="">All Categories</option>
                      <option value="sunglasses">Sunglasses</option>
                      <option value="eyeglasses">Eyeglasses</option>
                      <option value="sports">Sports</option>
                      <option value="vision">Vision</option>
                    </select>
                  </div>

                  {/* Status Filter */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                    >
                      <option value="">All Status</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="trending">Trending</option>
                    </select>
                  </div>
                </div>

                {/* Clear Filters */}
                <div className="mt-6 flex justify-end">
                  <button
                    onClick={clearFilters}
                    className="px-4 py-2 text-sm text-gray-600 hover:text-black transition-colors"
                  >
                    Clear All Filters
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Add/Edit Product Form */}
        {showAddForm && (
          <div className="mb-8 card">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-semibold text-black">
                    {editingProduct ? 'Edit Product' : 'Add New Product'}
                  </h2>
                  <p className="text-gray-600 mt-1">
                    {editingProduct ? 'Update product information' : 'Fill in the details below to add a new product'}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingProduct(null);
                    resetForm();
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <HiOutlineXCircle className="w-6 h-6 text-gray-600" />
                </button>
            </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Product Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Brand</label>
                    <input
                      type="text"
                      name="brand"
                      value={formData.brand}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                    />
                  </div>

                {/* Category and Pricing */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                    >
                      <option value="">Select Category</option>
                      <option value="accessories">Accessories</option>
                      <option value="automotive">Automotive</option>
                      <option value="baby-care">Baby Care</option>
                      <option value="bath-body">Bath & Body</option>
                      <option value="books">Books</option>
                      <option value="clothing">Clothing</option>
                      <option value="cosmetics">Cosmetics</option>
                      <option value="dental-care">Dental Care</option>
                      <option value="electronics">Electronics</option>
                      <option value="eyeglasses">Eyeglasses</option>
                      <option value="fitness">Fitness</option>
                      <option value="food-beverages">Food & Beverages</option>
                      <option value="fragrance">Fragrance</option>
                      <option value="hair-care">Hair Care</option>
                      <option value="healthcare">Healthcare</option>
                      <option value="home-garden">Home & Garden</option>
                      <option value="hygiene">Hygiene</option>
                      <option value="jewelry">Jewelry</option>
                      <option value="kitchen">Kitchen</option>
                      <option value="laundry">Laundry</option>
                      <option value="makeup">Makeup</option>
                      <option value="medical">Medical</option>
                      <option value="mens-grooming">Men's Grooming</option>
                      <option value="nutrition">Nutrition</option>
                      <option value="oral-care">Oral Care</option>
                      <option value="personal-care">Personal Care</option>
                      <option value="pet-care">Pet Care</option>
                      <option value="pharmaceuticals">Pharmaceuticals</option>
                      <option value="shoes">Shoes</option>
                      <option value="skin-care">Skin Care</option>
                      <option value="soap">Soap</option>
                      <option value="sports">Sports</option>
                      <option value="sunglasses">Sunglasses</option>
                      <option value="supplements">Supplements</option>
                      <option value="tools">Tools</option>
                      <option value="toys">Toys</option>
                      <option value="travel">Travel</option>
                      <option value="vision">Vision</option>
                      <option value="vitamins">Vitamins</option>
                      <option value="wellness">Wellness</option>
                      <option value="womens-care">Women's Care</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Price ($)</label>
                      <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleInputChange}
                        required
                      min="0"
                      step="0.01"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                      />
                    </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Sale Price ($) <span className="text-gray-500 font-normal">(Optional)</span></label>
                      <input
                        type="number"
                        name="newPrice"
                        value={formData.newPrice}
                        onChange={handleInputChange}
                      min="0"
                      step="0.01"
                      placeholder="Leave empty if no sale price"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                      />
                    </div>
                  </div>

                {/* Quantity and Status */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Quantity</label>
                    <input
                      type="number"
                      name="quantity"
                      value={formData.quantity}
                      onChange={handleInputChange}
                      required
                      min="0"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                    />
                  </div>
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="trending"
                        checked={formData.trending}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black"
                      />
                      <span className="ml-2 text-sm font-semibold text-gray-700">Trending Product</span>
                    </label>
                </div>
              </div>

              {/* Image Upload Section */}
                <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Product Images <span className="text-red-500">*</span>
                  </label>
                  <p className="text-sm text-gray-600 mb-4">
                    Upload up to 5 images (JPEG, PNG, WebP). Maximum 5MB per image.
                  </p>
                  
                  {/* File Input */}
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                    <input
                      type="file"
                      multiple
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="image-upload"
                    />
                    <label
                      htmlFor="image-upload"
                      className="cursor-pointer flex flex-col items-center"
                    >
                      <HiOutlinePlus className="w-8 h-8 text-gray-400 mb-2" />
                      <span className="text-sm font-medium text-gray-700">
                        Click to upload images
                      </span>
                      <span className="text-xs text-gray-500 mt-1">
                        or drag and drop
                      </span>
                    </label>
                        </div>
                      </div>

                {/* Existing Images (Edit Mode) */}
                {editingProduct && existingImages.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">
                      Current Images ({existingImages.length})
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                      {existingImages.map((imageUrl, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={imageUrl}
                            alt={`Current ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg border border-gray-200"
                          />
                          <div className="absolute bottom-0 left-0 right-0 bg-blue-600 bg-opacity-75 text-white text-xs p-1 rounded-b-lg text-center">
                            Current Image
                  </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                  
                {/* New Image Preview */}
                  {selectedImages.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">
                      New Images ({selectedImages.length}/5)
                    </h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        {selectedImages.map((image, index) => (
                          <div key={index} className="relative group">
                              <img
                                src={URL.createObjectURL(image)}
                                alt={`Preview ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg border border-gray-200"
                              />
                            <button
                              type="button"
                            onClick={() => handleImageRemove(index)}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                            >
                            <HiOutlineXCircle className="w-4 h-4" />
                            </button>
                          <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 rounded-b-lg">
                            {image.name.length > 15 
                              ? `${image.name.substring(0, 15)}...` 
                              : image.name
                            }
                          </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
              </div>

              {/* Additional Product Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Subcategory</label>
                    <input
                      type="text"
                    name="subcategory"
                    value={formData.subcategory}
                      onChange={handleInputChange}
                    placeholder="e.g., Aviator, Wayfarer, Sports"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                    />
                  </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Gender</label>
                  <select
                    name="gender"
                    value={formData.gender}
                      onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                  >
                    <option value="Unisex">Unisex</option>
                    <option value="Men">Men</option>
                    <option value="Women">Women</option>
                    <option value="Kids">Kids</option>
                  </select>
                  </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Weight</label>
                    <input
                      type="text"
                    name="weight"
                    value={formData.weight}
                      onChange={handleInputChange}
                    placeholder="e.g., 25g, 1.2oz"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                    />
                  </div>
                <div className="flex items-center space-x-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black"
                    />
                    <span className="ml-2 text-sm font-semibold text-gray-700">Active Product</span>
                  </label>
                </div>
              </div>

              {/* Features and Tags */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Features</label>
                  <textarea
                    name="features"
                    value={formData.features}
                    onChange={handleInputChange}
                    placeholder="Enter features separated by commas (e.g., UV Protection, Polarized, Anti-glare)"
                    rows="3"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">Separate multiple features with commas</p>
                    </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Tags</label>
                  <textarea
                    name="tags"
                    value={formData.tags}
                        onChange={handleInputChange}
                    placeholder="Enter tags separated by commas (e.g., summer, casual, luxury, vintage)"
                    rows="3"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                      />
                  <p className="text-xs text-gray-500 mt-1">Separate multiple tags with commas</p>
                </div>
              </div>


              {/* Form Actions */}
              <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingProduct(null);
                      resetForm();
                  }}
                    className="px-8 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                    className="px-8 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-semibold"
                >
                    {editingProduct ? 'Update Product' : 'Add Product'}
                </button>
              </div>
            </form>
            </div>
          </div>
        )}

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16">
            <HiOutlineEye className="mx-auto h-16 w-16 text-gray-400" />
            <h3 className="mt-4 text-xl font-semibold text-black">
              {products.length === 0 ? 'No products found' : 'No products match your filters'}
            </h3>
            <p className="mt-2 text-lg text-gray-600 leading-relaxed">
              {products.length === 0 
                ? 'Get started by adding your first product.'
                : 'Try adjusting your search or filter criteria.'
              }
            </p>
            {products.length === 0 && (
              <button
                onClick={() => {
                  setShowAddForm(true);
                  setEditingProduct(null);
                  resetForm();
                }}
                className="mt-6 bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors font-semibold"
              >
                Add Your First Product
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <div key={product._id} className="card p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-black mb-1">{product.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">{product.brand}</p>
                    <div className="flex items-center gap-2">
                      <span className={`flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(product)}`}>
                        {getStatusIcon(product.isActive ? 'active' : 'inactive')}
                        {product.isActive ? 'Active' : 'Inactive'}
                      </span>
                      {product.trending && (
                        <span className="flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                          <HiOutlineStar className="w-3 h-3" />
                          Trending
                        </span>
                      )}
                        </div>
                        </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => toggleProductStatus(product._id, product.isActive)}
                      className={`p-2 rounded-lg transition-colors ${
                        product.isActive 
                          ? 'text-green-600 hover:bg-green-50' 
                          : 'text-red-600 hover:bg-red-50'
                      }`}
                      title={product.isActive ? 'Deactivate' : 'Activate'}
                    >
                      {product.isActive ? <HiOutlineEye className="w-4 h-4" /> : <HiOutlineEyeOff className="w-4 h-4" />}
                    </button>
                      </div>
                      </div>

                {product.images && product.images.length > 0 && (
                  <div className="mb-4">
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-32 object-cover rounded-lg border border-gray-200"
                    />
                  </div>
                )}

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Category:</span>
                    <span className="font-medium text-black capitalize">{product.category}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Price:</span>
                    <span className="font-medium text-black">${product.price}</span>
                  </div>
                        {product.newPrice && product.newPrice < product.price && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Sale Price:</span>
                      <span className="font-medium text-green-600">${product.newPrice}</span>
                    </div>
                        )}
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Stock:</span>
                    <span className="font-medium text-black">{product.quantity}</span>
                      </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Rating:</span>
                    <span className="font-medium text-black">{product.rating || 0}/5</span>
                  </div>
                      </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEdit(product)}
                      className="flex items-center gap-1 px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                      <HiOutlinePencil className="w-4 h-4" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(product._id)}
                      className="flex items-center gap-1 px-3 py-2 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                      >
                      <HiOutlineTrash className="w-4 h-4" />
                        Delete
                      </button>
          </div>
                  <span className="text-xs text-gray-500">
                    {new Date(product.createdAt).toLocaleDateString()}
                  </span>
        </div>
        </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminProducts;
