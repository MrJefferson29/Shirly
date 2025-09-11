import React, { useState } from 'react';
import { 
  HiOutlineMail, 
  HiOutlinePhone, 
  HiOutlineLocationMarker, 
  HiOutlineClock, 
  HiOutlineChat, 
  HiOutlineSupport,
  HiOutlineUser,
  HiOutlineDocumentText,
  HiOutlineCheckCircle,
  HiOutlineExclamationCircle,
  HiOutlineGlobe,
  HiOutlineShieldCheck
} from 'react-icons/hi';

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    category: '',
    message: '',
    orderNumber: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitStatus('success');
      setFormData({
        name: '',
        email: '',
        subject: '',
        category: '',
        message: '',
        orderNumber: ''
      });
    }, 2000);
  };

  const contactMethods = [
    {
      title: "Live Chat Support",
      description: "Get instant help from our support team",
      icon: HiOutlineChat,
      availability: "24/7",
      responseTime: "Immediate",
      contact: "Start Chat",
      color: "bg-black"
    },
    {
      title: "Email Support",
      description: "Send us detailed questions and get comprehensive answers",
      icon: HiOutlineMail,
      availability: "24/7",
      responseTime: "Within 24 hours",
      contact: "support@shirlyblack.com",
      color: "bg-gray-800"
    },
    {
      title: "Phone Support",
      description: "Speak directly with our support specialists",
      icon: HiOutlinePhone,
      availability: "Mon-Fri 9AM-6PM EST",
      responseTime: "Immediate",
      contact: "+1 (555) 123-4567",
      color: "bg-gray-700"
    }
  ];

  const businessInfo = [
    {
      icon: HiOutlineLocationMarker,
      title: "Business Address",
      details: [
        "123 Commerce Street",
        "Business District",
        "New York, NY 10001",
        "United States"
      ]
    },
    {
      icon: HiOutlineClock,
      title: "Business Hours",
      details: [
        "Monday - Friday: 9:00 AM - 6:00 PM EST",
        "Saturday: 10:00 AM - 4:00 PM EST",
        "Sunday: Closed",
        "Holidays: Varies"
      ]
    },
    {
      icon: HiOutlineGlobe,
      title: "Service Areas",
      details: [
        "Worldwide Shipping",
        "International Support",
        "Multi-language Support",
        "Global Supplier Network"
      ]
    }
  ];

  const inquiryCategories = [
    "General Inquiry",
    "Order Support",
    "Product Information",
    "Shipping & Delivery",
    "Returns & Exchanges",
    "Technical Support",
    "Business Partnership",
    "Feedback & Suggestions"
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-light text-black mb-4">
            Contact <span className="font-semibold">Us</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            We're here to help! Get in touch with our support team for any questions, 
            concerns, or assistance you may need. As a dropshipping platform, we work 
            with trusted suppliers to ensure your complete satisfaction.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-12">
          
          {/* Contact Methods */}
          <div className="lg:col-span-1 space-y-8">
            
            {/* Quick Contact Options */}
            <div className="card">
              <h2 className="text-2xl font-semibold text-black mb-6">Get in Touch</h2>
              <div className="space-y-4">
                {contactMethods.map((method, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 ${method.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                        <method.icon className="text-white text-xl" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-black mb-1">{method.title}</h3>
                        <p className="text-sm text-gray-600 mb-2">{method.description}</p>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <HiOutlineClock className="text-gray-400 text-sm" />
                            <span className="text-xs text-gray-500">{method.availability}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <HiOutlineSupport className="text-gray-400 text-sm" />
                            <span className="text-xs text-gray-500">Response: {method.responseTime}</span>
                          </div>
                        </div>
                        <div className="mt-3">
                          <span className="text-sm font-medium text-black">{method.contact}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Business Information */}
            <div className="card">
              <h2 className="text-2xl font-semibold text-black mb-6">Business Information</h2>
              <div className="space-y-6">
                {businessInfo.map((info, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <info.icon className="text-gray-600 text-lg" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-black mb-2">{info.title}</h3>
                      <div className="space-y-1">
                        {info.details.map((detail, idx) => (
                          <p key={idx} className="text-sm text-gray-600">{detail}</p>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Why Choose Us */}
            <div className="card bg-gray-50">
              <h2 className="text-xl font-semibold text-black mb-4">Why Choose ShirlyBlack?</h2>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <HiOutlineShieldCheck className="text-green-600 text-lg" />
                  <span className="text-sm text-gray-700">Trusted Supplier Network</span>
                </div>
                <div className="flex items-center gap-3">
                  <HiOutlineSupport className="text-green-600 text-lg" />
                  <span className="text-sm text-gray-700">24/7 Customer Support</span>
                </div>
                <div className="flex items-center gap-3">
                  <HiOutlineGlobe className="text-green-600 text-lg" />
                  <span className="text-sm text-gray-700">Worldwide Shipping</span>
                </div>
                <div className="flex items-center gap-3">
                  <HiOutlineCheckCircle className="text-green-600 text-lg" />
                  <span className="text-sm text-gray-700">Quality Guarantee</span>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="card">
              <h2 className="text-2xl font-semibold text-black mb-6">Send us a Message</h2>
              
              {submitStatus === 'success' && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <HiOutlineCheckCircle className="text-green-600 text-xl" />
                    <div>
                      <h3 className="font-semibold text-green-800">Message Sent Successfully!</h3>
                      <p className="text-green-700 text-sm">We'll get back to you within 24 hours.</p>
                    </div>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-black mb-2">
                      Full Name *
                    </label>
                    <div className="relative">
                      <HiOutlineUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                        placeholder="Enter your full name"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-black mb-2">
                      Email Address *
                    </label>
                    <div className="relative">
                      <HiOutlineMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                        placeholder="Enter your email address"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="category" className="block text-sm font-medium text-black mb-2">
                      Inquiry Category *
                    </label>
                    <select
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                    >
                      <option value="">Select a category</option>
                      {inquiryCategories.map((category) => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="orderNumber" className="block text-sm font-medium text-black mb-2">
                      Order Number (if applicable)
                    </label>
                    <input
                      type="text"
                      id="orderNumber"
                      name="orderNumber"
                      value={formData.orderNumber}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                      placeholder="Enter order number"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-black mb-2">
                    Subject *
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                    placeholder="Brief description of your inquiry"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-black mb-2">
                    Message *
                  </label>
                  <div className="relative">
                    <HiOutlineDocumentText className="absolute left-3 top-3 text-gray-400" />
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                      rows={6}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent resize-none"
                      placeholder="Please provide detailed information about your inquiry..."
                    />
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <HiOutlineExclamationCircle className="text-amber-500 text-lg mt-1 flex-shrink-0" />
                  <p className="text-sm text-gray-600">
                    <strong>Note:</strong> For order-related inquiries, please include your order number. 
                    We'll coordinate with our suppliers to resolve any issues promptly.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-black text-white py-3 px-6 rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Sending Message...
                    </div>
                  ) : (
                    'Send Message'
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16">
          <div className="card">
            <h2 className="text-2xl font-semibold text-black mb-8 text-center">Frequently Asked Questions</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-semibold text-black mb-3">How quickly will I receive a response?</h3>
                <p className="text-gray-600 text-sm mb-4">
                  We typically respond to all inquiries within 24 hours. Live chat provides immediate assistance.
                </p>
                
                <h3 className="font-semibold text-black mb-3">What information should I include?</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Please include your order number (if applicable), detailed description of the issue, and any relevant photos.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-black mb-3">Do you offer international support?</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Yes! We work with suppliers worldwide and provide support in multiple languages.
                </p>
                
                <h3 className="font-semibold text-black mb-3">Can I track my inquiry status?</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Yes, you can track your inquiry through our support chat system or by contacting us directly.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
