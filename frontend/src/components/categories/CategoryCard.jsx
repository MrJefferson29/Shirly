import React, { useState } from "react";
import { useProductsContext } from "../../contexts";
import { useNavigate } from "react-router";

const CategoryCard = ({
  category: { categoryName, description, categoryImg },
}) => {
  const navigate = useNavigate();
  const { applyFilters } = useProductsContext();
  const [showCategory, setShowCategory] = useState(true);
  const clickHandler = () => {
    applyFilters("categories", [categoryName]);
    navigate("/products", { state: { from: "category" } });
  };
  return (
    <section
      className="flex flex-col items-center rounded-lg bg-white border border-gray-200 cursor-pointer gap-3 relative overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
      onClick={clickHandler}
    >
      <img
        src={categoryImg}
        alt={categoryName}
        className="rounded-lg h-full w-full object-cover transition-all duration-300 ease-out"
      />
      <div
        className="flex flex-col w-full h-full justify-center items-center
        transition-all duration-300 absolute left-0 right-0 bottom-0 top-0 bg-black/[0.7] rounded-lg"
      >
        <h1 className="text-3xl xs:text-4xl sm:text-5xl lg:text-4xl font-bold capitalize text-white shadow-sm p-3 break-all">
          {categoryName}
        </h1>
      </div>
    </section>
  );
};

export default CategoryCard;
