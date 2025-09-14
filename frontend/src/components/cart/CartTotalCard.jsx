import React from "react";
import PriceCard from "./PriceCard";
import { useCartContext, useProductsContext } from "../../contexts";
import { useNavigate } from "react-router";

const CartTotalCard = ({ cart }) => {
  const navigate = useNavigate();

  const { setisOrderPlaced } = useProductsContext();
  const { totalPriceOfCartProducts } = useCartContext();

  return (
    <section className="py-4 sm:py-7 px-4 sm:px-7 rounded-md shadow-sm bg-white/[0.7] flex flex-col gap-4 sm:gap-6 w-full h-min sticky top-4">
      <h1 className="text-lg sm:text-xl font-semibold">Price Details</h1>
      <div className="space-y-2">
        {cart.map((product) => (
          <PriceCard key={product._id} product={product} />
        ))}
      </div>

      <hr className="border-gray-200" />
      <div className="flex justify-between items-center">
        <p className="text-gray-600 font-medium">Total</p>
        <p className="text-xl sm:text-2xl font-bold">$ {totalPriceOfCartProducts}</p>
      </div>

      <div className="w-full py-2">
        <button
          className="btn-rounded-primary rounded-full flex items-center justify-center gap-2 text-sm sm:text-base w-full py-3"
          onClick={() => {
            setisOrderPlaced(true);
            setTimeout(() => {
              navigate("/checkout", {
                state: "cart",
              });
            }, 100);
          }}
        >
          Proceed to Checkout
        </button>
      </div>
    </section>
  );
};

export default CartTotalCard;
