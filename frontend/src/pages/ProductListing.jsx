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

  const { loading } = useProductsContext();
  const productsList = useFilter();
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
            <h1 className="text-3xl md:text-4xl font-bold text-black">Glasses for You!</h1>
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

          {productsList.length > 0 ? (
            <main className="relative grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 pb-12">
              {productsList.map((glass) => (
                <SingleProduct key={glass.id} product={glass} />
              ))}
            </main>
          ) : (
            <div className="text-center py-20">
              <p className="text-2xl md:text-3xl font-bold text-gray-400 mb-4">
                Nothing to Show!
              </p>
              <p className="text-gray-500">
                Try adjusting your filters or search criteria.
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
