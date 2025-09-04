import React, { useState, useEffect } from 'react';
import { useAuthContext } from '../contexts';
import { notify } from '../utils/utils';

const AdminProducts = () => {
  const { token, userInfo } = useAuthContext();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    brand: '',
    category: '',
    subcategory: '',
    gender: 'Unisex',
    weight: '',
    dimensions: {
      length: '',
      width: '',
      height: '',
      unit: 'cm'
    },
    price: '',
    newPrice: '',
    quantity: '',
    images: '',
    features: '',
    tags: '',
    condition: 'New',
    trending: false,
    specifications: {}
  });

  const [selectedImages, setSelectedImages] = useState([]);

  // Handle image selection
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 5) {
      notify('error', 'Maximum 5 images allowed');
      return;
    }
    setSelectedImages(files);
  };

  // Remove selected image
  const removeImage = (index) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  useEffect(() => {
    if (userInfo?.role !== 'admin') {
      notify('error', 'Access denied. Admin privileges required.');
      return;
    }
    fetchProducts();
  }, [userInfo]);

  const fetchProducts = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/products', {
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
      console.error('Products error:', error);
      notify('error', 'Error loading products');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('dimensions.')) {
      const dimField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        dimensions: {
          ...prev.dimensions,
          [dimField]: value
        }
      }));
    } else if (name.startsWith('specifications.')) {
      const specField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        specifications: {
          ...prev.specifications,
          [specField]: type === 'checkbox' ? checked : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Validate newPrice before submission
      const originalPrice = parseFloat(formData.price);
      const salePrice = formData.newPrice ? parseFloat(formData.newPrice) : originalPrice;
      
      if (salePrice > originalPrice) {
        notify('error', 'Sale price cannot be higher than original price');
        return;
      }

      // Create FormData for file upload
      const formDataToSend = new FormData();
      
      // Add all form fields
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('brand', formData.brand);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('subcategory', formData.subcategory);
      formDataToSend.append('gender', formData.gender);
      formDataToSend.append('weight', formData.weight);
      formDataToSend.append('price', originalPrice);
      formDataToSend.append('newPrice', salePrice);
      formDataToSend.append('quantity', parseInt(formData.quantity));
      formDataToSend.append('condition', formData.condition);
      formDataToSend.append('trending', formData.trending);
      
      // Add dimensions
      if (formData.dimensions.length) formDataToSend.append('dimensions[length]', formData.dimensions.length);
      if (formData.dimensions.width) formDataToSend.append('dimensions[width]', formData.dimensions.width);
      if (formData.dimensions.height) formDataToSend.append('dimensions[height]', formData.dimensions.height);
      formDataToSend.append('dimensions[unit]', formData.dimensions.unit);
      
      // Add features and tags as arrays
      if (formData.features) {
        const features = formData.features.split(',').map(feature => feature.trim()).filter(feature => feature);
        features.forEach(feature => formDataToSend.append('features[]', feature));
      }
      
      if (formData.tags) {
        const tags = formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
        tags.forEach(tag => formDataToSend.append('tags[]', tag));
      }
      
      // Add images
      selectedImages.forEach((image, index) => {
        formDataToSend.append('images', image);
      });

      const url = editingProduct 
        ? `http://localhost:5000/api/admin/products/${editingProduct._id}`
        : 'http://localhost:5000/api/admin/products';
      
      const method = editingProduct ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`
          // Don't set Content-Type for FormData, let browser set it with boundary
        },
        body: formDataToSend
      });

      if (response.ok) {
        notify('success', editingProduct ? 'Product updated successfully!' : 'Product created successfully!');
        setShowAddForm(false);
        setEditingProduct(null);
        setFormData({
          name: '', description: '', brand: '', category: '', subcategory: '', gender: 'Unisex',
          weight: '', price: '', newPrice: '', quantity: '', images: '', features: '', tags: '',
          condition: 'New', trending: false,
          dimensions: { length: '', width: '', height: '', unit: 'cm' },
          specifications: {}
        });
        setSelectedImages([]);
        fetchProducts();
      } else {
        const error = await response.json();
        notify('error', error.message || 'Failed to save product');
      }
    } catch (error) {
      console.error('Submit error:', error);
      notify('error', 'Error saving product');
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      brand: product.brand,
      category: product.category,
      gender: product.gender,
      weight: product.weight,
      price: product.price.toString(),
      newPrice: product.newPrice?.toString() || '',
      quantity: product.quantity.toString(),
      images: product.images.join(', '),
      features: product.features.join(', '),
      specifications: {
        frameMaterial: product.specifications?.frameMaterial || '',
        lensMaterial: product.specifications?.lensMaterial || '',
        lensColor: product.specifications?.lensColor || '',
        frameColor: product.specifications?.frameColor || '',
        lensWidth: product.specifications?.lensWidth || '',
        bridgeWidth: product.specifications?.bridgeWidth || '',
        templeLength: product.specifications?.templeLength || '',
        polarized: product.specifications?.polarized || false
      }
    });
    setShowAddForm(true);
  };

  const handleDelete = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;

    try {
      const response = await fetch(`http://localhost:5000/api/admin/products/${productId}`, {
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
        notify('error', 'Failed to delete product');
      }
    } catch (error) {
      console.error('Delete error:', error);
      notify('error', 'Error deleting product');
    }
  };

  if (userInfo?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-600">You need admin privileges to access this page.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-yellow-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Product Management</h1>
            <p className="mt-2 text-gray-600">Manage your product inventory</p>
          </div>
          <button
            onClick={() => {
              setShowAddForm(true);
              setEditingProduct(null);
              setFormData({
                name: '', description: '', brand: '', category: '', subcategory: '', gender: 'Unisex',
                weight: '', price: '', newPrice: '', quantity: '', images: '', features: '', tags: '',
                condition: 'New', trending: false,
                dimensions: { length: '', width: '', height: '', unit: 'cm' },
                specifications: {}
              });
              setSelectedImages([]);
            }}
            className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors"
          >
            Add Product
          </button>
        </div>

        {/* Add/Edit Product Form */}
        {showAddForm && (
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden mb-8">
            {/* Form Header */}
            <div className="bg-gradient-to-r from-yellow-500 to-orange-500 px-8 py-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    {editingProduct ? '✏️ Edit Product' : '➕ Add New Product'}
                  </h2>
                  <p className="text-yellow-100 mt-1">
                    {editingProduct ? 'Update product information' : 'Create a new product listing'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingProduct(null);
                  }}
                  className="text-white hover:text-yellow-200 transition-colors p-2"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-8" encType="multipart/form-data">
              {/* Basic Information Section */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
                  <span className="bg-blue-100 text-blue-600 rounded-full p-2 mr-3">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </span>
                  Basic Information
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Product Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter product name"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-yellow-500 focus:ring-4 focus:ring-yellow-100 transition-all duration-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Brand <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="brand"
                      value={formData.brand}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter brand name"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-yellow-500 focus:ring-4 focus:ring-yellow-100 transition-all duration-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-yellow-500 focus:ring-4 focus:ring-yellow-100 transition-all duration-200 bg-white"
                    >
                      <option value="">Select Category</option>
                      <option value="Electronics">Electronics</option>
                      <option value="Clothing">Clothing</option>
                      <option value="Home">Home & Garden</option>
                      <option value="Sports">Sports & Fitness</option>
                      <option value="Books">Books</option>
                      <option value="Beauty">Beauty & Health</option>
                      <option value="Toys">Toys & Games</option>
                      <option value="Automotive">Automotive</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Subcategory</label>
                    <input
                      type="text"
                      name="subcategory"
                      value={formData.subcategory}
                      onChange={handleInputChange}
                      placeholder="e.g., Audio, Footwear, Kitchen"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-yellow-500 focus:ring-4 focus:ring-yellow-100 transition-all duration-200"
                    />
                  </div>
                </div>
              </div>

              {/* Pricing Section */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
                  <span className="bg-green-100 text-green-600 rounded-full p-2 mr-3">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </span>
                  Pricing & Inventory
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Original Price <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                      <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleInputChange}
                        required
                        placeholder="0.00"
                        className="w-full pl-8 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-yellow-500 focus:ring-4 focus:ring-yellow-100 transition-all duration-200"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Sale Price</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                      <input
                        type="number"
                        name="newPrice"
                        value={formData.newPrice}
                        onChange={handleInputChange}
                        max={formData.price || ''}
                        placeholder="Leave empty for no sale"
                        className="w-full pl-8 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-yellow-500 focus:ring-4 focus:ring-yellow-100 transition-all duration-200"
                      />
                    </div>
                    {formData.newPrice && formData.price && parseFloat(formData.newPrice) > parseFloat(formData.price) && (
                      <p className="text-red-500 text-sm mt-1 flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        Sale price cannot be higher than original price
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Stock Quantity <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="quantity"
                      value={formData.quantity}
                      onChange={handleInputChange}
                      required
                      placeholder="0"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-yellow-500 focus:ring-4 focus:ring-yellow-100 transition-all duration-200"
                    />
                  </div>
                </div>
              </div>

              {/* Product Details Section */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
                  <span className="bg-purple-100 text-purple-600 rounded-full p-2 mr-3">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </span>
                  Product Details
                </h3>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      required
                      rows={4}
                      placeholder="Describe your product in detail..."
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-yellow-500 focus:ring-4 focus:ring-yellow-100 transition-all duration-200 resize-none"
                    />
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">Gender</label>
                      <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-yellow-500 focus:ring-4 focus:ring-yellow-100 transition-all duration-200 bg-white"
                      >
                        <option value="">Not Specified</option>
                        <option value="Men">Men</option>
                        <option value="Women">Women</option>
                        <option value="Unisex">Unisex</option>
                        <option value="Kids">Kids</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">Condition</label>
                      <select
                        name="condition"
                        value={formData.condition}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-yellow-500 focus:ring-4 focus:ring-yellow-100 transition-all duration-200 bg-white"
                      >
                        <option value="New">New</option>
                        <option value="Used">Used</option>
                        <option value="Refurbished">Refurbished</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">Weight</label>
                      <input
                        type="text"
                        name="weight"
                        value={formData.weight}
                        onChange={handleInputChange}
                        placeholder="e.g., 250g, 1.5kg"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-yellow-500 focus:ring-4 focus:ring-yellow-100 transition-all duration-200"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Images Section */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
                  <span className="bg-pink-100 text-pink-600 rounded-full p-2 mr-3">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </span>
                  Product Images
                </h3>
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-yellow-400 transition-colors duration-200">
                    <input
                      type="file"
                      name="images"
                      onChange={handleImageChange}
                      multiple
                      accept="image/*"
                      className="hidden"
                      id="image-upload"
                    />
                    <label htmlFor="image-upload" className="cursor-pointer">
                      <div className="flex flex-col items-center">
                        <svg className="w-12 h-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <p className="text-lg font-medium text-gray-700 mb-2">Upload Product Images</p>
                        <p className="text-sm text-gray-500 mb-4">Drag and drop or click to select up to 5 images</p>
                        <div className="bg-yellow-500 text-white px-6 py-2 rounded-lg hover:bg-yellow-600 transition-colors duration-200">
                          Choose Files
                        </div>
                      </div>
                    </label>
                  </div>
                  
                  {/* Display selected images */}
                  {selectedImages.length > 0 && (
                    <div className="mt-6">
                      <p className="text-sm font-semibold text-gray-700 mb-4">Selected Images ({selectedImages.length}/5):</p>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        {selectedImages.map((image, index) => (
                          <div key={index} className="relative group">
                            <div className="aspect-square rounded-xl overflow-hidden border-2 border-gray-200">
                              <img
                                src={URL.createObjectURL(image)}
                                alt={`Preview ${index + 1}`}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600 transition-colors duration-200 opacity-0 group-hover:opacity-100"
                            >
                              ×
                            </button>
                            <p className="text-xs text-gray-500 mt-2 truncate text-center">{image.name}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Features & Tags Section */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
                  <span className="bg-indigo-100 text-indigo-600 rounded-full p-2 mr-3">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                  </span>
                  Features & Tags
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Features</label>
                    <input
                      type="text"
                      name="features"
                      value={formData.features}
                      onChange={handleInputChange}
                      placeholder="Wireless, Noise Cancellation, Long Battery Life"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-yellow-500 focus:ring-4 focus:ring-yellow-100 transition-all duration-200"
                    />
                    <p className="text-xs text-gray-500">Separate features with commas</p>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Tags</label>
                    <input
                      type="text"
                      name="tags"
                      value={formData.tags}
                      onChange={handleInputChange}
                      placeholder="wireless, bluetooth, audio, headphones"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-yellow-500 focus:ring-4 focus:ring-yellow-100 transition-all duration-200"
                    />
                    <p className="text-xs text-gray-500">Separate tags with commas</p>
                  </div>
                </div>
              </div>

              {/* Dimensions Section */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
                  <span className="bg-teal-100 text-teal-600 rounded-full p-2 mr-3">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                    </svg>
                  </span>
                  Dimensions
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Length</label>
                    <input
                      type="text"
                      name="dimensions.length"
                      value={formData.dimensions.length}
                      onChange={handleInputChange}
                      placeholder="20"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-yellow-500 focus:ring-4 focus:ring-yellow-100 transition-all duration-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Width</label>
                    <input
                      type="text"
                      name="dimensions.width"
                      value={formData.dimensions.width}
                      onChange={handleInputChange}
                      placeholder="18"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-yellow-500 focus:ring-4 focus:ring-yellow-100 transition-all duration-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Height</label>
                    <input
                      type="text"
                      name="dimensions.height"
                      value={formData.dimensions.height}
                      onChange={handleInputChange}
                      placeholder="8"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-yellow-500 focus:ring-4 focus:ring-yellow-100 transition-all duration-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Unit</label>
                    <select
                      name="dimensions.unit"
                      value={formData.dimensions.unit}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-yellow-500 focus:ring-4 focus:ring-yellow-100 transition-all duration-200 bg-white"
                    >
                      <option value="cm">cm</option>
                      <option value="in">inches</option>
                      <option value="mm">mm</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Trending Toggle */}
              <div className="mb-8">
                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-800">Featured Product</h4>
                      <p className="text-sm text-gray-600 mt-1">Mark this product as trending to display it on the homepage</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        name="trending"
                        checked={formData.trending}
                        onChange={handleInputChange}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-yellow-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-500"></div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingProduct(null);
                  }}
                  className="px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-8 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-xl hover:from-yellow-600 hover:to-orange-600 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  {editingProduct ? '🔄 Update Product' : '✨ Add Product'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Products List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Products ({products.length})</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.map((product) => (
                  <tr key={product._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <img className="h-10 w-10 rounded-lg object-cover" src={product.images[0]} alt={product.name} />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{product.name}</div>
                          <div className="text-sm text-gray-500">{product.brand}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.category}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>
                        <span className="text-lg font-semibold">${product.newPrice || product.price}</span>
                        {product.newPrice && product.newPrice < product.price && (
                          <span className="ml-2 text-sm text-gray-500 line-through">${product.price}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.quantity}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleEdit(product)}
                        className="text-yellow-600 hover:text-yellow-900"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(product._id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProducts;
