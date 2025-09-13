import { useContext } from "react";
import { AuthContext } from "./authContext/AuthContext";
import { ProductsContext } from "./productsContext/ProductsContext";
import { CartContext } from "./cartContext/CartContext";
import { WishlistContext } from "./wishlistContext/WishlistContext";
import NotificationContext from "./notificationContext/NotificationContext";

export { default as AuthContextProvider } from "./authContext/AuthContext";
export { default as ProductsContextProvider } from "./productsContext/ProductsContext";
export { default as CartContextProvider } from "./cartContext/CartContext";
export { default as WishlistContextProvider } from "./wishlistContext/WishlistContext";
export { NotificationProvider } from "./notificationContext/NotificationContext";

export const useAuthContext = () => useContext(AuthContext);
export const useProductsContext = () => useContext(ProductsContext);
export const useCartContext = () => useContext(CartContext);
export const useWishlistContext = () => useContext(WishlistContext);
export const useNotificationContext = () => useContext(NotificationContext);
