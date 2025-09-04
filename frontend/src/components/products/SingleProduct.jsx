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
      className="group bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden
      cursor-pointer transition-all duration-300 hover:shadow-2xl hover:-translate-y-2
      hover:border-yellow-200"
      onClick={() => {
        navigate(`/product/${product._id}`);
      }}
    >
      {/* Image Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="aspect-square overflow-hidden">
          <img
            src={product.images && product.images.length > 0 ? product.images[0] : '/placeholder-image.jpg'}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          />
        </div>
        
        {/* Wishlist Button - Top Right */}
        <button
          disabled={disableWish}
          className="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-md
          hover:bg-white hover:shadow-lg transition-all duration-200 disabled:cursor-not-allowed
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
            <BsFillBookmarkHeartFill className="text-lg text-rose-500" />
          ) : (
            <BsBookmarkHeart className="text-lg text-gray-600 hover:text-rose-500" />
          )}
        </button>

        {/* Sale Badge */}
        {product.newPrice && product.newPrice < product.price && (
          <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
            Sale
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-4 space-y-3">
        {/* Product Info */}
        <div className="space-y-2">
          <h3 className="font-semibold text-gray-900 text-lg line-clamp-2 group-hover:text-yellow-600 transition-colors">
            {product.name}
          </h3>
          <p className="text-sm text-gray-500 font-medium">{product.brand}</p>
          
          {/* Rating */}
          <div className="flex items-center gap-1">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <GiRoundStar 
                  key={i} 
                  className={`w-4 h-4 ${i < Math.floor(product.rating || 0) ? 'text-yellow-400' : 'text-gray-300'}`} 
                />
              ))}
            </div>
            <span className="text-sm text-gray-500 ml-1">({product.rating || 0})</span>
          </div>
        </div>

        {/* Price Section */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xl font-bold text-gray-900">₹{product.newPrice || product.price}</span>
            {product.newPrice && product.newPrice < product.price && (
              <span className="text-sm text-gray-500 line-through">₹{product.price}</span>
            )}
          </div>
          
          {/* Add to Cart Button */}
          <button
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200
            ${inCart 
              ? 'bg-green-500 text-white hover:bg-green-600' 
              : 'bg-yellow-500 text-white hover:bg-yellow-600 hover:shadow-lg'
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
