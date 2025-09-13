import { createContext, useEffect, useReducer, useState } from "react";
import { initialState, productsReducer } from "../../reducers/productsReducer";
import {
  getAllCategoriesService,
  getAllProductsService,
  getUserAddressService,
  updateAddressService,
} from "../../api/apiServices";
import {
  actionTypes,
  addressTypes,
  filterTypes,
} from "../../utils/actionTypes";
import { useAuthContext } from "..";

export const ProductsContext = createContext();

const ProductsContextProvider = ({ children }) => {
  const { token } = useAuthContext();
  const [loading, setLoading] = useState(false);
  const [addressLoading, setAddressLoading] = useState(false);

  const [state, dispatch] = useReducer(productsReducer, initialState);
  const [userAddress, setUserAddress] = useState({});
  const [isOrderPlaced, setisOrderPlaced] = useState(false);

  // Load user's address from backend
  useEffect(() => {
    const loadUserAddress = async () => {
      if (token) {
        setAddressLoading(true);
        try {
          const response = await getUserAddressService(token);
          
          if (response.data.success && response.data.data?.shippingAddress) {
            const address = response.data.data.shippingAddress;
            setUserAddress(address);
          }
        } catch (error) {
          console.error('Error loading address:', error);
        } finally {
          setAddressLoading(false);
        }
      }
    };

    loadUserAddress();
  }, [token]);

  useEffect(() => {
    setLoading(true);
    (async () => {
      try {
        const productsRes = await getAllProductsService();
        if (productsRes.status === 200) {
          dispatch({
            type: actionTypes.INITIALIZE_PRODUCTS,
            payload: productsRes.data.data.products,
          });
        }

        const categoryRes = await getAllCategoriesService();

        if (categoryRes.status === 200) {
          dispatch({
            type: actionTypes.INITIALIZE_CATEGORIES,
            payload: categoryRes.data.data.categories,
          });
        }
      } catch (e) {
        console.log(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  const getProductById = (productId) =>
    state.allProducts.find((product) => product._id === productId);

  const updateInCartOrInWish = (productId, type, value) => {
    if (productId) {
      dispatch({
        type: actionTypes.UPDATE_PRODUCTS,
        payload: state.allProducts.map((item) =>
          item._id === productId ? { ...item, [type]: value } : item
        ),
      });
    } else {
      dispatch({
        type: actionTypes.UPDATE_PRODUCTS,
        payload: state.allProducts.map((item) => ({
          ...item,
          inCart: false,
          qty: 0,
        })),
      });
    }
  };

  const applyFilters = (filterType, filterValue) => {
    dispatch({
      type: filterTypes.FILTERS,
      payload: { filterType, filterValue },
    });
  };
  const clearFilters = () => {
    dispatch({
      type: filterTypes.CLEAR_FILTER,
    });
  };
  const trendingProducts = state.allProducts.filter(
    (product) => product.trending
  );


  const updateAddress = async (addressData) => {
    try {
      if (token) {
        const response = await updateAddressService(addressData, token);
        if (response.data.success) {
          const updatedAddress = response.data.data.shippingAddress;
          setUserAddress(updatedAddress);
        }
      }
    } catch (error) {
      console.error('Error updating address:', error);
      throw error;
    }
  };

  const addAddress = async (addressData) => {
    try {
      if (token) {
        const response = await updateAddressService(addressData, token);
        if (response.data.success) {
          const updatedAddress = response.data.data.shippingAddress;
          setUserAddress(updatedAddress);
        }
      }
    } catch (error) {
      console.error('Error adding address:', error);
      throw error;
    }
  };

  const isInCart = (productId) =>
    state.allProducts.find((item) => item._id === productId && item.inCart);
  const isInWish = (productId) =>
    state.allProducts.find((item) => item._id === productId && item.inWish);


  return (
    <ProductsContext.Provider
      value={{
        allProducts: state.allProducts,
        wishlist: state.wishlist,
        filters: state.filters,
        maxRange: state.maxRange,
        categoryList: state.categoryList,
        addressList: state.addressList,
        userAddress,
        isInCart,
        isInWish,
        isOrderPlaced,
        currentAddress: userAddress,
        loading,
        addressLoading,
        trendingProducts,
        updateInCartOrInWish,
        getProductById,
        applyFilters,
        clearFilters,
        updateAddress,
        addAddress,
        setisOrderPlaced,
      }}
    >
      {children}
    </ProductsContext.Provider>
  );
};

export default ProductsContextProvider;
