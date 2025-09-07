import React from "react";
import SingleProduct from "../components/products/SingleProduct";
import { useWishlistContext } from "../contexts";
import emptyWish from "../assets/empty-wish.gif";

const Wishlist = () => {
  const { wishlist } = useWishlistContext();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {wishlist.length ? (
        <>
          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-light text-black mb-2">
              Your <span className="font-semibold">Wishlist</span>
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              {wishlist.length} {wishlist.length === 1 ? 'item' : 'items'} saved for later
            </p>
          </div>
          
          <main className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 pb-12">
            {wishlist.map((glass) => (
              <SingleProduct key={glass.id} product={glass} fromWish={true} />
            ))}
          </main>
        </>
      ) : (
        <div className="text-center py-20">
          <img
            src={emptyWish}
            alt="empty-wishlist"
            className="w-full max-w-md mx-auto mb-8"
          />
          <h3 className="text-2xl md:text-3xl font-bold text-gray-400 mb-4">
            Your Wishlist is Empty
          </h3>
          <p className="text-lg text-gray-500 leading-relaxed max-w-md mx-auto">
            Start adding products you love to your wishlist and they'll appear here.
          </p>
        </div>
      )}
    </div>
  );
};

export default Wishlist;
