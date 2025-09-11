import { Login, ProductDetails, ProductListing, Signup, PaymentSuccess, WarrantySupport, ContactUs, ShippingInfo, ReturnsExchanges, PaymentOptions } from "../pages";

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
  {
    path: "/warranty",
    element: <WarrantySupport />,
  },
  {
    path: "/contact",
    element: <ContactUs />,
  },
  {
    path: "/shipping",
    element: <ShippingInfo />,
  },
  {
    path: "/returns",
    element: <ReturnsExchanges />,
  },
  {
    path: "/payment-options",
    element: <PaymentOptions />,
  },
];
export { authRoutes, contentRoutes };
