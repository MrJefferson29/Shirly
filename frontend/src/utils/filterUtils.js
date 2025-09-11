export const sortByPrice = (type, data) => {
  if (type == "low_to_high") {
    return [...data].sort((a, b) => a.newPrice - b.newPrice);
  } else if (type === "high_to_low") {
    return [...data].sort((a, b) => b.newPrice - a.newPrice);
  }
  return data;
};

export const filterByGender = (selectedGender, data) => {
  if (!selectedGender || selectedGender.toLowerCase() === "all") {
    return data;
  } else {
    return data.filter(
      ({ gender }) => gender.toLowerCase() === selectedGender.toLowerCase()
    );
  }
};

export const filterByPriceRange = (selectedRange, data) => {
  return selectedRange
    ? data.filter(({ newPrice }) => newPrice <= selectedRange)
    : data;
};

export const filterByRating = (selectedRating, data) => {
  return data.filter(({ rating }) => rating >= selectedRating);
};

export const filterByCheckbox = (selectedCategories, data) => {
  return selectedCategories.length
    ? data.filter(({ category }) =>
        selectedCategories.includes(category.toLowerCase())
      )
    : data;
};

export const filterBySearch = (searchText, data) => {
  if (!searchText) return data;
  
  const searchLowerCased = searchText.toLowerCase();
  console.log('🔍 Filtering by search:', searchLowerCased, 'Total products:', data.length);
  
  // Handle special category filters
  switch (searchLowerCased) {
    case 'featured':
      // Featured products: high rating (>= 4.0) and trending
      const featuredProducts = data.filter(product => 
        product.rating >= 4.0 && product.trending === true
      );
      console.log('⭐ Featured products found:', featuredProducts.length);
      return featuredProducts;
    
    case 'new':
      // New arrivals: created within last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const newProducts = data.filter(product => {
        if (!product.createdAt) return false;
        return new Date(product.createdAt) >= thirtyDaysAgo;
      });
      console.log('🆕 New products found:', newProducts.length);
      return newProducts;
    
    case 'sale':
      // Sale items: products with newPrice < price (discounted)
      const saleProducts = data.filter(product => 
        product.newPrice && 
        product.price && 
        product.newPrice < product.price
      );
      console.log('💰 Sale products found:', saleProducts.length);
      return saleProducts;
    
    case 'trending':
      // Trending products
      const trendingProducts = data.filter(product => product.trending === true);
      console.log('🔥 Trending products found:', trendingProducts.length);
      return trendingProducts;
    
    default:
      // Regular search by name, brand, or category
      const searchResults = data.filter(({ name, brand, category }) => 
        (name && name.toLowerCase().includes(searchLowerCased)) ||
        (brand && brand.toLowerCase().includes(searchLowerCased)) ||
        (category && category.toLowerCase().includes(searchLowerCased))
      );
      console.log('🔎 Search results found:', searchResults.length);
      return searchResults;
  }
};
