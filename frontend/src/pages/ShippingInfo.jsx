import React, { useState } from 'react';
import { 
  HiOutlineTruck, 
  HiOutlineClock, 
  HiOutlineGlobe, 
  HiOutlineShieldCheck, 
  HiOutlineExclamationCircle,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineQuestionMarkCircle,
  HiOutlineLocationMarker,
  HiOutlineDocumentText,
  HiOutlineSupport,
  HiOutlineRefresh,
  HiOutlineMail,
  HiOutlinePhone,
  HiOutlineChat
} from 'react-icons/hi';

const ShippingInfo = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const shippingMethods = [
    {
      name: "Standard Shipping",
      description: "Economical shipping option for most products",
      timeframe: "7-14 business days",
      cost: "Free on orders over $50",
      features: [
        "Tracked shipping",
        "Delivery confirmation",
        "Standard handling",
        "Available worldwide"
      ],
      restrictions: [
        "No weekend delivery",
        "Standard processing time",
        "Subject to customs delays"
      ]
    },
    {
      name: "Express Shipping",
      description: "Faster delivery for urgent orders",
      timeframe: "3-7 business days",
      cost: "Additional $9.99",
      features: [
        "Priority processing",
        "Express tracking",
        "Faster delivery",
        "Priority support"
      ],
      restrictions: [
        "Limited to certain regions",
        "Higher cost",
        "Subject to availability"
      ]
    },
    {
      name: "Overnight Shipping",
      description: "Next-day delivery for critical orders",
      timeframe: "1-2 business days",
      cost: "Additional $19.99",
      features: [
        "Next-day delivery",
        "Premium tracking",
        "Priority handling",
        "Guaranteed delivery"
      ],
      restrictions: [
        "Limited availability",
        "Higher cost",
        "Regional restrictions"
      ]
    }
  ];

  const shippingProcess = [
    {
      step: 1,
      title: "Order Placement",
      description: "Your order is placed and payment is processed",
      timeframe: "Immediate",
      icon: HiOutlineCheckCircle
    },
    {
      step: 2,
      title: "Order Processing",
      description: "Order is forwarded to our supplier for fulfillment",
      timeframe: "1-2 business days",
      icon: HiOutlineDocumentText
    },
    {
      step: 3,
      title: "Supplier Processing",
      description: "Supplier prepares and ships your order",
      timeframe: "1-3 business days",
      icon: HiOutlineTruck
    },
    {
      step: 4,
      title: "In Transit",
      description: "Your order is on its way to you",
      timeframe: "Varies by shipping method",
      icon: HiOutlineLocationMarker
    },
    {
      step: 5,
      title: "Delivery",
      description: "Your order arrives at your specified address",
      timeframe: "As per shipping method",
      icon: HiOutlineShieldCheck
    }
  ];

  const internationalInfo = {
    regions: [
      {
        region: "North America",
        countries: ["United States", "Canada", "Mexico"],
        timeframe: "5-10 business days",
        customs: "Duties may apply"
      },
      {
        region: "Europe",
        countries: ["UK", "Germany", "France", "Italy", "Spain", "Netherlands"],
        timeframe: "7-14 business days",
        customs: "VAT and duties may apply"
      },
      {
        region: "Asia Pacific",
        countries: ["Australia", "Japan", "South Korea", "Singapore"],
        timeframe: "10-21 business days",
        customs: "Import duties may apply"
      },
      {
        region: "Other Regions",
        countries: ["Brazil", "India", "South Africa", "Middle East"],
        timeframe: "14-28 business days",
        customs: "Customs clearance required"
      }
    ]
  };

  const faqItems = [
    {
      question: "How is shipping cost calculated?",
      answer: "Shipping costs are set by our admin team for each product based on size, weight, and destination. You'll see the exact shipping cost at checkout before placing your order."
    },
    {
      question: "Why does shipping take longer than regular stores?",
      answer: "As a dropshipping platform, we work with suppliers worldwide. Your order is processed by our supplier, then shipped directly to you, which adds processing time but ensures fresh inventory."
    },
    {
      question: "Can I change my shipping address after ordering?",
      answer: "Address changes are possible within 24 hours of order placement, before the supplier processes your order. Contact our support team immediately if you need to change your address."
    },
    {
      question: "What if my package is lost or damaged?",
      answer: "We coordinate with our suppliers to resolve lost or damaged packages. Contact our support team with your order number and photos (if damaged) for assistance."
    },
    {
      question: "Do you ship to PO Boxes?",
      answer: "Shipping to PO Boxes depends on the supplier and shipping method. Some suppliers may not deliver to PO Boxes. We recommend using a physical address when possible."
    },
    {
      question: "How can I track my order?",
      answer: "Once your order ships, you'll receive a tracking number via email. You can also track your order through our support chat system or by contacting our support team."
    },
    {
      question: "What happens if I'm not home for delivery?",
      answer: "Delivery attempts vary by carrier and location. Most carriers will leave a notice and attempt redelivery or hold the package at a local facility for pickup."
    },
    {
      question: "Are there any shipping restrictions?",
      answer: "Some products may have shipping restrictions due to size, weight, or regulatory requirements. These restrictions are set by our admin team and will be shown at checkout."
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-light text-black mb-4">
            Shipping <span className="font-semibold">Information</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Learn about our shipping methods, delivery times, and policies. 
            As a dropshipping platform, we work with trusted suppliers worldwide 
            to ensure your orders are delivered efficiently and safely.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-12">
          <div className="bg-gray-100 rounded-lg p-1 flex">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-6 py-3 rounded-md font-medium transition-all duration-200 ${
                activeTab === 'overview'
                  ? 'bg-black text-white shadow-sm'
                  : 'text-gray-600 hover:text-black'
              }`}
            >
              Shipping Methods
            </button>
            <button
              onClick={() => setActiveTab('process')}
              className={`px-6 py-3 rounded-md font-medium transition-all duration-200 ${
                activeTab === 'process'
                  ? 'bg-black text-white shadow-sm'
                  : 'text-gray-600 hover:text-black'
              }`}
            >
              Shipping Process
            </button>
            <button
              onClick={() => setActiveTab('international')}
              className={`px-6 py-3 rounded-md font-medium transition-all duration-200 ${
                activeTab === 'international'
                  ? 'bg-black text-white shadow-sm'
                  : 'text-gray-600 hover:text-black'
              }`}
            >
              International
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

        {/* Shipping Methods Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-12">
            {/* Shipping Methods */}
            <div className="card">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center">
                  <HiOutlineTruck className="text-white text-xl" />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-black">Available Shipping Methods</h2>
                  <p className="text-gray-600">Shipping options are set by our admin team for each product</p>
                </div>
              </div>
              
              <div className="grid md:grid-cols-3 gap-8">
                {shippingMethods.map((method, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="mb-4">
                      <h3 className="text-xl font-semibold text-black mb-2">{method.name}</h3>
                      <p className="text-gray-600 text-sm mb-3">{method.description}</p>
                      <div className="flex items-center gap-2 mb-2">
                        <HiOutlineClock className="text-gray-400" />
                        <span className="text-sm font-medium text-black">{method.timeframe}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <HiOutlineShieldCheck className="text-gray-400" />
                        <span className="text-sm font-medium text-black">{method.cost}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-black mb-2 flex items-center gap-2">
                          <HiOutlineCheckCircle className="text-green-600" />
                          Features
                        </h4>
                        <ul className="space-y-1">
                          {method.features.map((feature, idx) => (
                            <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                              <span className="text-green-600 mt-1">•</span>
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-black mb-2 flex items-center gap-2">
                          <HiOutlineExclamationCircle className="text-amber-500" />
                          Restrictions
                        </h4>
                        <ul className="space-y-1">
                          {method.restrictions.map((restriction, idx) => (
                            <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                              <span className="text-amber-500 mt-1">•</span>
                              {restriction}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Important Notes */}
            <div className="card bg-gray-50">
              <div className="flex items-start gap-4">
                <HiOutlineExclamationCircle className="text-amber-500 text-2xl mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-semibold text-black mb-3">Important Shipping Notes</h3>
                  <div className="space-y-3 text-gray-700">
                    <p>
                      <strong>Admin-Controlled Shipping:</strong> Shipping methods and costs are determined by our admin team for each product based on size, weight, and destination requirements.
                    </p>
                    <p>
                      <strong>Supplier Processing:</strong> As a dropshipping platform, orders are processed by our suppliers, which may add 1-3 business days to processing time.
                    </p>
                    <p>
                      <strong>Multiple Shipments:</strong> Orders containing items from different suppliers may arrive in separate packages with different tracking numbers.
                    </p>
                    <p>
                      <strong>Customs & Duties:</strong> International orders may be subject to customs duties and taxes, which are the responsibility of the recipient.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Shipping Process Tab */}
        {activeTab === 'process' && (
          <div className="space-y-12">
            <div className="card">
              <h2 className="text-2xl font-semibold text-black mb-8">Order Processing & Shipping Timeline</h2>
              <div className="space-y-8">
                {shippingProcess.map((step, index) => (
                  <div key={index} className="flex items-start gap-6">
                    <div className="flex-shrink-0">
                      <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center">
                        <step.icon className="text-white text-xl" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-2">
                        <h3 className="text-xl font-semibold text-black">{step.title}</h3>
                        <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">
                          {step.timeframe}
                        </span>
                      </div>
                      <p className="text-gray-600">{step.description}</p>
                    </div>
                    {index < shippingProcess.length - 1 && (
                      <div className="hidden md:block w-px h-16 bg-gray-200 ml-8"></div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Tracking Information */}
            <div className="card">
              <h2 className="text-2xl font-semibold text-black mb-6">Tracking Your Order</h2>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-semibold text-black mb-4">How to Track</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <HiOutlineMail className="text-gray-400 mt-1" />
                      <span className="text-gray-600">Check your email for tracking updates</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <HiOutlineChat className="text-gray-400 mt-1" />
                      <span className="text-gray-600">Use our support chat system</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <HiOutlinePhone className="text-gray-400 mt-1" />
                      <span className="text-gray-600">Contact our support team</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-black mb-4">What to Expect</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <HiOutlineCheckCircle className="text-green-600 mt-1" />
                      <span className="text-gray-600">Tracking number within 2-3 business days</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <HiOutlineRefresh className="text-green-600 mt-1" />
                      <span className="text-gray-600">Regular status updates</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <HiOutlineShieldCheck className="text-green-600 mt-1" />
                      <span className="text-gray-600">Delivery confirmation</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* International Shipping Tab */}
        {activeTab === 'international' && (
          <div className="space-y-12">
            <div className="card">
              <h2 className="text-2xl font-semibold text-black mb-8">International Shipping</h2>
              <div className="grid md:grid-cols-2 gap-8">
                {internationalInfo.regions.map((region, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-6">
                    <h3 className="text-xl font-semibold text-black mb-3">{region.region}</h3>
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-medium text-black mb-1">Countries:</h4>
                        <p className="text-sm text-gray-600">{region.countries.join(", ")}</p>
                      </div>
                      <div>
                        <h4 className="font-medium text-black mb-1">Delivery Time:</h4>
                        <p className="text-sm text-gray-600">{region.timeframe}</p>
                      </div>
                      <div>
                        <h4 className="font-medium text-black mb-1">Customs:</h4>
                        <p className="text-sm text-gray-600">{region.customs}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* International Notes */}
            <div className="card bg-gray-50">
              <h3 className="text-lg font-semibold text-black mb-4">International Shipping Notes</h3>
              <div className="space-y-3 text-gray-700">
                <p>
                  <strong>Customs Duties:</strong> International orders may be subject to customs duties, taxes, and fees imposed by the destination country. These charges are the responsibility of the recipient.
                </p>
                <p>
                  <strong>Delivery Times:</strong> International delivery times are estimates and may vary due to customs processing, local holidays, and other factors beyond our control.
                </p>
                <p>
                  <strong>Restricted Items:</strong> Some products may not be available for international shipping due to local regulations or supplier restrictions.
                </p>
                <p>
                  <strong>Address Requirements:</strong> Please ensure your shipping address is complete and accurate, including postal codes and country codes.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* FAQ Tab */}
        {activeTab === 'faq' && (
          <div className="space-y-8">
            <div className="card">
              <h2 className="text-2xl font-semibold text-black mb-8">Shipping FAQ</h2>
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
                <h3 className="text-xl font-semibold text-black mb-2">Still Have Questions?</h3>
                <p className="text-gray-600 mb-6">
                  Our support team is here to help with any shipping questions or concerns.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-medium">
                    Start Live Chat
                  </button>
                  <button className="px-6 py-3 border border-black text-black rounded-lg hover:bg-black hover:text-white transition-colors font-medium">
                    Contact Support
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

export default ShippingInfo;
