import { BiFilter } from "react-icons/bi";
import { MdKeyboardArrowUp } from "react-icons/md";

import bannerImg from "../assets/bannerHero.jpg";
import loadingGif from "../assets/loading.gif";

import { Filters, SingleProduct, SortBy } from "../components";

import { useProductsContext } from "../contexts";
import { useEffect, useState } from "react";
import { useFilter } from "../hooks/filtersHook";
import { useLocation } from "react-router";

const ProductListing = () => {
  const location = useLocation();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [showScrollArrow, setShowScrollArrow] = useState(false);

  const { loading, applyFilters, clearFilters } = useProductsContext();
  const productsList = useFilter();
  
  // Helper function to get URL search parameters
  const getSearchParam = (param) => {
    const urlParams = new URLSearchParams(location.search);
    return urlParams.get(param);
  };
  
  // Handle URL parameters for special categories
  useEffect(() => {
    const category = getSearchParam('category');
    
    if (category) {
      console.log('🔍 Category filter applied:', category);
      // Clear existing filters first
      clearFilters();
      
      // Apply special category filters
      switch (category) {
        case 'featured':
          // Featured products (high rating + trending)
          console.log('⭐ Applying featured filter');
          applyFilters('searchText', 'featured');
          break;
        case 'new':
          // New arrivals (created within last 30 days)
          console.log('🆕 Applying new arrivals filter');
          applyFilters('searchText', 'new');
          break;
        case 'sale':
          // Sale items (products with newPrice < price)
          console.log('💰 Applying sale filter');
          applyFilters('searchText', 'sale');
          break;
        case 'trending':
          // Trending products
          console.log('🔥 Applying trending filter');
          applyFilters('searchText', 'trending');
          break;
        default:
          // Regular category filter
          console.log('📂 Applying regular category filter:', category);
          applyFilters('categories', [category]);
          break;
      }
    }
  }, [location.search, applyFilters, clearFilters]);

  useEffect(() => {
    if (location?.state?.from === "category") {
      setIsFilterOpen(true);
    }
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };
  useEffect(() => {
    const toggleShowArrow = () => {
      if (window.scrollY > 300) {
        setShowScrollArrow(true);
      } else {
        setShowScrollArrow(false);
      }
    };
    window.addEventListener("scroll", toggleShowArrow);

    return () => {
      window.removeEventListener("scroll", toggleShowArrow);
    };
  }, []);

  return (
    <>
      {loading ? (
        <div className="h-[70vh] w-full flex items-center justify-center overflow-hidden ">
          <span>
            <img width={250} src={loadingGif} alt="loading..." />
          </span>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <header className="mb-8">
            <img
              src={bannerImg}
              alt="bannerImg"
              className="rounded-lg h-full min-h-[12rem] object-cover w-full"
            />
          </header>
          
          <section className="py-6 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
            <h1 className="text-3xl md:text-4xl font-bold text-black">
              {(() => {
                const category = getSearchParam('category');
                switch (category) {
                  case 'featured': return 'Featured Products';
                  case 'new': return 'New Arrivals';
                  case 'sale': return 'Sale Items';
                  case 'trending': return 'Trending Now';
                  default: return 'Products for You!';
                }
              })()}
            </h1>
            <div className="flex items-center gap-3">
              <Filters
                isFilterOpen={isFilterOpen}
                setIsFilterOpen={setIsFilterOpen}
              />
              <SortBy />
              <button
                className={`flex py-2 px-4 rounded-lg shadow-sm items-center gap-2 hover:bg-black hover:text-white hover:shadow-md transition-all duration-200 ${
                  isFilterOpen ? "bg-black text-white" : "bg-gray-100 text-gray-700"
                }`}
                onClick={() => setIsFilterOpen(!isFilterOpen)}
              >
                <BiFilter className="text-lg" />
                <span className="text-sm font-medium">Filters</span>
              </button>
            </div>
          </section>

          {/* Category Description */}
          {(() => {
            const category = getSearchParam('category');
            if (category) {
              const descriptions = {
                featured: 'Discover our handpicked selection of premium products with outstanding ratings and trending popularity.',
                new: 'Explore the latest additions to our collection, fresh arrivals from the past 30 days.',
                sale: 'Find amazing deals on discounted products with special pricing.',
                trending: 'Shop the most popular and trending products that everyone is loving right now.'
              };
              
              return (
                <div className="mb-6">
                  <p className="text-gray-600 text-lg max-w-3xl">
                    {descriptions[category] || ''}
                  </p>
                </div>
              );
            }
            return null;
          })()}


          {productsList.length > 0 ? (
            <main className="relative grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 pb-12">
              {productsList.map((glass) => (
                <SingleProduct key={glass.id} product={glass} />
              ))}
            </main>
          ) : (
            <div className="text-center py-20">
              <p className="text-2xl md:text-3xl font-bold text-gray-400 mb-4">
                {(() => {
                  const category = getSearchParam('category');
                  switch (category) {
                    case 'featured': return 'No Featured Products Found';
                    case 'new': return 'No New Arrivals';
                    case 'sale': return 'No Sale Items Available';
                    case 'trending': return 'No Trending Products';
                    default: return 'Nothing to Show!';
                  }
                })()}
              </p>
              <p className="text-gray-500">
                {(() => {
                  const category = getSearchParam('category');
                  switch (category) {
                    case 'featured': return 'Check back soon for featured products with high ratings.';
                    case 'new': return 'New products are added regularly. Check back soon!';
                    case 'sale': return 'No discounted items available at the moment.';
                    case 'trending': return 'No trending products at the moment.';
                    default: return 'Try adjusting your filters or search criteria.';
                  }
                })()}
              </p>
            </div>
          )}
          <button
            className={` fixed bottom-10 bg-gray-800 right-2 p-2 rounded-full text-xl shadow-2xl transition-all delay-100 ease-in-out ${
              showScrollArrow ? "block" : "hidden"
            }`}
            onClick={scrollToTop}
          >
            <MdKeyboardArrowUp className=" text-white" />
          </button>
        </div>
      )}
    </>
  );
};

export default ProductListing;
