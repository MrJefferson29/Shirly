import { BsBookmarkHeart } from "react-icons/bs";
import { HiOutlineShoppingBag } from "react-icons/hi";
import { MdAdminPanelSettings } from "react-icons/md";
import { useAuthContext } from "../../contexts";

const MenuDropdown = ({ navigate, onClose }) => {
  const { userInfo } = useAuthContext();
  
  const handleNavigation = (path) => {
    navigate(path);
    onClose(); // Close the dropdown after navigation
  };
  
  return (
    <div className="absolute right-0 z-10  bg-amber-50 font-semibold   rounded-lg shadow w-max  overflow-hidden transition-all">
      <ul className="text-sm  ">
        <li onClick={() => handleNavigation("/wishlist")}>
          <span className="flex items-center px-5 py-3 hover:bg-amber-100 ">
            <BsBookmarkHeart className="text-lg me-3" /> Wishlist
          </span>
        </li>
        <li onClick={() => handleNavigation("/cart")}>
          <span className="flex items-center px-5 py-3 hover:bg-amber-100 ">
            <HiOutlineShoppingBag className="text-lg me-3" /> Bag
          </span>
        </li>
        {userInfo?.role === 'admin' && (
          <li onClick={() => handleNavigation("/admin")}>
            <span className="flex items-center px-5 py-3 hover:bg-amber-100 ">
              <MdAdminPanelSettings className="text-lg me-3" /> Admin Panel
            </span>
          </li>
        )}
      </ul>
    </div>
  );
};

export default MenuDropdown;
