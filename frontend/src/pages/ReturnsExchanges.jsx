import React, { useState } from 'react';
import { 
  HiOutlineRefresh, 
  HiOutlineClock, 
  HiOutlineShieldCheck, 
  HiOutlineExclamationCircle,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineQuestionMarkCircle,
  HiOutlineDocumentText,
  HiOutlineSupport,
  HiOutlineMail,
  HiOutlinePhone,
  HiOutlineChat,
  HiOutlineTruck,
  HiOutlineUser,
  HiOutlineCalendar
} from 'react-icons/hi';

const ReturnsExchanges = () => {
  const [activeTab, setActiveTab] = useState('policy');

  const returnPolicy = {
    timeframe: "30 Days",
    conditions: [
      {
        title: "Eligible Items",
        items: [
          "Items in original condition",
          "Items with original packaging",
          "Items with tags attached",
          "Items not used or damaged"
        ],
        icon: HiOutlineCheckCircle,
        color: "text-green-600"
      },
      {
        title: "Non-Eligible Items",
        items: [
          "Items damaged by customer",
          "Items without original packaging",
          "Custom or personalized items",
          "Items past 30-day return window"
        ],
        icon: HiOutlineXCircle,
        color: "text-red-600"
      }
    ],
    process: [
      {
        step: 1,
        title: "Contact Support",
        description: "Reach out to our support team with your order number and reason for return",
        timeframe: "Within 30 days",
        icon: HiOutlineSupport
      },
      {
        step: 2,
        title: "Get Return Authorization",
        description: "We'll coordinate with our supplier to get return authorization",
        timeframe: "1-2 business days",
        icon: HiOutlineDocumentText
      },
      {
        step: 3,
        title: "Package & Ship",
        description: "Package the item securely and ship to the designated return address",
        timeframe: "5-7 business days",
        icon: HiOutlineTruck
      },
      {
        step: 4,
        title: "Processing & Refund",
        description: "Item is inspected and refund is processed",
        timeframe: "3-5 business days",
        icon: HiOutlineShieldCheck
      }
    ]
  };

  const exchangePolicy = {
    timeframe: "30 Days",
    conditions: [
      "Items must be in original condition",
      "Items must have original packaging and tags",
      "Exchange for different size, color, or style",
      "Price difference may apply",
      "Subject to supplier availability"
    ],
    process: [
      {
        step: 1,
        title: "Contact Support",
        description: "Contact our support team with your exchange request",
        timeframe: "Within 30 days",
        icon: HiOutlineSupport
      },
      {
        step: 2,
        title: "Exchange Authorization",
        description: "We'll coordinate with our supplier for exchange authorization",
        timeframe: "1-2 business days",
        icon: HiOutlineDocumentText
      },
      {
        step: 3,
        title: "Return Original Item",
        description: "Ship the original item back to the designated address",
        timeframe: "5-7 business days",
        icon: HiOutlineTruck
      },
      {
        step: 4,
        title: "Receive New Item",
        description: "New item is shipped once original is received and inspected",
        timeframe: "3-5 business days",
        icon: HiOutlineShieldCheck
      }
    ]
  };

  const refundInfo = {
    methods: [
      {
        method: "Original Payment Method",
        description: "Refunds are processed back to the original payment method",
        timeframe: "3-5 business days",
        icon: HiOutlineShieldCheck
      },
      {
        method: "Store Credit",
        description: "Option to receive store credit for future purchases",
        timeframe: "Immediate",
        icon: HiOutlineUser
      }
    ],
    timeline: [
      {
        stage: "Return Received",
        timeframe: "5-7 business days",
        description: "Time for return to reach our supplier"
      },
      {
        stage: "Inspection",
        timeframe: "1-2 business days",
        description: "Supplier inspects returned item"
      },
      {
        stage: "Refund Processing",
        timeframe: "3-5 business days",
        description: "Refund is processed to your payment method"
      },
      {
        stage: "Refund Received",
        timeframe: "1-3 business days",
        description: "Refund appears in your account"
      }
    ]
  };

  const faqItems = [
    {
      question: "How long do I have to return an item?",
      answer: "You have 30 days from the delivery date to initiate a return. Contact our support team within this timeframe to start the return process."
    },
    {
      question: "Who pays for return shipping?",
      answer: "Return shipping costs depend on the reason for return. If the item is defective or incorrect, we cover return shipping. For change of mind returns, the customer is responsible for return shipping costs."
    },
    {
      question: "Can I exchange an item for a different size?",
      answer: "Yes! We offer exchanges for different sizes, colors, or styles within 30 days of delivery. Price differences may apply, and exchanges are subject to supplier availability."
    },
    {
      question: "What if my item arrives damaged?",
      answer: "If your item arrives damaged, contact our support team immediately with photos. We'll coordinate with our supplier to arrange for a replacement or refund at no cost to you."
    },
    {
      question: "How long does the refund process take?",
      answer: "Once we receive your return, the refund process typically takes 3-5 business days. The refund will appear in your account within 1-3 business days after processing."
    },
    {
      question: "Can I return items from different suppliers in one package?",
      answer: "No, items from different suppliers must be returned separately as they go to different return addresses. We'll provide specific return instructions for each item."
    },
    {
      question: "What if I receive the wrong item?",
      answer: "If you receive the wrong item, contact our support team immediately. We'll arrange for the correct item to be shipped and provide a prepaid return label for the incorrect item."
    },
    {
      question: "Do you offer store credit?",
      answer: "Yes! You can choose to receive store credit instead of a refund. Store credit is issued immediately and can be used for future purchases on our platform."
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-light text-black mb-4">
            Returns & <span className="font-semibold">Exchanges</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            We want you to be completely satisfied with your purchase. Our returns and exchanges 
            policy is designed to work with our supplier network to ensure a smooth process.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-12">
          <div className="bg-gray-100 rounded-lg p-1 flex">
            <button
              onClick={() => setActiveTab('policy')}
              className={`px-6 py-3 rounded-md font-medium transition-all duration-200 ${
                activeTab === 'policy'
                  ? 'bg-black text-white shadow-sm'
                  : 'text-gray-600 hover:text-black'
              }`}
            >
              Return Policy
            </button>
            <button
              onClick={() => setActiveTab('exchanges')}
              className={`px-6 py-3 rounded-md font-medium transition-all duration-200 ${
                activeTab === 'exchanges'
                  ? 'bg-black text-white shadow-sm'
                  : 'text-gray-600 hover:text-black'
              }`}
            >
              Exchanges
            </button>
            <button
              onClick={() => setActiveTab('refunds')}
              className={`px-6 py-3 rounded-md font-medium transition-all duration-200 ${
                activeTab === 'refunds'
                  ? 'bg-black text-white shadow-sm'
                  : 'text-gray-600 hover:text-black'
              }`}
            >
              Refunds
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

        {/* Return Policy Tab */}
        {activeTab === 'policy' && (
          <div className="space-y-12">
            {/* Return Policy Overview */}
            <div className="card">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center">
                  <HiOutlineRefresh className="text-white text-xl" />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-black">Return Policy</h2>
                  <p className="text-gray-600">30-day return window for most items</p>
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-8">
                {returnPolicy.conditions.map((condition, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <condition.icon className={`text-xl ${condition.color}`} />
                      <h3 className="text-xl font-semibold text-black">{condition.title}</h3>
                    </div>
                    <ul className="space-y-2">
                      {condition.items.map((item, idx) => (
                        <li key={idx} className="text-gray-600 flex items-start gap-2">
                          <span className={`mt-1 ${condition.color}`}>•</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* Return Process */}
            <div className="card">
              <h2 className="text-2xl font-semibold text-black mb-8">Return Process</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {returnPolicy.process.map((step) => (
                  <div key={step.step} className="text-center">
                    <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-4">
                      <step.icon className="text-white text-xl" />
                    </div>
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-sm font-semibold text-black">{step.step}</span>
                    </div>
                    <h3 className="font-semibold text-black mb-2">{step.title}</h3>
                    <p className="text-sm text-gray-600 mb-2">{step.description}</p>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                      {step.timeframe}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Important Notes */}
            <div className="card bg-gray-50">
              <div className="flex items-start gap-4">
                <HiOutlineExclamationCircle className="text-amber-500 text-2xl mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-semibold text-black mb-3">Important Return Notes</h3>
                  <div className="space-y-3 text-gray-700">
                    <p>
                      <strong>Supplier Coordination:</strong> As a dropshipping platform, we coordinate with our suppliers for all returns. Return addresses may vary by supplier.
                    </p>
                    <p>
                      <strong>Return Authorization:</strong> All returns require authorization from our support team. Please contact us before shipping any returns.
                    </p>
                    <p>
                      <strong>Multiple Suppliers:</strong> Orders from different suppliers must be returned separately to their respective return addresses.
                    </p>
                    <p>
                      <strong>Return Shipping:</strong> Return shipping costs depend on the reason for return. We'll provide specific instructions for each return.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Exchanges Tab */}
        {activeTab === 'exchanges' && (
          <div className="space-y-12">
            <div className="card">
              <h2 className="text-2xl font-semibold text-black mb-8">Exchange Policy</h2>
              
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-black mb-4">Exchange Conditions</h3>
                <ul className="space-y-2">
                  {exchangePolicy.conditions.map((condition, index) => (
                    <li key={index} className="text-gray-600 flex items-start gap-2">
                      <HiOutlineCheckCircle className="text-green-600 mt-1 flex-shrink-0" />
                      {condition}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-black mb-6">Exchange Process</h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {exchangePolicy.process.map((step) => (
                    <div key={step.step} className="text-center">
                      <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-4">
                        <step.icon className="text-white text-xl" />
                      </div>
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
                        <span className="text-sm font-semibold text-black">{step.step}</span>
                      </div>
                      <h3 className="font-semibold text-black mb-2">{step.title}</h3>
                      <p className="text-sm text-gray-600 mb-2">{step.description}</p>
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                        {step.timeframe}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Refunds Tab */}
        {activeTab === 'refunds' && (
          <div className="space-y-12">
            <div className="card">
              <h2 className="text-2xl font-semibold text-black mb-8">Refund Information</h2>
              
              <div className="grid md:grid-cols-2 gap-8 mb-8">
                {refundInfo.methods.map((method, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <method.icon className="text-green-600 text-xl" />
                      <h3 className="text-lg font-semibold text-black">{method.method}</h3>
                    </div>
                    <p className="text-gray-600 mb-3">{method.description}</p>
                    <div className="flex items-center gap-2">
                      <HiOutlineClock className="text-gray-400" />
                      <span className="text-sm text-gray-600">Processing time: {method.timeframe}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div>
                <h3 className="text-lg font-semibold text-black mb-6">Refund Timeline</h3>
                <div className="space-y-4">
                  {refundInfo.timeline.map((stage, index) => (
                    <div key={index} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
                      <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-sm font-semibold">{index + 1}</span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-black">{stage.stage}</h4>
                        <p className="text-gray-600 text-sm">{stage.description}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-medium text-black">{stage.timeframe}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* FAQ Tab */}
        {activeTab === 'faq' && (
          <div className="space-y-8">
            <div className="card">
              <h2 className="text-2xl font-semibold text-black mb-8">Returns & Exchanges FAQ</h2>
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
                <h3 className="text-xl font-semibold text-black mb-2">Need Help with Returns?</h3>
                <p className="text-gray-600 mb-6">
                  Our support team is here to help coordinate returns and exchanges with our suppliers.
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

export default ReturnsExchanges;
