import React from "react";
import emptyBag from "../assets/empty-shopping-bag.png";
import { useCartContext } from "../contexts";
import { CartItemCard } from "../components";
import CartTotalCard from "../components/cart/CartTotalCard";
import { useNavigate } from "react-router";

const Cart = () => {
  const { cart } = useCartContext();
  const navigate = useNavigate();

  return (
    <div className="py-2 px-4 sm:px-6 lg:px-8">
      {cart.length > 0 && (
        <h1 className="text-2xl font-bold p-3">Bag({cart.length})</h1>
      )}
      {cart.length ? (
        <div className="flex flex-col lg:grid lg:grid-cols-3 gap-5">
          <main className="lg:col-span-2 space-y-4">
            {cart.map((product) => (
              <CartItemCard key={product._id} product={product} />
            ))}
          </main>
          <div className="lg:col-span-1">
            <CartTotalCard cart={cart} />
          </div>
        </div>
      ) : (
        <div className="h-[60vh] w-full flex flex-col items-center justify-center  gap-3 ">
          <img
            src={emptyBag}
            alt="empty bag"
            className="h-36 -rotate-12 mt-5 drop-shadow-lg"
          />
          <div className="text-center">
            <h2 className="text-2xl font-bold">Hey, it feels so light!</h2>
            <p className="text-sm text-gray-400">
              There's nothing in your bag. Let's add some items.
            </p>
          </div>

          <button
            className="btn-rounded-secondary text-sm mt-5"
            onClick={() => navigate("/products")}
          >
            Explore
          </button>
        </div>
      )}
    </div>
  );
};

export default Cart;
