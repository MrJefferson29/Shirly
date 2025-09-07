import React from "react";
import { Link } from "react-router-dom";
import { 
  HiOutlineSparkles, 
  HiOutlineShieldCheck, 
  HiOutlineTruck, 
  HiOutlineStar,
  HiOutlineEye,
  HiOutlineHeart,
  HiOutlineGlobe,
  HiOutlineLightningBolt,
  HiOutlineUser
} from "react-icons/hi";
import { 
  AiOutlineArrowRight, 
  AiOutlineCheckCircle,
  AiOutlineGift,
  AiOutlineCrown
} from "react-icons/ai";

const LandingContent = () => {
  return (
    <div className="w-full">
      {/* Hero Features Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-light text-gray-900 mb-6">
              Why Choose <span className="font-semibold">ShirlyBlack</span>?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Experience the perfect blend of style, comfort, and innovation in every frame we create
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center group">
              <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <HiOutlineSparkles className="text-white text-2xl" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Premium Quality</h3>
              <p className="text-gray-600 leading-relaxed">
                Handcrafted frames using the finest materials and cutting-edge technology
              </p>
            </div>

            <div className="text-center group">
              <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <HiOutlineShieldCheck className="text-white text-2xl" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Eye Protection</h3>
              <p className="text-gray-600 leading-relaxed">
                Advanced UV protection and blue light filtering for optimal eye health
              </p>
            </div>

            <div className="text-center group">
              <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <HiOutlineTruck className="text-white text-2xl" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Free Shipping</h3>
              <p className="text-gray-600 leading-relaxed">
                Complimentary worldwide shipping with 30-day hassle-free returns
              </p>
            </div>

            <div className="text-center group">
              <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <HiOutlineStar className="text-white text-2xl" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Expert Care</h3>
              <p className="text-gray-600 leading-relaxed">
                Professional fitting and personalized consultation for the perfect fit
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Vision Statement Section */}
      <section className="py-20 bg-black text-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-light mb-8">
                See the World <span className="font-semibold">Differently</span>
              </h2>
              <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                At ShirlyBlack, we believe that eyewear is more than just a necessity—it's a statement of who you are. 
                Our carefully curated collection combines timeless elegance with modern innovation.
              </p>
              <div className="space-y-4">
                <div className="flex items-center">
                  <AiOutlineCheckCircle className="text-white text-xl mr-4" />
                  <span className="text-gray-300">100% Authentic Materials</span>
                </div>
                <div className="flex items-center">
                  <AiOutlineCheckCircle className="text-white text-xl mr-4" />
                  <span className="text-gray-300">Lifetime Warranty</span>
                </div>
                <div className="flex items-center">
                  <AiOutlineCheckCircle className="text-white text-xl mr-4" />
                  <span className="text-gray-300">Expert Craftsmanship</span>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 h-96 flex items-center justify-center">
                <HiOutlineEye className="text-white text-8xl opacity-20" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Lifestyle Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-light text-gray-900 mb-6">
              Designed for <span className="font-semibold">Every Lifestyle</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From boardroom meetings to weekend adventures, find the perfect pair for every moment
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="group cursor-pointer">
              <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl p-8 h-64 flex flex-col justify-center items-center group-hover:shadow-xl transition-all duration-300">
                <HiOutlineUser className="text-gray-700 text-4xl mb-4 group-hover:scale-110 transition-transform duration-300" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Professional</h3>
                <p className="text-gray-600 text-center">Sophisticated frames for the modern professional</p>
              </div>
            </div>

            <div className="group cursor-pointer">
              <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl p-8 h-64 flex flex-col justify-center items-center group-hover:shadow-xl transition-all duration-300">
                <HiOutlineLightningBolt className="text-gray-700 text-4xl mb-4 group-hover:scale-110 transition-transform duration-300" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Active</h3>
                <p className="text-gray-600 text-center">Durable and comfortable for active lifestyles</p>
              </div>
            </div>

            <div className="group cursor-pointer">
              <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl p-8 h-64 flex flex-col justify-center items-center group-hover:shadow-xl transition-all duration-300">
                <HiOutlineHeart className="text-gray-700 text-4xl mb-4 group-hover:scale-110 transition-transform duration-300" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Casual</h3>
                <p className="text-gray-600 text-center">Trendy and comfortable for everyday wear</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-gray-900 to-black text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-light mb-6">
            Ready to <span className="font-semibold">Transform</span> Your Vision?
          </h2>
          <p className="text-xl text-gray-300 mb-10 leading-relaxed">
            Join thousands of satisfied customers who have discovered their perfect pair. 
            Start your journey to better vision and style today.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/products"
              className="inline-flex items-center px-8 py-4 bg-white text-black font-semibold rounded-lg hover:bg-gray-200 transition-colors duration-200 group"
            >
              Shop Collection
              <AiOutlineArrowRight className="ml-2 group-hover:translate-x-1 transition-transform duration-200" />
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center px-8 py-4 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-black transition-colors duration-200"
            >
              Book Consultation
            </Link>
          </div>

          <div className="mt-12 flex justify-center items-center space-x-8 text-gray-400">
            <div className="flex items-center">
              <HiOutlineGlobe className="text-xl mr-2" />
              <span className="text-sm">Worldwide Shipping</span>
            </div>
            <div className="flex items-center">
              <AiOutlineGift className="text-xl mr-2" />
              <span className="text-sm">Free Gift Wrapping</span>
            </div>
            <div className="flex items-center">
              <HiOutlineShieldCheck className="text-xl mr-2" />
              <span className="text-sm">Secure Checkout</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingContent;
