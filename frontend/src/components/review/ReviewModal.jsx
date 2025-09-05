import React, { useState, useEffect } from 'react';
import { AiOutlineClose, AiFillStar, AiOutlineStar } from 'react-icons/ai';
import { useAuthContext } from '../../contexts';
import { 
  createReviewService, 
  updateReviewService, 
  canUserReviewService 
} from '../../api/apiServices';
import { notify } from '../../utils/utils';

const ReviewModal = ({ 
  isOpen, 
  onClose, 
  product, 
  orderId, 
  existingReview = null,
  onReviewSubmitted 
}) => {
  const { token } = useAuthContext();
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [comment, setComment] = useState(existingReview?.comment || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [canReview, setCanReview] = useState({ canReview: false, reason: '' });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && product && orderId) {
      checkReviewEligibility();
    }
  }, [isOpen, product, orderId]);

  useEffect(() => {
    if (existingReview) {
      setRating(existingReview.rating);
      setComment(existingReview.comment || '');
    } else {
      setRating(0);
      setComment('');
    }
  }, [existingReview]);

  const checkReviewEligibility = async () => {
    if (!product || !orderId) return;
    
    setIsLoading(true);
    try {
      const response = await canUserReviewService(product._id, orderId, token);
      setCanReview(response.data.data);
    } catch (error) {
      console.error('Error checking review eligibility:', error);
      setCanReview({ canReview: false, reason: 'Unable to verify review eligibility' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (rating === 0) {
      notify('warn', 'Please select a rating');
      return;
    }

    if (!canReview.canReview) {
      notify('error', canReview.reason);
      return;
    }

    setIsSubmitting(true);

    try {
      const reviewData = {
        productId: product._id,
        orderId: orderId,
        rating: rating,
        comment: comment.trim()
      };

      let response;
      if (existingReview) {
        response = await updateReviewService(existingReview._id, reviewData, token);
        notify('success', 'Review updated successfully!');
      } else {
        response = await createReviewService(reviewData, token);
        notify('success', 'Review submitted successfully!');
      }

      if (onReviewSubmitted) {
        onReviewSubmitted(response.data.data.review);
      }

      onClose();
    } catch (error) {
      console.error('Error submitting review:', error);
      notify('error', error.response?.data?.message || 'Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setRating(existingReview?.rating || 0);
    setComment(existingReview?.comment || '');
    onClose();
  };

  const renderStars = () => {
    return [1, 2, 3, 4, 5].map((star) => (
      <button
        key={star}
        type="button"
        onClick={() => setRating(star)}
        className="focus:outline-none transition-colors"
        disabled={!canReview.canReview}
      >
        {star <= rating ? (
          <AiFillStar className="w-8 h-8 text-yellow-400" />
        ) : (
          <AiOutlineStar className="w-8 h-8 text-gray-300 hover:text-yellow-400" />
        )}
      </button>
    ));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {existingReview ? 'Edit Review' : 'Write a Review'}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <AiOutlineClose className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-2 text-gray-600">Checking eligibility...</p>
            </div>
          ) : !canReview.canReview ? (
            <div className="text-center py-8">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-yellow-800 font-medium mb-2">Cannot Review This Product</p>
                <p className="text-yellow-700 text-sm">{canReview.reason}</p>
              </div>
            </div>
          ) : (
            <>
              {/* Product Info */}
              <div className="flex items-center space-x-3 mb-6">
                <img
                  src={product.images?.[0] || '/placeholder-product.jpg'}
                  alt={product.name}
                  className="w-16 h-16 object-cover rounded-lg"
                />
                <div>
                  <h3 className="font-medium text-gray-900">{product.name}</h3>
                  <p className="text-sm text-gray-500">{product.brand}</p>
                </div>
              </div>

              {/* Review Form */}
              <form onSubmit={handleSubmit}>
                {/* Rating */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Rating *
                  </label>
                  <div className="flex space-x-1">
                    {renderStars()}
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    {rating === 0 && 'Select a rating'}
                    {rating === 1 && 'Poor'}
                    {rating === 2 && 'Fair'}
                    {rating === 3 && 'Good'}
                    {rating === 4 && 'Very Good'}
                    {rating === 5 && 'Excellent'}
                  </p>
                </div>

                {/* Comment */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Review (Optional)
                  </label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Share your experience with this product..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    rows={4}
                    maxLength={500}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {comment.length}/500 characters
                  </p>
                </div>

                {/* Submit Button */}
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || rating === 0}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        {existingReview ? 'Updating...' : 'Submitting...'}
                      </span>
                    ) : (
                      existingReview ? 'Update Review' : 'Submit Review'
                    )}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReviewModal;
