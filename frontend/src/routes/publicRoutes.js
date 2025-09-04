import { Login, ProductDetails, ProductListing, Signup, PaymentSuccess } from "../pages";

const authRoutes = [
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/signup",
    element: <Signup />,
  },
];

const contentRoutes = [
  {
    path: "/products",
    element: <ProductListing />,
  },

  {
    path: "/product/:productId",
    element: <ProductDetails />,
  },

  {
    path: "/payment/success",
    element: <PaymentSuccess />,
  },
];
export { authRoutes, contentRoutes };
