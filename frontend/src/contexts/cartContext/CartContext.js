import { createContext, useEffect, useReducer, useState } from "react";
import { initialState, cartReducer } from "../../reducers/cartReducer";
import {
  deleteProductFromCartService,
  getCartItemsService,
  postAddProductToCartService,
  putUpdateProductQtyCartService,
} from "../../api/apiServices";
import { actionTypes } from "../../utils/actionTypes";
import { useAuthContext, useProductsContext } from "..";
import { notify } from "../../utils/utils";

export const CartContext = createContext();

const CartContextProvider = ({ children }) => {
  const { token } = useAuthContext();
  const { updateInCartOrInWish, clearCarted } = useProductsContext();
  const [loadingCart, setLoadingCart] = useState(false);
  const [disableCart, setDisableCart] = useState(false);

  const [state, dispatch] = useReducer(cartReducer, initialState);

  useEffect(() => {
    if (token) {
      setLoadingCart(true);
      (async () => {
        try {
          const cartRes = await getCartItemsService(token);

          if (cartRes.status === 200) {
            // Transform backend cart structure to frontend structure
            const transformedCart = cartRes.data.data.cart.map(item => ({
              _id: item.product._id,
              qty: item.quantity,
              price: item.product.price,
              newPrice: item.product.newPrice,
              name: item.product.name,
              brand: item.product.brand,
              images: item.product.images,
              category: item.product.category,
              rating: item.product.rating
            }));
            
            dispatch({
              type: actionTypes.INITIALIZE_CART,
              payload: transformedCart,
            });
          }
        } catch (err) {
          console.log(err);
          notify(
            "error",
            err?.response?.data?.errors
              ? err?.response?.data?.errors[0]
              : err?.response?.data?.message
          );
        } finally {
          setLoadingCart(false);
        }
      })();
    }
  }, [token]);

  const addProductToCart = async (product) => {
    setDisableCart(true);
    try {
      const response = await postAddProductToCartService(
        {
          ...product,
          qty: 1,
        },
        token
      );
      if (response.status === 200 || response.status === 201) {
        dispatch({
          type: actionTypes.ADD_PRODUCT_TO_CART,
          payload: [{ ...product, qty: 1 }, ...state.cart],
        });
        updateInCartOrInWish(product._id, "inCart", true);
        notify("success", "Product Added to Bag");
      }

      console.log({ response });
    } catch (err) {
      console.log(err);
      notify(
        "error",
        err?.response?.data?.errors
          ? err?.response?.data?.errors[0]
          : "Some Error Occurred!!"
      );
    } finally {
      setDisableCart(false);
    }
  };

  const updateProductQtyInCart = async (productId, type) => {
    setDisableCart(true);
    try {
      // Find current quantity
      const currentItem = state.cart.find(item => item._id === productId);
      if (!currentItem) return;

      const newQuantity = type === "increment" 
        ? currentItem.qty + 1 
        : currentItem.qty - 1;

      if (newQuantity < 1) {
        // Remove item if quantity becomes 0
        await deleteProductFromCart(productId);
        return;
      }

      const response = await putUpdateProductQtyCartService(
        productId,
        newQuantity,
        token
      );
      
      console.log({ response });
      if (response.status === 200 || response.status === 201) {
        dispatch({
          type: actionTypes.UPDATE_PRODUCT_QTY_IN_CART,
          payload: state.cart.map((item) =>
            item._id === productId
              ? { ...item, qty: newQuantity }
              : item
          ),
        });
      }
    } catch (err) {
      console.log(err);

      notify(
        "error",
        err?.response?.data?.errors
          ? err?.response?.data?.errors[0]?.msg || err?.response?.data?.message
          : "Some Error Occurred!!"
      );
    } finally {
      setDisableCart(false);
    }
  };

  const deleteProductFromCart = async (productId) => {
    setDisableCart(true);
    try {
      const response = await deleteProductFromCartService(productId, token);
      if (response.status === 200 || response.status === 201) {
        // Transform backend cart structure to frontend structure
        const transformedCart = response.data.data.cart.map(item => ({
          _id: item.product._id,
          qty: item.quantity,
          price: item.product.price,
          newPrice: item.product.newPrice,
          name: item.product.name,
          brand: item.product.brand,
          images: item.product.images,
          category: item.product.category,
          rating: item.product.rating
        }));
        
        dispatch({
          type: actionTypes.DELETE_PRODUCTS_FROM_CART,
          payload: transformedCart,
        });
        updateInCartOrInWish(productId, "inCart", false);
        notify("info", "Product Removed from Bag");
      }
    } catch (err) {
      console.log(err);
      notify(
        "error",
        err?.response?.data?.errors
          ? err?.response?.data?.errors[0]
          : "Some Error Occurred!!"
      );
    } finally {
      setDisableCart(false);
    }
  };
  const clearCart = () => {
    state.cart.map(async ({ _id }) => {
      try {
        const response = await deleteProductFromCartService(_id, token);
        if (response.status === 200 || response.status === 201) {
        }
        dispatch({
          type: actionTypes.DELETE_PRODUCTS_FROM_CART,
          payload: [],
        });
      } catch (err) {
        console.log(err);
        notify(
          "error",
          err?.response?.data?.errors
            ? err?.response?.data?.errors[0]
            : "Some Error Occurred!!"
        );
      }
    });
    updateInCartOrInWish();
  };

  const { totalPriceOfCartProducts, actualPriceOfCart } = (state.cart || []).reduce(
    (acc, { qty, price, newPrice }) => ({
      totalPriceOfCartProducts: acc.totalPriceOfCartProducts + qty * newPrice,
      actualPriceOfCart: acc.actualPriceOfCart + qty * price,
    }),
    { totalPriceOfCartProducts: 0, actualPriceOfCart: 0 }
  );

  return (
    <CartContext.Provider
      value={{
        cart: state.cart || [],
        disableCart,
        loadingCart,
        addProductToCart,
        updateProductQtyInCart,
        deleteProductFromCart,
        totalPriceOfCartProducts,
        actualPriceOfCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export default CartContextProvider;
