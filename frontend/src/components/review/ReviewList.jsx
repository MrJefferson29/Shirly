import React, { useState, useEffect } from 'react';
import { AiFillStar, AiOutlineStar } from 'react-icons/ai';
import { BsHandThumbsUp } from 'react-icons/bs';
import { getProductReviewsService, markReviewHelpfulService } from '../../api/apiServices';
import { useAuthContext } from '../../contexts';

const ReviewList = ({ productId, onReviewUpdate }) => {
  const { token } = useAuthContext();
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({
    averageRating: 0,
    totalReviews: 0,
    ratingDistribution: []
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    hasNext: false,
    hasPrev: false
  });
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (productId) {
      fetchReviews();
    }
  }, [productId, sortBy, currentPage]);

  const fetchReviews = async () => {
    setIsLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: 5,
        sort: sortBy
      };

      const response = await getProductReviewsService(productId, params);
      const { reviews, stats: reviewStats, pagination: paginationData } = response.data.data;

      setReviews(reviews);
      setStats(reviewStats);
      setPagination(paginationData);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkHelpful = async (reviewId) => {
    if (!token) return;

    try {
      await markReviewHelpfulService(reviewId, token);
      // Update the helpful count in local state
      setReviews(prevReviews =>
        prevReviews.map(review =>
          review._id === reviewId
            ? { ...review, helpful: review.helpful + 1 }
            : review
        )
      );
    } catch (error) {
      console.error('Error marking review as helpful:', error);
    }
  };

  const renderStars = (rating, size = 'w-4 h-4') => {
    return [1, 2, 3, 4, 5].map((star) => (
      <span key={star}>
        {star <= rating ? (
          <AiFillStar className={`${size} text-yellow-400`} />
        ) : (
          <AiOutlineStar className={`${size} text-gray-300`} />
        )}
      </span>
    ));
  };

  const renderRatingDistribution = () => {
    if (stats.ratingDistribution.length === 0) return null;

    return (
      <div className="space-y-2">
        {[5, 4, 3, 2, 1].map((rating) => {
          const distribution = stats.ratingDistribution.find(d => d._id === rating);
          const count = distribution ? distribution.count : 0;
          const percentage = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;

          return (
            <div key={rating} className="flex items-center space-x-2">
              <span className="text-sm text-gray-600 w-8">{rating}</span>
              <AiFillStar className="w-4 h-4 text-yellow-400" />
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-yellow-400 h-2 rounded-full"
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
              <span className="text-sm text-gray-600 w-8">{count}</span>
            </div>
          );
        })}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border rounded-lg p-4">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
                  <div className="space-y-1">
                    <div className="h-3 bg-gray-200 rounded w-20"></div>
                    <div className="h-3 bg-gray-200 rounded w-16"></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Review Stats */}
      {stats.totalReviews > 0 && (
        <div className="bg-gray-50 rounded-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Overall Rating */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Overall Rating</h3>
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-3xl font-bold text-gray-900">
                  {stats.averageRating.toFixed(1)}
                </span>
                <div className="flex">
                  {renderStars(Math.round(stats.averageRating), 'w-5 h-5')}
                </div>
              </div>
              <p className="text-sm text-gray-600">
                Based on {stats.totalReviews} review{stats.totalReviews !== 1 ? 's' : ''}
              </p>
            </div>

            {/* Rating Distribution */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Rating Distribution</h3>
              {renderRatingDistribution()}
            </div>
          </div>
        </div>
      )}

      {/* Sort Options */}
      {stats.totalReviews > 0 && (
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            Reviews ({stats.totalReviews})
          </h3>
          <select
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="highest">Highest Rating</option>
            <option value="lowest">Lowest Rating</option>
          </select>
        </div>
      )}

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No reviews yet. Be the first to review this product!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review._id} className="border rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {review.user?.username?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {review.user?.username || 'Anonymous'}
                    </p>
                    <div className="flex items-center space-x-1">
                      {renderStars(review.rating)}
                      <span className="text-sm text-gray-500 ml-2">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                {review.verified && (
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                    Verified Purchase
                  </span>
                )}
              </div>

              {review.comment && (
                <p className="text-gray-700 mb-3">{review.comment}</p>
              )}

              <div className="flex items-center justify-between">
                <button
                  onClick={() => handleMarkHelpful(review._id)}
                  className="flex items-center space-x-1 text-sm text-gray-500 hover:text-blue-600 transition-colors"
                  disabled={!token}
                >
                  <BsHandThumbsUp className="w-4 h-4" />
                  <span>Helpful ({review.helpful})</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2">
          <button
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={!pagination.hasPrev}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Previous
          </button>
          <span className="text-sm text-gray-600">
            Page {pagination.currentPage} of {pagination.totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={!pagination.hasNext}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default ReviewList;
