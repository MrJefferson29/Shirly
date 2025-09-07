import React from "react";
import { Link } from "react-router-dom";
import {
  AiOutlineMail,
  AiOutlinePhone,
  AiOutlineEnvironment,
  AiOutlineInstagram,
  AiOutlineFacebook,
  AiOutlineYoutube,
  AiOutlineTwitter,
} from "react-icons/ai";
import {
  HiOutlineSupport,
  HiOutlineShieldCheck,
  HiOutlineTruck,
  HiOutlineRefresh,
  HiOutlineEye,
  HiOutlineHeart,
} from "react-icons/hi";
import { BiMessage } from "react-icons/bi";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-black border-t border-gray-800 mt-auto w-full overflow-hidden">
      {/* Main Footer Content */}
      <div className="w-full px-6 sm:px-8 lg:px-12 py-16 max-w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12 max-w-full">
          
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center mr-4">
                <HiOutlineEye className="text-black text-xl" />
              </div>
              <h3 className="text-3xl font-light text-white tracking-wide">ShirlyBlack</h3>
            </div>
            <p className="text-gray-300 mb-8 leading-relaxed text-base max-w-md">
              Elevating vision with sophisticated eyewear that seamlessly blends fashion, 
              function, and healthcare excellence. Discover your perfect frame.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-4">
              <div className="flex items-center text-gray-300">
                <AiOutlineMail className="w-5 h-5 mr-4 text-white" />
                <span className="text-sm font-medium">support@eyesome.com</span>
              </div>
              <div className="flex items-center text-gray-300">
                <AiOutlinePhone className="w-5 h-5 mr-4 text-white" />
                <span className="text-sm font-medium">+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center text-gray-300">
                <AiOutlineEnvironment className="w-5 h-5 mr-4 text-white" />
                <span className="text-sm font-medium">123 Fashion Avenue, Style District</span>
              </div>
            </div>
          </div>

          {/* Collections Section */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-6">Collections</h4>
            <ul className="space-y-4">
              <li>
                <Link 
                  to="/products?category=sunglasses" 
                  className="text-gray-300 hover:text-white transition-colors duration-200 text-sm font-medium"
                >
                  Sunglasses
                </Link>
              </li>
              <li>
                <Link 
                  to="/products?category=eyeglasses" 
                  className="text-gray-300 hover:text-white transition-colors duration-200 text-sm font-medium"
                >
                  Prescription Glasses
                </Link>
              </li>
              <li>
                <Link 
                  to="/products?category=sports" 
                  className="text-gray-300 hover:text-white transition-colors duration-200 text-sm font-medium"
                >
                  Sports Eyewear
                </Link>
              </li>
              <li>
                <Link 
                  to="/products?category=reading" 
                  className="text-gray-300 hover:text-white transition-colors duration-200 text-sm font-medium"
                >
                  Reading Glasses
                </Link>
              </li>
              <li>
                <Link 
                  to="/products?category=blue-light" 
                  className="text-gray-300 hover:text-white transition-colors duration-200 text-sm font-medium"
                >
                  Blue Light Protection
                </Link>
              </li>
            </ul>
          </div>

          {/* Healthcare & Services */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-6">Healthcare</h4>
            <ul className="space-y-4">
              <li>
                <Link 
                  to="/eye-exam" 
                  className="text-gray-300 hover:text-white transition-colors duration-200 text-sm font-medium flex items-center"
                >
                  <HiOutlineEye className="w-4 h-4 mr-3" />
                  Eye Examination
                </Link>
              </li>
              <li>
                <Link 
                  to="/prescription" 
                  className="text-gray-300 hover:text-white transition-colors duration-200 text-sm font-medium"
                >
                  Prescription Services
                </Link>
              </li>
              <li>
                <Link 
                  to="/lens-options" 
                  className="text-gray-300 hover:text-white transition-colors duration-200 text-sm font-medium"
                >
                  Lens Options
                </Link>
              </li>
              <li>
                <Link 
                  to="/frame-fitting" 
                  className="text-gray-300 hover:text-white transition-colors duration-200 text-sm font-medium"
                >
                  Frame Fitting
                </Link>
              </li>
              <li>
                <Link 
                  to="/warranty" 
                  className="text-gray-300 hover:text-white transition-colors duration-200 text-sm font-medium flex items-center"
                >
                  <HiOutlineShieldCheck className="w-4 h-4 mr-3" />
                  Warranty & Care
                </Link>
              </li>
            </ul>
          </div>

          {/* Support & Social */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-6">Support</h4>
            <ul className="space-y-4 mb-8">
              <li>
                <Link 
                  to="/contact" 
                  className="text-gray-300 hover:text-white transition-colors duration-200 text-sm font-medium flex items-center"
                >
                  <HiOutlineSupport className="w-4 h-4 mr-3" />
                  Contact Us
                </Link>
              </li>
              <li>
                <Link 
                  to="/shipping" 
                  className="text-gray-300 hover:text-white transition-colors duration-200 text-sm font-medium flex items-center"
                >
                  <HiOutlineTruck className="w-4 h-4 mr-3" />
                  Shipping Info
                </Link>
              </li>
              <li>
                <Link 
                  to="/returns" 
                  className="text-gray-300 hover:text-white transition-colors duration-200 text-sm font-medium flex items-center"
                >
                  <HiOutlineRefresh className="w-4 h-4 mr-3" />
                  Returns
                </Link>
              </li>
              <li>
                <Link 
                  to="/size-guide" 
                  className="text-gray-300 hover:text-white transition-colors duration-200 text-sm font-medium"
                >
                  Size Guide
                </Link>
              </li>
            </ul>

            {/* Newsletter */}
            <div className="mb-6">
              <h5 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">Stay Updated</h5>
              <p className="text-gray-300 text-xs mb-3 leading-relaxed">
                Get the latest in eyewear fashion and eye health tips.
              </p>
              <div className="flex w-full max-w-sm">
                <input
                  type="email"
                  placeholder="Your email address"
                  className="flex-1 px-4 py-2 text-sm border border-gray-600 rounded-l-md focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent bg-gray-800 text-white placeholder-gray-400 min-w-0"
                />
                <button className="px-4 py-2 bg-white text-black text-sm rounded-r-md hover:bg-gray-200 transition-colors duration-200 font-medium whitespace-nowrap">
                  Subscribe
                </button>
              </div>
            </div>

            {/* Social Media */}
            <div>
              <h5 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">Follow Us</h5>
              <div className="flex space-x-3">
                <a
                  href="https://www.instagram.com/eyesome"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center text-gray-300 hover:text-white hover:bg-gray-700 transition-all duration-200"
                >
                  <AiOutlineInstagram className="w-4 h-4" />
                </a>
                <a
                  href="https://www.facebook.com/eyesome"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center text-gray-300 hover:text-white hover:bg-gray-700 transition-all duration-200"
                >
                  <AiOutlineFacebook className="w-4 h-4" />
                </a>
                <a
                  href="https://twitter.com/eyesome"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center text-gray-300 hover:text-white hover:bg-gray-700 transition-all duration-200"
                >
                  <AiOutlineTwitter className="w-4 h-4" />
                </a>
                <a
                  href="https://www.youtube.com/eyesome"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center text-gray-300 hover:text-white hover:bg-gray-700 transition-all duration-200"
                >
                  <AiOutlineYoutube className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-gray-800 bg-gray-900 w-full overflow-hidden">
        <div className="w-full px-6 sm:px-8 lg:px-12 py-6 max-w-full">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            
            {/* Copyright */}
            <div className="text-center md:text-left">
              <p className="text-gray-400 text-xs">
                © {currentYear} ShirlyBlack. All rights reserved.
              </p>
            </div>

            {/* Legal Links */}
            <div className="flex flex-wrap justify-center md:justify-end space-x-4 md:space-x-8 max-w-full">
              <Link 
                to="/privacy" 
                className="text-gray-400 hover:text-white transition-colors duration-200 text-xs font-medium"
              >
                Privacy Policy
              </Link>
              <Link 
                to="/terms" 
                className="text-gray-400 hover:text-white transition-colors duration-200 text-xs font-medium"
              >
                Terms of Service
              </Link>
              <Link 
                to="/cookies" 
                className="text-gray-400 hover:text-white transition-colors duration-200 text-xs font-medium"
              >
                Cookie Policy
              </Link>
            </div>

            {/* Developer Credit */}
            <div className="text-center md:text-right">
              <p className="text-gray-400 text-xs">
                Crafted with <HiOutlineHeart className="inline w-3 h-3 text-red-500" /> by{" "}
                <a
                  href="https://github.com/MrJefferson29"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white hover:text-gray-300 transition-colors duration-200 font-medium"
                >
                  Jefferson
        </a>
      </p>
    </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
