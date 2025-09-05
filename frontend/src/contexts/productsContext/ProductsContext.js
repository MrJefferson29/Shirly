import { createContext, useEffect, useReducer, useState } from "react";
import { initialState, productsReducer } from "../../reducers/productsReducer";
import {
  getAllCategoriesService,
  getAllProductsService,
  getUserAddressesService,
  addAddressService,
  updateAddressService,
  deleteAddressService,
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

  const [state, dispatch] = useReducer(productsReducer, initialState);
  const [currentAddress, setCurrentAddress] = useState({});
  const [userAddresses, setUserAddresses] = useState([]);
  const [isOrderPlaced, setisOrderPlaced] = useState(false);

  // Load user's addresses from backend
  useEffect(() => {
    const loadUserAddresses = async () => {
      if (token) {
        try {
          const response = await getUserAddressesService(token);
          if (response.data.success && response.data.data.addresses) {
            const addresses = response.data.data.addresses;
            setUserAddresses(addresses);
            
            // Set the default address as current address
            const defaultAddress = addresses.find(addr => addr.isDefault);
            if (defaultAddress) {
              setCurrentAddress(defaultAddress);
            } else if (addresses.length > 0) {
              setCurrentAddress(addresses[0]);
            }
          }
        } catch (error) {
          console.log('No addresses found or error loading addresses:', error);
        }
      }
    };

    loadUserAddresses();
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

  const addAddress = async (newAddress) => {
    try {
      if (token) {
        const response = await addAddressService(newAddress, token);
        if (response.data.success) {
          const addedAddress = response.data.data.address;
          setUserAddresses(prev => [...prev, addedAddress]);
          
          // If this is the first address or marked as default, set it as current
          if (addedAddress.isDefault || userAddresses.length === 0) {
            setCurrentAddress(addedAddress);
          }
          
          // Also update local state for backward compatibility
          dispatch({
            type: addressTypes.ADD_ADDRESS,
            payload: [addedAddress, ...state.addressList],
          });
        }
      }
    } catch (error) {
      console.error('Error saving address:', error);
      throw error;
    }
  };

  const updateAddress = async (addressId, updatedAddress) => {
    try {
      if (token) {
        const response = await updateAddressService(addressId, updatedAddress, token);
        if (response.data.success) {
          const updatedAddr = response.data.data.address;
          setUserAddresses(prev => prev.map(addr => 
            addr._id === addressId ? updatedAddr : addr
          ));
          
          // If this address is marked as default, set it as current
          if (updatedAddr.isDefault) {
            setCurrentAddress(updatedAddr);
          }
          
          // Also update local state for backward compatibility
          dispatch({
            type: addressTypes.ADD_ADDRESS,
            payload: state.addressList.map((item) =>
              item.id === addressId ? updatedAddr : item
            ),
          });
        }
      }
    } catch (error) {
      console.error('Error updating address:', error);
      throw error;
    }
  };

  const deleteAddress = async (addressId) => {
    try {
      if (token) {
        const response = await deleteAddressService(addressId, token);
        if (response.data.success) {
          setUserAddresses(prev => prev.filter(addr => addr._id !== addressId));
          
          // If we deleted the current address, set a new current address
          if (currentAddress._id === addressId) {
            const remainingAddresses = userAddresses.filter(addr => addr._id !== addressId);
            if (remainingAddresses.length > 0) {
              const newDefault = remainingAddresses.find(addr => addr.isDefault) || remainingAddresses[0];
              setCurrentAddress(newDefault);
            } else {
              setCurrentAddress({});
            }
          }
          
          // Also update local state for backward compatibility
          dispatch({
            type: addressTypes.ADD_ADDRESS,
            payload: state.addressList.filter(({ id }) => id !== addressId),
          });
        }
      }
    } catch (error) {
      console.error('Error deleting address:', error);
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
        userAddresses,
        isInCart,
        isInWish,
        isOrderPlaced,
        currentAddress,
        loading,
        trendingProducts,
        updateInCartOrInWish,
        getProductById,
        applyFilters,
        clearFilters,
        addAddress,
        updateAddress,
        deleteAddress,
        setCurrentAddress,
        setisOrderPlaced,
      }}
    >
      {children}
    </ProductsContext.Provider>
  );
};

export default ProductsContextProvider;
