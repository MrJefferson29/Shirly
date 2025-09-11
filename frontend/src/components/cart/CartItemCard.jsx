import React from "react";
import { AiOutlineMinus, AiOutlinePlus } from "react-icons/ai";
import { BsBookmarkHeart, BsFillBookmarkHeartFill } from "react-icons/bs";
import {
  useCartContext,
  useProductsContext,
  useWishlistContext,
} from "../../contexts";
import { useNavigate } from "react-router";

const CartItemCard = ({ product, isSearch, setSearch }) => {
  const navigate = useNavigate();
  const { isInWish } = useProductsContext();
  const { updateProductQtyInCart, deleteProductFromCart, disableCart } =
    useCartContext();
  const { addProductToWishlist, deleteProductFromWishlist, disableWish } =
    useWishlistContext();

  const updateHandler = (type) => {
    if (type === "increment" && product.quantity > product.qty) {
      updateProductQtyInCart(product._id, type);
    } else if (product.qty > 1) {
      updateProductQtyInCart(product._id, type);
    } else {
      deleteProductFromCart(product._id);
    }
  };
  const inWish = isInWish(product._id);
  return (
    <div
      className={`m-auto flex flex-col gap-2  p-4 rounded-sm shadow-sm bg-white/[0.6] mb-2 max-w-xl ${
        isSearch ? "cursor-pointer hover:bg-black/5" : ""
      }`}
      onClick={() => {
        if (isSearch) {
          setSearch("");
          navigate(`product/${product._id}`);
        }
      }}
    >
      <div className="flex items-center gap-4 w-full">
        <div className="flex-shrink-0">
          <div
            className={`bg-white border border-gray-200 ${
              isSearch ? "h-16 w-16" : "h-24 w-24"
            } rounded-xl overflow-hidden shadow-sm`}
          >
            <img 
              src={product.images && product.images.length > 0 ? product.images[0] : '/placeholder-image.jpg'} 
              alt={product.name} 
              className="w-full h-full object-cover" 
            />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-semibold text-gray-900 truncate">{product.name}</h2>

            {!isSearch && (
              <div className="mt-3 space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600">Quantity:</span>
                  <div className="flex items-center border border-gray-200 rounded-lg">
                    <button
                      className="p-2 text-gray-600 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                      disabled={disableCart}
                      onClick={() => updateHandler("decrement")}
                    >
                      <AiOutlineMinus className="w-4 h-4" />
                    </button>
                    <span className="px-4 py-2 text-center min-w-[3rem] font-medium">
                      {product.qty}
                    </span>
                    <button
                      className="p-2 text-gray-600 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                      disabled={disableCart}
                      onClick={() => updateHandler("increment")}
                    >
                      <AiOutlinePlus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    className="px-4 py-2 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
                    disabled={disableCart}
                    onClick={() => deleteProductFromCart(product._id)}
                  >
                    Remove
                  </button>
                  <button
                    className="p-2 text-gray-400 hover:text-rose-500 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
                    disabled={disableWish}
                    onClick={() => {
                      if (inWish) {
                        deleteProductFromWishlist(product._id);
                      } else {
                        addProductToWishlist(product);
                      }
                    }}
                  >
                    {inWish ? (
                      <BsFillBookmarkHeartFill className="text-xl text-rose-500" />
                    ) : (
                      <BsBookmarkHeart className="text-xl" />
                    )}
                  </button>
                </div>
              </div>
            )}
        </div>
        <div className="flex flex-col items-end">
          <span className="text-lg font-semibold text-gray-900">${product.newPrice}</span>
          {product.newPrice && product.newPrice < product.price && (
            <span className="text-sm line-through text-gray-500">
              ${product.price}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartItemCard;
