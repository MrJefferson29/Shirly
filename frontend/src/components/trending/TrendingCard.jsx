import { Link } from "react-router-dom";

import { AiOutlinePlus, AiOutlineCheck } from "react-icons/ai";

const TrendingCard = ({ product }) => {
  return (
    <Link
      to={`/product/${product._id}`}
      className="group relative bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden
      cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1
      hover:border-gray-300"
    >
      {/* Image Section */}
      <div className="relative overflow-hidden bg-gray-50">
        <div className="aspect-[3/4] overflow-hidden">
          <img
            src={product.images && product.images.length > 0 ? product.images[0] : '/placeholder-image.jpg'}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
        
        {/* Sale Badge */}
        {product.newPrice && product.newPrice < product.price && (
          <div className="absolute top-3 left-3 bg-black text-white px-2 py-1 rounded-md text-xs font-semibold">
            Sale
          </div>
        )}

        {/* Category Badge */}
        <div className="absolute top-3 right-3 bg-white/90 text-black px-2 py-1 rounded-md text-xs font-medium capitalize">
          {product.category}
        </div>

        {/* Overlay Content - Two Column Layout */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4">
          <div className="grid grid-cols-2 gap-3 items-end">
            {/* Left Column - Product Name */}
            <div>
              <h3 className="font-semibold text-white text-sm sm:text-base line-clamp-2 group-hover:text-gray-200 transition-colors">
                {product.name}
              </h3>
            </div>

            {/* Right Column - Price */}
            <div className="text-right">
              <div className="flex flex-col items-end">
                <span className="text-base sm:text-lg font-bold text-white">₹{product.newPrice || product.price}</span>
                {product.newPrice && product.newPrice < product.price && (
                  <span className="text-xs sm:text-sm text-gray-300 line-through">₹{product.price}</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default TrendingCard;
