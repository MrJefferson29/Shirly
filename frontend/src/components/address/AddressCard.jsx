import { useProductsContext } from "../../contexts";

const AddressCard = ({
  address,
  isEdit,
  onEdit,
}) => {
  const { fullname, mobile, flat, area, city, state, pincode } = address;
  return (
    <div className="bg-gray-50 rounded-lg p-4 shadow-sm">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 className="text-lg font-semibold break-all">{fullname}</h3>
          <p className="text-sm text-gray-500 break-all">
            {flat}, {area}
          </p>
          <p className="text-sm text-gray-500 break-all">
            {city}, {state} {pincode}
          </p>
          <p className="text-sm text-gray-500">
            Mobile:
            <span className="font-semibold ps-1 break-all">{mobile}</span>
          </p>
        </div>
        {isEdit && (
          <button
            className="text-amber-500 font-bold hover:text-amber-600 transition-colors"
            onClick={onEdit}
          >
            Edit
          </button>
        )}
      </div>
    </div>
  );
};
export default AddressCard;
