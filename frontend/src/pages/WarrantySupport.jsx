import React, { useState } from 'react';
import { 
  HiOutlineShieldCheck, 
  HiOutlineSupport, 
  HiOutlinePhone, 
  HiOutlineMail, 
  HiOutlineClock, 
  HiOutlineRefresh, 
  HiOutlineTruck, 
  HiOutlineExclamationTriangle,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineQuestionMarkCircle,
  HiOutlineDocumentText,
  HiOutlineChat,
  HiOutlineUser,
  HiOutlineCalendar
} from 'react-icons/hi';

const WarrantySupport = () => {
  const [activeTab, setActiveTab] = useState('warranty');

  const warrantyInfo = {
    coverage: [
      {
        type: "Supplier Warranty",
        duration: "Varies by Product",
        description: "Warranty coverage provided by our trusted suppliers and manufacturers.",
        covered: [
          "Manufacturing defects from supplier",
          "Product quality issues",
          "Missing or incorrect items",
          "Damaged items during shipping"
        ],
        notCovered: [
          "Damage from misuse or abuse",
          "Normal wear and tear",
          "Damage from accidents or drops",
          "Cosmetic damage that doesn't affect functionality"
        ]
      },
      {
        type: "Platform Guarantee",
        duration: "30 Days",
        description: "Our platform guarantee for order fulfillment and customer satisfaction.",
        covered: [
          "Order not received within expected timeframe",
          "Wrong item received",
          "Item significantly different from description",
          "Platform-related issues"
        ],
        notCovered: [
          "Change of mind after receiving item",
          "Items damaged by customer",
          "Custom or personalized items",
          "Digital products"
        ]
      }
    ],
    process: [
      {
        step: 1,
        title: "Contact Support",
        description: "Reach out to our support team via chat, email, or phone",
        icon: HiOutlineSupport
      },
      {
        step: 2,
        title: "Provide Details",
        description: "Share your order number, photos, and description of the issue",
        icon: HiOutlineDocumentText
      },
      {
        step: 3,
        title: "Supplier Coordination",
        description: "We coordinate with our suppliers to resolve the issue",
        icon: HiOutlineCheckCircle
      },
      {
        step: 4,
        title: "Resolution",
        description: "Receive replacement, refund, or credit based on supplier policy",
        icon: HiOutlineRefresh
      }
    ]
  };

  const supportOptions = [
    {
      title: "Live Chat Support",
      description: "Get instant help from our support team",
      availability: "24/7",
      responseTime: "Immediate",
      icon: HiOutlineChat,
      features: [
        "Real-time assistance",
        "Order tracking help",
        "Product information",
        "Platform support"
      ]
    },
    {
      title: "Email Support",
      description: "Send us detailed questions and get comprehensive answers",
      availability: "24/7",
      responseTime: "Within 24 hours",
      icon: HiOutlineMail,
      features: [
        "Detailed problem descriptions",
        "Photo attachments",
        "Order history access",
        "Supplier coordination"
      ]
    },
    {
      title: "Phone Support",
      description: "Speak directly with our support specialists",
      availability: "Mon-Fri 9AM-6PM EST",
      responseTime: "Immediate",
      icon: HiOutlinePhone,
      features: [
        "Personal assistance",
        "Complex issue resolution",
        "Order status updates",
        "Platform guidance"
      ]
    }
  ];

  const faqItems = [
    {
      question: "How do I know if my product is covered under warranty?",
      answer: "Warranty coverage varies by product and supplier. Check your order confirmation email for specific warranty details. Our platform guarantee covers order fulfillment issues for 30 days."
    },
    {
      question: "What should I do if my product arrives damaged?",
      answer: "Contact our support team immediately with photos of the damage and your order number. We'll coordinate with our suppliers to arrange for a replacement or refund."
    },
    {
      question: "How long does the warranty process take?",
      answer: "Processing times vary depending on the supplier and issue type. We typically coordinate with suppliers within 2-3 business days and provide updates throughout the process."
    },
    {
      question: "Can I return a product if I'm not satisfied?",
      answer: "Return policies vary by supplier. We offer a 30-day platform guarantee for order fulfillment issues. For other returns, we'll coordinate with the supplier's return policy."
    },
    {
      question: "Do you offer international shipping and support?",
      answer: "We work with suppliers who ship internationally. Shipping times and costs vary by location and supplier. Our support team can help coordinate international orders and issues."
    },
    {
      question: "How can I track my warranty claim status?",
      answer: "You can track your warranty claim through our support chat system or by contacting our support team directly. We'll provide regular updates on your claim status and supplier coordination."
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-light text-black mb-4">
            Warranty & <span className="font-semibold">Support</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            We're here to help you with any questions, concerns, or issues you may have. 
            As a dropshipping platform, we work with trusted suppliers to ensure quality products and reliable service.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-12">
          <div className="bg-gray-100 rounded-lg p-1 flex">
            <button
              onClick={() => setActiveTab('warranty')}
              className={`px-6 py-3 rounded-md font-medium transition-all duration-200 ${
                activeTab === 'warranty'
                  ? 'bg-black text-white shadow-sm'
                  : 'text-gray-600 hover:text-black'
              }`}
            >
              Warranty Information
            </button>
            <button
              onClick={() => setActiveTab('support')}
              className={`px-6 py-3 rounded-md font-medium transition-all duration-200 ${
                activeTab === 'support'
                  ? 'bg-black text-white shadow-sm'
                  : 'text-gray-600 hover:text-black'
              }`}
            >
              Support Options
            </button>
            <button
              onClick={() => setActiveTab('faq')}
              className={`px-6 py-3 rounded-md font-medium transition-all duration-200 ${
                activeTab === 'faq'
                  ? 'bg-black text-white shadow-sm'
                  : 'text-gray-600 hover:text-black'
              }`}
            >
              FAQ
            </button>
          </div>
        </div>

        {/* Warranty Information Tab */}
        {activeTab === 'warranty' && (
          <div className="space-y-12">
            {/* Warranty Overview */}
            <div className="card">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center">
                  <HiOutlineShieldCheck className="text-white text-xl" />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-black">Warranty Coverage</h2>
                  <p className="text-gray-600">Comprehensive protection for your purchase</p>
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-8">
                {warrantyInfo.coverage.map((item, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-semibold text-black">{item.type}</h3>
                      <span className="bg-black text-white px-3 py-1 rounded-full text-sm font-medium">
                        {item.duration}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-4">{item.description}</p>
                    
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-black mb-2 flex items-center gap-2">
                          <HiOutlineCheckCircle className="text-green-600" />
                          What's Covered
                        </h4>
                        <ul className="space-y-1">
                          {item.covered.map((item, idx) => (
                            <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                              <span className="text-green-600 mt-1">•</span>
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-black mb-2 flex items-center gap-2">
                          <HiOutlineXCircle className="text-red-600" />
                          What's Not Covered
                        </h4>
                        <ul className="space-y-1">
                          {item.notCovered.map((item, idx) => (
                            <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                              <span className="text-red-600 mt-1">•</span>
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Warranty Process */}
            <div className="card">
                <h2 className="text-2xl font-semibold text-black mb-8">Support Process</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {warrantyInfo.process.map((step) => (
                  <div key={step.step} className="text-center">
                    <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-4">
                      <step.icon className="text-white text-xl" />
                    </div>
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-sm font-semibold text-black">{step.step}</span>
                    </div>
                    <h3 className="font-semibold text-black mb-2">{step.title}</h3>
                    <p className="text-sm text-gray-600">{step.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Support Options Tab */}
        {activeTab === 'support' && (
          <div className="space-y-12">
            {/* Support Options */}
            <div className="grid md:grid-cols-3 gap-8">
              {supportOptions.map((option, index) => (
                <div key={index} className="card">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center">
                      <option.icon className="text-white text-xl" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-black">{option.title}</h3>
                      <p className="text-gray-600">{option.description}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-2">
                      <HiOutlineClock className="text-gray-400" />
                      <span className="text-sm text-gray-600">
                        <strong>Available:</strong> {option.availability}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <HiOutlineUser className="text-gray-400" />
                      <span className="text-sm text-gray-600">
                        <strong>Response:</strong> {option.responseTime}
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-black mb-3">What you can get help with:</h4>
                    <ul className="space-y-2">
                      {option.features.map((feature, idx) => (
                        <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                          <span className="text-black mt-1">•</span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>

            {/* Contact Information */}
            <div className="card">
              <h2 className="text-2xl font-semibold text-black mb-6">Contact Information</h2>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-semibold text-black mb-4">Get in Touch</h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <HiOutlinePhone className="text-gray-400" />
                      <div>
                        <p className="font-medium text-black">Phone Support</p>
                        <p className="text-gray-600">+1 (555) 123-4567</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <HiOutlineMail className="text-gray-400" />
                      <div>
                        <p className="font-medium text-black">Email Support</p>
                        <p className="text-gray-600">support@shirlyblack.com</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <HiOutlineChat className="text-gray-400" />
                      <div>
                        <p className="font-medium text-black">Live Chat</p>
                        <p className="text-gray-600">Available 24/7</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold text-black mb-4">Business Hours</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Monday - Friday</span>
                      <span className="text-black font-medium">9:00 AM - 6:00 PM EST</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Saturday</span>
                      <span className="text-black font-medium">10:00 AM - 4:00 PM EST</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Sunday</span>
                      <span className="text-black font-medium">Closed</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* FAQ Tab */}
        {activeTab === 'faq' && (
          <div className="space-y-8">
            <div className="card">
              <h2 className="text-2xl font-semibold text-black mb-8">Frequently Asked Questions</h2>
              <div className="space-y-6">
                {faqItems.map((item, index) => (
                  <div key={index} className="border-b border-gray-200 pb-6 last:border-b-0">
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <HiOutlineQuestionMarkCircle className="text-white text-sm" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-black mb-3">{item.question}</h3>
                        <p className="text-gray-600 leading-relaxed">{item.answer}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Still Need Help */}
            <div className="card bg-gray-50">
              <div className="text-center">
                <HiOutlineSupport className="text-4xl text-black mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-black mb-2">Still Need Help?</h3>
                <p className="text-gray-600 mb-6">
                  Can't find what you're looking for? Our support team is here to help coordinate with our suppliers.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-medium">
                    Start Live Chat
                  </button>
                  <button className="px-6 py-3 border border-black text-black rounded-lg hover:bg-black hover:text-white transition-colors font-medium">
                    Send Email
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WarrantySupport;
