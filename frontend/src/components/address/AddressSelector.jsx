import React, { useState } from "react";
import { useProductsContext } from "../../contexts";
import { FaPlus, FaEdit, FaTrash, FaCheck } from "react-icons/fa";
import AddressForm from "./AddressForm";

const AddressSelector = ({ onAddressSelect, selectedAddress }) => {
  const { userAddresses, addAddress, updateAddress, deleteAddress, setCurrentAddress } = useProductsContext();
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);

  const handleAddressSelect = (address) => {
    setCurrentAddress(address);
    onAddressSelect(address);
  };

  const handleAddAddress = async (newAddress) => {
    try {
      await addAddress(newAddress);
      setShowAddressForm(false);
    } catch (error) {
      console.error('Error adding address:', error);
    }
  };

  const handleUpdateAddress = async (addressId, updatedAddress) => {
    try {
      await updateAddress(addressId, updatedAddress);
      setEditingAddress(null);
    } catch (error) {
      console.error('Error updating address:', error);
    }
  };

  const handleDeleteAddress = async (addressId) => {
    if (window.confirm('Are you sure you want to delete this address?')) {
      try {
        await deleteAddress(addressId);
      } catch (error) {
        console.error('Error deleting address:', error);
      }
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800">Select Shipping Address</h3>
      
      {/* Existing Addresses */}
      {userAddresses.length > 0 && (
        <div className="space-y-3">
          {userAddresses.map((address) => (
            <div
              key={address._id}
              className={`border rounded-lg p-4 cursor-pointer transition-all ${
                selectedAddress?._id === address._id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => handleAddressSelect(address)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-medium text-gray-800">{address.fullname}</h4>
                    {address.isDefault && (
                      <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                        Default
                      </span>
                    )}
                    {selectedAddress?._id === address._id && (
                      <FaCheck className="text-blue-500" />
                    )}
                  </div>
                  <p className="text-sm text-gray-600">
                    {address.flat}, {address.area}
                  </p>
                  <p className="text-sm text-gray-600">
                    {address.city}, {address.state} {address.pincode}
                  </p>
                  <p className="text-sm text-gray-600">Phone: {address.mobile}</p>
                </div>
                
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingAddress(address);
                    }}
                    className="p-2 text-gray-500 hover:text-blue-500 transition-colors"
                    title="Edit address"
                  >
                    <FaEdit size={14} />
                  </button>
                  {userAddresses.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteAddress(address._id);
                      }}
                      className="p-2 text-gray-500 hover:text-red-500 transition-colors"
                      title="Delete address"
                    >
                      <FaTrash size={14} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add New Address Button */}
      <button
        onClick={() => setShowAddressForm(true)}
        className="w-full border-2 border-dashed border-gray-300 rounded-lg p-4 text-gray-600 hover:border-gray-400 hover:text-gray-700 transition-colors flex items-center justify-center gap-2"
      >
        <FaPlus />
        Add New Address
      </button>

      {/* Address Form Modal */}
      {(showAddressForm || editingAddress) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">
                {editingAddress ? 'Edit Address' : 'Add New Address'}
              </h3>
              <AddressForm
                editAddress={editingAddress}
                setShowAddressForm={setShowAddressForm}
                setEditAddress={setEditingAddress}
                onSubmit={editingAddress ? 
                  (address) => handleUpdateAddress(editingAddress._id, address) :
                  handleAddAddress
                }
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddressSelector;
