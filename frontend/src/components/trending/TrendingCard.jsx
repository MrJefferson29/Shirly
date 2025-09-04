import { Link } from "react-router-dom";

import { AiOutlinePlus, AiOutlineCheck } from "react-icons/ai";

const TrendingCard = ({ product }) => {
  return (
    <Link
      to={`/product/${product._id}`}
      className="group flex flex-col bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden
      cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1
      hover:border-yellow-200"
    >
      {/* Image Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="aspect-[4/3] overflow-hidden">
          <img
            src={product.images && product.images.length > 0 ? product.images[0] : '/placeholder-image.jpg'}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
        
        {/* Sale Badge */}
        {product.newPrice && product.newPrice < product.price && (
          <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
            Sale
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-4 space-y-3 flex-1 flex flex-col">
        {/* Product Info */}
        <div className="space-y-2 flex-1">
          <h3 className="font-semibold text-gray-900 text-lg line-clamp-2 group-hover:text-yellow-600 transition-colors">
            {product.name}
          </h3>
          <p className="text-sm text-gray-500 font-medium">{product.category}</p>
        </div>

        {/* Price and Action */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-lg font-bold text-gray-900">₹{product.newPrice || product.price}</span>
            {product.newPrice && product.newPrice < product.price && (
              <span className="text-sm text-gray-500 line-through">₹{product.price}</span>
            )}
          </div>
          
          <button className="p-2 bg-yellow-500 text-white rounded-full hover:bg-yellow-600 transition-colors duration-200">
            {product.inCart ? (
              <AiOutlineCheck className="text-sm" />
            ) : (
              <AiOutlinePlus className="text-sm" />
            )}
          </button>
        </div>
      </div>
    </Link>
  );
};

export default TrendingCard;
