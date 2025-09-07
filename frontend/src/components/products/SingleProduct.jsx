import { GiRoundStar } from "react-icons/gi";
import { BsBookmarkHeart, BsFillBookmarkHeartFill } from "react-icons/bs";
import {
  useAuthContext,
  useCartContext,
  useProductsContext,
  useWishlistContext,
} from "../../contexts";
import { useLocation, useNavigate } from "react-router";
import { notify } from "../../utils/utils";

const SingleProduct = ({ product }) => {
  const { token } = useAuthContext();
  const { isInCart } = useProductsContext();
  const { addProductToCart, disableCart } = useCartContext();
  const { addProductToWishlist, deleteProductFromWishlist, disableWish } =
    useWishlistContext();
  const navigate = useNavigate();
  const location = useLocation();
  let inCart = isInCart(product._id);

  return (
    <div
      className="group bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden
      cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1
      hover:border-gray-300"
      onClick={() => {
        navigate(`/product/${product._id}`);
      }}
    >
      {/* Image Section */}
      <div className="relative overflow-hidden bg-gray-50">
        <div className="aspect-square overflow-hidden">
          <img
            src={product.images && product.images.length > 0 ? product.images[0] : '/placeholder-image.jpg'}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
        
        {/* Wishlist Button - Top Right */}
        <button
          disabled={disableWish}
          className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-sm
          hover:bg-white hover:shadow-md transition-all duration-200 disabled:cursor-not-allowed
          opacity-0 group-hover:opacity-100"
          onClick={(e) => {
            e.stopPropagation();
            if (!token) {
              navigate("/login", { state: { from: location.pathname } });
              notify("warn", "Please Login to continue");
            } else {
              if (product?.inWish) {
                deleteProductFromWishlist(product._id);
              } else {
                addProductToWishlist(product);
              }
            }
          }}
        >
          {product.inWish ? (
            <BsFillBookmarkHeartFill className="text-lg text-black" />
          ) : (
            <BsBookmarkHeart className="text-lg text-gray-600 hover:text-black" />
          )}
        </button>

        {/* Sale Badge */}
        {product.newPrice && product.newPrice < product.price && (
          <div className="absolute top-3 left-3 bg-black text-white px-3 py-1 rounded-md text-xs font-semibold">
            Sale
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-5 space-y-4">
        {/* Product Info */}
        <div className="space-y-3">
          <h3 className="font-semibold text-gray-900 text-lg line-clamp-2 group-hover:text-gray-700 transition-colors">
            {product.name}
          </h3>
          
          {/* Two Column Layout */}
          <div className="grid grid-cols-2 gap-3">
            {/* Left Column */}
            <div className="space-y-2">
              {/* Category Badge */}
              <div>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 capitalize">
                  {product.category}
                </span>
              </div>
              
              {/* Brand */}
              {product.brand && (
                <div>
                  <span className="text-xs text-gray-500 font-medium">
                    by {product.brand}
                  </span>
                </div>
              )}
            </div>

            {/* Right Column */}
            <div className="space-y-2">
              {/* Rating */}
              {product.rating > 0 && (
                <div className="flex items-center gap-1">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <GiRoundStar 
                        key={i} 
                        className={`w-4 h-4 ${i < Math.floor(product.rating || 0) ? 'text-black' : 'text-gray-300'}`} 
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-500 ml-1">({product.rating || 0})</span>
                </div>
              )}
            </div>
          </div>

          {/* Tags - Full Width */}
          {product.tags && product.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {product.tags.slice(0, 3).map((tag, index) => (
                <span key={index} className="inline-flex items-center px-2 py-1 rounded text-xs bg-blue-50 text-blue-600 font-medium">
                  #{tag}
                </span>
              ))}
              {product.tags.length > 3 && (
                <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-50 text-gray-500">
                  +{product.tags.length - 3}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Price Section */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xl font-bold text-gray-900">₹{product.newPrice || product.price}</span>
            {product.newPrice && product.newPrice < product.price && (
              <span className="text-sm text-gray-400 line-through">₹{product.price}</span>
            )}
          </div>
          
          {/* Add to Cart Button */}
          <button
            className={`px-4 py-2 rounded-md text-sm font-semibold transition-all duration-200
            ${inCart 
              ? 'bg-gray-800 text-white hover:bg-gray-900' 
              : 'bg-black text-white hover:bg-gray-800'
            } disabled:cursor-not-allowed disabled:opacity-50`}
            disabled={disableCart}
            onClick={(e) => {
              e.stopPropagation();
              if (!token) {
                navigate("/login", { state: { from: location.pathname } });
                notify("warn", "Please Login to continue");
              } else {
                if (!inCart) {
                  addProductToCart(product);
                } else {
                  navigate("/cart");
                }
              }
            }}
          >
            {inCart ? "✓ In Cart" : "Add to Cart"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SingleProduct;
