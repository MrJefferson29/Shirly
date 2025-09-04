import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { HiOutlineShoppingBag } from "react-icons/hi";
import { BsBookmarkHeart, BsFillBookmarkHeartFill } from "react-icons/bs";

import {
  useAuthContext,
  useCartContext,
  useProductsContext,
  useWishlistContext,
} from "../contexts";
import { getProductByIdService } from "../api/apiServices";
import { StarRating } from "../components";
import { notify } from "../utils/utils";

const ProductDetails = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { productId } = useParams();
  const { token } = useAuthContext();
  const { getProductById, allProducts } = useProductsContext();
  const { addProductToCart, disableCart } = useCartContext();
  const { addProductToWishlist, deleteProductFromWishlist, disableWish } =
    useWishlistContext();
  const [loading, setLoading] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const product = getProductById(productId);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const response = await getProductByIdService(productId);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    })();
  }, [allProducts]);

  return (
    <div className="md:min-h-[80vh] flex justify-center items-center pt-5 sm:pt-3 pb-2 relative">
      <main className="grid grid-rows-1 sm:grid-cols-2 gap-2 sm:gap-10 ">
                 <section className="relative p-6 bg-black/[0.075] flex items-center justify-center rounded-lg min-h-[400px]">
           {product?.images && product.images.length > 0 ? (
             <div className="w-full h-full flex flex-col">
               {/* Main Image Display */}
               <div className="relative flex items-center justify-center flex-1 w-full">
                 <img
                   src={product.images[selectedImageIndex]}
                   alt={product.name}
                   className="w-4/5 h-4/5 sm:w-3/4 sm:h-3/4 md:w-2/3 md:h-2/3 lg:w-3/5 lg:h-3/5 object-contain transition-all duration-300 ease-in-out cursor-pointer hover:scale-105"
                   onClick={() => setIsFullscreen(true)}
                 />
                
                {/* Image Navigation Arrows */}
                {product.images.length > 1 && (
                  <>
                    <button
                      onClick={() => setSelectedImageIndex(prev => 
                        prev === 0 ? product.images.length - 1 : prev - 1
                      )}
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full shadow-lg transition-all duration-200 hover:scale-110"
                      aria-label="Previous image"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    
                    <button
                      onClick={() => setSelectedImageIndex(prev => 
                        prev === product.images.length - 1 ? 0 : prev + 1
                      )}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full shadow-lg transition-all duration-200 hover:scale-110"
                      aria-label="Next image"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </>
                )}
                
                {/* Image Counter */}
                {product.images.length > 1 && (
                  <div className="absolute bottom-2 right-2 bg-black/60 text-white px-2 py-1 rounded-full text-xs font-medium">
                    {selectedImageIndex + 1} / {product.images.length}
                  </div>
                )}
              </div>
              
                             {/* Image Thumbnails */}
               {product.images.length > 1 && (
                 <div className="flex space-x-3 overflow-x-auto pb-2 justify-center scrollbar-hide mt-4">
                   {product.images.map((image, index) => (
                     <button
                       key={index}
                       onClick={() => setSelectedImageIndex(index)}
                       className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-200 hover:scale-105 ${
                         selectedImageIndex === index
                           ? 'border-amber-500 shadow-lg ring-2 ring-amber-200 scale-105'
                           : 'border-gray-200 hover:border-gray-300'
                       }`}
                       aria-label={`View image ${index + 1}`}
                     >
                       <img
                         src={image}
                         alt={`${product.name} ${index + 1}`}
                         className="w-full h-full object-cover cursor-pointer"
                         loading="lazy"
                         onClick={() => {
                           setSelectedImageIndex(index);
                           setIsFullscreen(true);
                         }}
                       />
                     </button>
                   ))}
                 </div>
               )}
            </div>
          ) : (
                         <div className="flex items-center justify-center flex-1 w-full">
               <img
                 src={product?.image}
                 alt={product.name || "Product image"}
                 className="w-4/5 h-4/5 sm:w-3/4 sm:h-3/4 md:w-2/3 md:h-2/3 lg:w-3/5 lg:h-3/5 object-contain cursor-pointer hover:scale-105 transition-all duration-200"
                 onClick={() => setIsFullscreen(true)}
                 onError={(e) => {
                   e.target.style.display = 'none';
                   e.target.nextSibling.style.display = 'flex';
                 }}
               />
              <div className="hidden items-center justify-center w-full h-full">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 002 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-gray-500 text-sm">No image available</p>
                </div>
              </div>
            </div>
          )}
        </section>

        <section className="p-7 px-10 rounded-md shadow-sm bg-white/[0.7] flex flex-col gap-3 sm:gap-5 ">
          <div className="flex flex-col gap-2">
            <h1 className=" text-2xl sm:text-4xl font-bold">{product?.name}</h1>
            <p className=" text-gray-600 text-sm sm:text-base">
              {product?.description}
            </p>
            <div className="flex items-center gap-1">
              <StarRating />

              <span className="text-xs text-gray-400">
                ({product?.rating || 0}) Rating
              </span>
            </div>
          </div>

                     <div className="flex flex-col gap-2">
             <h2 className="text-lg font-semibold">About Product</h2>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               <div className="space-y-2">
                 <div className="flex justify-between py-1 border-b border-gray-100">
                   <span className="text-gray-500 text-sm">Brand:</span>
                   <span className="font-medium">{product?.brand}</span>
                 </div>
                 <div className="flex justify-between py-1 border-b border-gray-100">
                   <span className="text-gray-500 text-sm">Category:</span>
                   <span className="font-medium">{product?.category}</span>
                 </div>
                 {product?.subcategory && (
                   <div className="flex justify-between py-1 border-b border-gray-100">
                     <span className="text-gray-500 text-sm">Subcategory:</span>
                     <span className="font-medium">{product.subcategory}</span>
                   </div>
                 )}
                 <div className="flex justify-between py-1 border-b border-gray-100">
                   <span className="text-gray-500 text-sm">Gender:</span>
                   <span className="font-medium">{product?.gender || 'Not specified'}</span>
                 </div>
               </div>
               
               <div className="space-y-2">
                 <div className="flex justify-between py-1 border-b border-gray-100">
                   <span className="text-gray-500 text-sm">Weight:</span>
                   <span className="font-medium">{product?.weight || 'Not specified'}</span>
                 </div>
                 {product?.dimensions && (
                   <div className="flex justify-between py-1 border-b border-gray-100">
                     <span className="text-gray-500 text-sm">Dimensions:</span>
                     <span className="font-medium">
                       {product.dimensions.length} × {product.dimensions.width} × {product.dimensions.height} {product.dimensions.unit}
                     </span>
                   </div>
                 )}
                 <div className="flex justify-between py-1 border-b border-gray-100">
                   <span className="text-gray-500 text-sm">Condition:</span>
                   <span className="font-medium">{product?.condition || 'New'}</span>
                 </div>
                 <div className="flex justify-between py-1 border-b border-gray-100">
                   <span className="text-gray-500 text-sm">Stock:</span>
                   <span className={`font-medium ${product?.quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                     {product?.quantity > 0 ? `${product.quantity} available` : 'Out of stock'}
                   </span>
                 </div>
               </div>
             </div>
                      </div>

           {/* Features Section */}
           {product?.features && product.features.length > 0 && (
             <div className="flex flex-col gap-2">
               <h2 className="text-lg font-semibold">Features</h2>
               <div className="flex flex-wrap gap-2">
                 {product.features.map((feature, index) => (
                   <span
                     key={index}
                     className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm font-medium"
                   >
                     {feature}
                   </span>
                 ))}
               </div>
             </div>
           )}

           {/* Tags Section */}
           {product?.tags && product.tags.length > 0 && (
             <div className="flex flex-col gap-2">
               <h2 className="text-lg font-semibold">Tags</h2>
               <div className="flex flex-wrap gap-2">
                 {product.tags.map((tag, index) => (
                   <span
                     key={index}
                     className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium"
                   >
                     #{tag}
                   </span>
                   ))}
               </div>
             </div>
           )}

           {/* Trending Badge */}
           {product?.trending && (
             <div className="flex items-center gap-2">
               <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                 <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                   <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
                 </svg>
                 Trending
               </span>
             </div>
           )}
 
                      <div className="flex flex-col gap-3 pb-10 sm:pb-0">
             <h2 className="text-lg font-semibold">Pricing</h2>
             <div className="flex items-center gap-3">
               <span className="text-2xl sm:text-3xl font-bold text-amber-600">
                 ₹{product?.newPrice || product?.price}
               </span>
               {product?.newPrice && product?.newPrice < product?.price && (
                 <>
                   <span className="text-lg text-gray-500 line-through">
                     ₹{product?.price}
                   </span>
                   <span className="bg-green-100 text-green-600 px-3 py-1 rounded-full text-sm font-semibold">
                     Save ₹{product?.price - product?.newPrice}
                   </span>
                 </>
               )}
             </div>
             
             {/* Discount Percentage */}
             {product?.newPrice && product?.newPrice < product?.price && (
               <div className="flex items-center gap-2">
                 <span className="text-sm text-gray-600">Discount:</span>
                 <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-sm font-medium">
                   {Math.round(((product.price - product.newPrice) / product.price) * 100)}% OFF
                 </span>
               </div>
             )}
           </div>

          <div className={`w-full   flex gap-4 items-center   flex-wrap  `}>
            <button
              className="btn-rounded-secondary flex items-center gap-2 text-sm disabled:cursor-not-allowed"
              disabled={disableCart}
              onClick={() => {
                if (!token) {
                  navigate("/login", { state: { from: location.pathname } });
                  notify("warn", "Please Login to continue");
                } else {
                  if (!product?.inCart) {
                    addProductToCart(product);
                  } else {
                    navigate("/cart");
                  }
                }
              }}
            >
              <HiOutlineShoppingBag />{" "}
              {product?.inCart ? "Go to Bag" : "Add to Bag"}
            </button>

            <button
              className="btn-rounded-primary rounded-full flex items-center gap-2 text-sm disabled:cursor-not-allowed"
              disabled={disableWish}
              onClick={() => {
                if (!token) {
                  navigate("/login", { state: { from: location.pathname } });
                  notify("warn", "Please Login to continue");
                } else {
                  if (product?.inWish) {
                    deleteProductFromWishlist(product._id);
                  } else {
                    addProductToWishlist(product);
                  }
                }
              }}
            >
              {product?.inWish ? (
                <>
                  <BsFillBookmarkHeartFill />
                  <span>Remove from Wishlist</span>
                </>
              ) : (
                <>
                  {" "}
                  <BsBookmarkHeart /> <span>Wishlist Item</span>
                </>
              )}{" "}
            </button>
                     </div>

           {/* Reviews Section */}
           {product?.reviews && product.reviews.length > 0 && (
             <div className="flex flex-col gap-3">
               <h2 className="text-lg font-semibold">Customer Reviews</h2>
               <div className="space-y-3 max-h-48 overflow-y-auto">
                 {product.reviews.slice(0, 3).map((review, index) => (
                   <div key={index} className="bg-gray-50 p-3 rounded-lg">
                     <div className="flex items-center gap-2 mb-2">
                       <div className="flex text-amber-400">
                         {[...Array(5)].map((_, i) => (
                           <svg
                             key={i}
                             className={`w-4 h-4 ${i < review.rating ? 'fill-current' : 'fill-gray-300'}`}
                             viewBox="0 0 20 20"
                           >
                             <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                           </svg>
                         ))}
                       </div>
                       <span className="text-sm text-gray-600">{review.rating}/5</span>
                     </div>
                     {review.comment && (
                       <p className="text-sm text-gray-700">{review.comment}</p>
                     )}
                   </div>
                 ))}
                 {product.reviews.length > 3 && (
                   <p className="text-sm text-gray-500 text-center">
                     +{product.reviews.length - 3} more reviews
                   </p>
                 )}
               </div>
             </div>
           )}
         </section>
       </main>

       {/* Fullscreen Image Modal */}
       {isFullscreen && product?.images && product.images.length > 0 && (
         <div 
           className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
           onClick={() => setIsFullscreen(false)}
         >
           <div className="relative w-full h-full flex items-center justify-center">
             {/* Close Button */}
             <button
               onClick={() => setIsFullscreen(false)}
               className="absolute top-4 right-4 z-10 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full backdrop-blur-sm transition-all duration-200 hover:scale-110"
               aria-label="Close fullscreen view"
             >
               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
               </svg>
             </button>

             {/* Main Fullscreen Image */}
             <img
               src={product.images[selectedImageIndex]}
               alt={product.name}
               className="max-w-full max-h-full object-contain"
               onClick={(e) => e.stopPropagation()}
             />

             {/* Navigation Arrows */}
             {product.images.length > 1 && (
               <>
                 <button
                   onClick={(e) => {
                     e.stopPropagation();
                     setSelectedImageIndex(prev => 
                       prev === 0 ? product.images.length - 1 : prev - 1
                     );
                   }}
                   className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-4 rounded-full backdrop-blur-sm transition-all duration-200 hover:scale-110"
                   aria-label="Previous image"
                 >
                   <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                   </svg>
                 </button>
                 
                 <button
                   onClick={(e) => {
                     e.stopPropagation();
                     setSelectedImageIndex(prev => 
                       prev === product.images.length - 1 ? 0 : prev + 1
                     );
                   }}
                   className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-4 rounded-full backdrop-blur-sm transition-all duration-200 hover:scale-110"
                   aria-label="Next image"
                 >
                   <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                   </svg>
                 </button>
               </>
             )}

             {/* Image Counter */}
             {product.images.length > 1 && (
               <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm">
                 {selectedImageIndex + 1} / {product.images.length}
               </div>
             )}

             {/* Thumbnails at Bottom */}
             {product.images.length > 1 && (
               <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex space-x-3">
                 {product.images.map((image, index) => (
                   <button
                     key={index}
                     onClick={(e) => {
                       e.stopPropagation();
                       setSelectedImageIndex(index);
                     }}
                     className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-200 hover:scale-110 ${
                       selectedImageIndex === index
                         ? 'border-amber-400 shadow-lg ring-2 ring-amber-300'
                         : 'border-white/30 hover:border-white/50'
                     }`}
                     aria-label={`View image ${index + 1}`}
                   >
                     <img
                       src={image}
                       alt={`${product.name} ${index + 1}`}
                       className="w-full h-full object-cover"
                     />
                   </button>
                 ))}
               </div>
             )}
           </div>
         </div>
       )}
     </div>
   );
 };

export default ProductDetails;
