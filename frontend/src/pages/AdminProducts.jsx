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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formDataToSend = new FormData();
      
      // Add all form fields
      Object.keys(formData).forEach(key => {
        if (key === 'dimensions' || key === 'specifications') {
          formDataToSend.append(key, JSON.stringify(formData[key]));
        } else if (key === 'newPrice') {
          // Only add newPrice if it has a value, otherwise skip it
          if (formData[key] && formData[key].trim() !== '') {
            formDataToSend.append(key, formData[key]);
          }
        } else {
          formDataToSend.append(key, formData[key]);
        }
      });

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
        notify('error', 'Error saving product');
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
      dimensions: { length: '', width: '', height: '', unit: 'cm' },
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
    setSelectedImages([]);
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      brand: product.brand,
      category: product.category,
      subcategory: product.subcategory || '',
      gender: product.gender || 'Unisex',
      weight: product.weight || '',
      dimensions: {
        length: product.dimensions?.length || '',
        width: product.dimensions?.width || '',
        height: product.dimensions?.height || '',
        unit: product.dimensions?.unit || 'cm'
      },
      price: product.price.toString(),
      newPrice: product.newPrice?.toString() || '',
      quantity: product.quantity.toString(),
      images: product.images?.join(', ') || '',
      features: product.features?.join(', ') || '',
      tags: product.tags?.join(', ') || '',
      condition: product.condition || 'New',
      trending: product.trending || false,
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
        notify('error', 'Error deleting product');
      }
    } catch (error) {
      console.error('Delete error:', error);
      notify('error', 'Error deleting product');
    }
  };

  const toggleProductStatus = async (productId, currentStatus) => {
    try {
      const response = await fetch(`http://localhost:5000/api/admin/products/${productId}`, {
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
                      <option value="sunglasses">Sunglasses</option>
                      <option value="eyeglasses">Eyeglasses</option>
                      <option value="sports">Sports</option>
                      <option value="vision">Vision</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Price (₹)</label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      required
                      min="0"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Sale Price (₹) <span className="text-gray-500 font-normal">(Optional)</span></label>
                    <input
                      type="number"
                      name="newPrice"
                      value={formData.newPrice}
                      onChange={handleInputChange}
                      min="0"
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
                    <span className="font-medium text-black">₹{product.price}</span>
                  </div>
                  {product.newPrice && product.newPrice < product.price && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Sale Price:</span>
                      <span className="font-medium text-green-600">₹{product.newPrice}</span>
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