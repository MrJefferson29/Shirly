import React, { Fragment, useState } from "react";

import { useProductsContext } from "../../contexts";
import AddressCard from "./AddressCard";
import AddressForm from "./AddressForm";

const Address = ({ isEdit }) => {
  const [showAddressForm, setShowAddressForm] = useState(false);
  const { userAddress, updateAddress } = useProductsContext();
  return (
    <>
      {!isEdit && <h1 className="text-2xl font-bold">Address</h1>}
      {showAddressForm ? (
        <AddressForm
          setShowAddressForm={setShowAddressForm}
          editAddress={userAddress}
          onSubmit={updateAddress}
        />
      ) : (
        <div className="flex flex-col gap-4">
          {userAddress && Object.keys(userAddress).length > 0 ? (
            <AddressCard
              address={userAddress}
              isEdit={isEdit}
              onEdit={() => setShowAddressForm(true)}
            />
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No address saved yet</p>
              <button
                className="btn-rounded-primary text-sm"
                onClick={() => setShowAddressForm(true)}
              >
                + Add Address
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default Address;
