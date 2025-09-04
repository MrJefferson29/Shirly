import { Cart, Wishlist, Checkout, Profile, Orders, AdminDashboard, AdminProducts, AdminOrders } from "../pages";

const privateRoutes = [
  {
    path: "/cart",
    element: <Cart />,
  },
  {
    path: "/wishlist",
    element: <Wishlist />,
  },
  {
    path: "/checkout",
    element: <Checkout />,
  },
  {
    path: "/orders",
    element: <Orders />,
  },
  {
    path: "/profile",
    element: <Profile />,
  },
  // Admin routes
  {
    path: "/admin",
    element: <AdminDashboard />,
  },
  {
    path: "/admin/products",
    element: <AdminProducts />,
  },
  {
    path: "/admin/orders",
    element: <AdminOrders />,
  },
];
export { privateRoutes };
