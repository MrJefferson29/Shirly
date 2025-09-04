import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter as Router } from "react-router-dom";
import "./index.css";

import App from "./App";
import {
  AuthContextProvider,
  CartContextProvider,
  ProductsContextProvider,
  WishlistContextProvider,
} from "./contexts";

ReactDOM.render(
  <React.StrictMode>
    <AuthContextProvider>
      <ProductsContextProvider>
        <CartContextProvider>
          <WishlistContextProvider>
            <Router>
              <App />
            </Router>
          </WishlistContextProvider>
        </CartContextProvider>
      </ProductsContextProvider>
    </AuthContextProvider>
  </React.StrictMode>,
  document.getElementById("root")
);
