import { CiSearch } from "react-icons/ci";
import { filterBySearch } from "../../utils/filterUtils";
import { useProductsContext, useAuthContext } from "../../contexts";
import { useEffect, useState } from "react";
import CartItemCard from "../cart/CartItemCard";
import { useLocation, useNavigate } from "react-router-dom";
import spinningLoaders from "../../assets/loaderBlack.svg";
import { trackSearchService } from "../../api/apiServices";
const Search = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { allProducts, applyFilters } = useProductsContext();
  const { token } = useAuthContext();
  const [search, setSearch] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [showList, setShowList] = useState(true);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (location?.pathname !== "/products") {
      setSearch("");
    }
  }, [location]);
  useEffect(() => {
    setSearching(true);
    let id;
    id = setTimeout(() => {
      setFilteredData(filterBySearch(search, allProducts));
      setSearching(false);
      if (location?.pathname === "/products" && !search) {
        applyFilters("searchText", search);
      }
    }, 500);

    return () => {
      clearTimeout(id);
    };
  }, [search]);

  const changeHandler = (e) => {
    setSearch(e.target.value);
    if (!showList) setShowList(true);
  };
  // Function to track search analytics
  const trackSearch = async (query, resultsCount) => {
    if (query.trim()) {
      try {
        await trackSearchService({
          query: query.trim(),
          resultsCount: resultsCount,
          timestamp: new Date().toISOString()
        }, token);
      } catch (error) {
        console.error('Failed to track search:', error);
      }
    }
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    
    // Track search analytics when user presses Enter
    await trackSearch(search, filteredData.length);
    
    applyFilters("searchText", search);
    setShowList(false);
    navigate("/products");
  };

  return (
    <>
      <form
        onSubmit={submitHandler}
        className={`flex items-center bg-black/[0.075] px-3 ${
          search && showList ? "rounded-t-md" : "rounded-full"
        } text-sm transition`}
      >
        <input
          className="w-full py-2 px-3 bg-transparent focus:outline-none"
          type="search"
          value={search}
          placeholder="Search Glasses"
          onChange={changeHandler}
        />
        <CiSearch />
      </form>
      {search && showList && (
        <ul className="absolute bg-amber-50 w-full max-h-72 overflow-auto rounded-b-md z-10">
          {searching ? (
            <li className="h-10 flex items-center justify-center">
              <img src={spinningLoaders} alt="Searching..." />
            </li>
          ) : filteredData.length ? (
            filteredData.map((product) => (
              <li key={product._id} className="">
                <CartItemCard
                  product={product}
                  isSearch={true}
                  setSearch={setSearch}
                  onSearchClick={() => trackSearch(search, filteredData.length)}
                />
              </li>
            ))
          ) : (
            <li className="h-10 flex items-center justify-center">
              No Item to show
            </li>
          )}
        </ul>
      )}
    </>
  );
};

export default Search;
