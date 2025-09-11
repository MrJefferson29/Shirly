import React, { useState, useEffect } from 'react';
import { 
  HiOutlineCreditCard, 
  HiOutlineShieldCheck, 
  HiOutlineClock, 
  HiOutlineExclamationCircle,
  HiOutlineCheckCircle,
  HiOutlineQuestionMarkCircle,
  HiOutlineSupport,
  HiOutlineMail,
  HiOutlinePhone,
  HiOutlineChat,
  HiOutlineGlobe,
  HiOutlineLockClosed,
  HiOutlineUser
} from 'react-icons/hi';

const PaymentOptions = () => {
  const [activeTab, setActiveTab] = useState('methods');
  const [paymentMethods, setPaymentMethods] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch payment methods from backend
  useEffect(() => {
    const fetchPaymentMethods = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL || 'https://shirlyblack.onrender.com/api'}/payments/methods`);
        const data = await response.json();
        if (data.success) {
          setPaymentMethods(data.data.paymentMethods);
        }
      } catch (error) {
        console.error('Error fetching payment methods:', error);
        // Fallback payment methods if API fails
        setPaymentMethods({
          card: {
            name: 'Credit/Debit Card',
            description: 'Visa, Mastercard, American Express',
            icon: '💳',
            enabled: true
          },
          apple_pay: {
            name: 'Apple Pay',
            description: 'Pay with Apple Pay',
            icon: '🍎',
            enabled: true
          },
          google_pay: {
            name: 'Google Pay',
            description: 'Pay with Google Pay',
            icon: '📱',
            enabled: true
          },
          samsung_pay: {
            name: 'Samsung Pay',
            description: 'Pay with Samsung Pay',
            icon: '📱',
            enabled: true
          },
          cash_app: {
            name: 'Cash App',
            description: 'Pay with Cash App',
            icon: '💰',
            enabled: true
          }
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentMethods();
  }, []);

  const securityFeatures = [
    {
      title: "SSL Encryption",
      description: "All payment data is encrypted using industry-standard SSL technology",
      icon: HiOutlineLockClosed
    },
    {
      title: "PCI Compliance",
      description: "We are PCI DSS compliant to ensure secure payment processing",
      icon: HiOutlineShieldCheck
    },
    {
      title: "Fraud Protection",
      description: "Advanced fraud detection and prevention systems",
      icon: HiOutlineExclamationCircle
    },
    {
      title: "Secure Storage",
      description: "Payment information is securely stored and never shared",
      icon: HiOutlineUser
    }
  ];

  const paymentProcess = [
    {
      step: 1,
      title: "Select Payment Method",
      description: "Choose from our secure payment options at checkout",
      icon: HiOutlineCreditCard
    },
    {
      step: 2,
      title: "Enter Payment Details",
      description: "Securely enter your payment information",
      icon: HiOutlineLockClosed
    },
    {
      step: 3,
      title: "Payment Processing",
      description: "Your payment is processed securely through our payment gateway",
      icon: HiOutlineShieldCheck
    },
    {
      step: 4,
      title: "Order Confirmation",
      description: "Receive confirmation of your successful payment and order",
      icon: HiOutlineCheckCircle
    }
  ];

  const faqItems = [
    {
      question: "What payment methods do you accept?",
      answer: "We accept credit/debit cards (Visa, Mastercard, American Express), Apple Pay, Google Pay, Samsung Pay, and Cash App. All payments are processed securely through Stripe."
    },
    {
      question: "Is my payment information secure?",
      answer: "Yes! We use industry-standard SSL encryption and are PCI DSS compliant. Your payment information is processed securely and never stored on our servers."
    },
    {
      question: "Can I use multiple payment methods for one order?",
      answer: "Currently, we only support one payment method per order. You can choose the most convenient payment method for your purchase."
    },
    {
      question: "Do you store my payment information?",
      answer: "No, we do not store your payment information. All payment data is processed securely through Stripe and is not retained on our servers."
    },
    {
      question: "What if my payment fails?",
      answer: "If your payment fails, please check your payment method details and try again. You can also contact our support team for assistance with payment issues."
    },
    {
      question: "Do you accept international payment methods?",
      answer: "We accept international credit and debit cards. However, some digital wallet options may be limited to certain regions."
    },
    {
      question: "Can I get a refund if I'm not satisfied?",
      answer: "Yes! We offer a 30-day return policy. Refunds are processed back to your original payment method within 3-5 business days."
    },
    {
      question: "Are there any additional fees for using certain payment methods?",
      answer: "No, there are no additional fees for using any of our accepted payment methods. The price you see at checkout is the final amount you'll be charged."
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading payment options...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-light text-black mb-4">
            Payment <span className="font-semibold">Options</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            We offer secure and convenient payment options to make your shopping experience 
            smooth and worry-free. All payments are processed securely through our trusted payment partners.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-12">
          <div className="bg-gray-100 rounded-lg p-1 flex">
            <button
              onClick={() => setActiveTab('methods')}
              className={`px-6 py-3 rounded-md font-medium transition-all duration-200 ${
                activeTab === 'methods'
                  ? 'bg-black text-white shadow-sm'
                  : 'text-gray-600 hover:text-black'
              }`}
            >
              Payment Methods
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`px-6 py-3 rounded-md font-medium transition-all duration-200 ${
                activeTab === 'security'
                  ? 'bg-black text-white shadow-sm'
                  : 'text-gray-600 hover:text-black'
              }`}
            >
              Security
            </button>
            <button
              onClick={() => setActiveTab('process')}
              className={`px-6 py-3 rounded-md font-medium transition-all duration-200 ${
                activeTab === 'process'
                  ? 'bg-black text-white shadow-sm'
                  : 'text-gray-600 hover:text-black'
              }`}
            >
              Payment Process
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

        {/* Payment Methods Tab */}
        {activeTab === 'methods' && (
          <div className="space-y-12">
            {/* Available Payment Methods */}
            <div className="card">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center">
                  <HiOutlineCreditCard className="text-white text-xl" />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-black">Accepted Payment Methods</h2>
                  <p className="text-gray-600">Secure payment options for your convenience</p>
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {paymentMethods && Object.entries(paymentMethods).map(([key, method]) => (
                  <div key={key} className={`border rounded-lg p-6 transition-all duration-200 ${
                    method.enabled 
                      ? 'border-gray-200 hover:shadow-md' 
                      : 'border-gray-100 bg-gray-50 opacity-60'
                  }`}>
                    <div className="text-center">
                      <div className="text-4xl mb-3">{method.icon}</div>
                      <h3 className="text-lg font-semibold text-black mb-2">{method.name}</h3>
                      <p className="text-gray-600 text-sm mb-4">{method.description}</p>
                      <div className="flex items-center justify-center gap-2">
                        {method.enabled ? (
                          <>
                            <HiOutlineCheckCircle className="text-green-600" />
                            <span className="text-sm text-green-600 font-medium">Available</span>
                          </>
                        ) : (
                          <>
                            <HiOutlineExclamationCircle className="text-gray-400" />
                            <span className="text-sm text-gray-400">Coming Soon</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Information */}
            <div className="grid md:grid-cols-2 gap-8">
              <div className="card">
                <h3 className="text-xl font-semibold text-black mb-4">Payment Processing</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <HiOutlineShieldCheck className="text-green-600" />
                    <span className="text-gray-700">Processed by Stripe</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <HiOutlineGlobe className="text-green-600" />
                    <span className="text-gray-700">International support</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <HiOutlineClock className="text-green-600" />
                    <span className="text-gray-700">Instant processing</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <HiOutlineLockClosed className="text-green-600" />
                    <span className="text-gray-700">Secure encryption</span>
                  </div>
                </div>
              </div>

              <div className="card">
                <h3 className="text-xl font-semibold text-black mb-4">Supported Countries</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <HiOutlineGlobe className="text-blue-600" />
                    <span className="text-gray-700">United States</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <HiOutlineGlobe className="text-blue-600" />
                    <span className="text-gray-700">Canada</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <HiOutlineGlobe className="text-blue-600" />
                    <span className="text-gray-700">United Kingdom</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <HiOutlineGlobe className="text-blue-600" />
                    <span className="text-gray-700">And more...</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <div className="space-y-12">
            <div className="card">
              <h2 className="text-2xl font-semibold text-black mb-8">Payment Security</h2>
              <div className="grid md:grid-cols-2 gap-8">
                {securityFeatures.map((feature, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <feature.icon className="text-green-600 text-xl" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-black mb-2">{feature.title}</h3>
                        <p className="text-gray-600">{feature.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Security Certifications */}
            <div className="card bg-gray-50">
              <h3 className="text-xl font-semibold text-black mb-6">Security Certifications</h3>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <HiOutlineShieldCheck className="text-green-600 text-2xl" />
                  </div>
                  <h4 className="font-semibold text-black mb-1">PCI DSS</h4>
                  <p className="text-sm text-gray-600">Payment Card Industry Data Security Standard</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <HiOutlineLockClosed className="text-blue-600 text-2xl" />
                  </div>
                  <h4 className="font-semibold text-black mb-1">SSL/TLS</h4>
                  <p className="text-sm text-gray-600">Secure Socket Layer Encryption</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <HiOutlineExclamationCircle className="text-purple-600 text-2xl" />
                  </div>
                  <h4 className="font-semibold text-black mb-1">Fraud Protection</h4>
                  <p className="text-sm text-gray-600">Advanced fraud detection</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Payment Process Tab */}
        {activeTab === 'process' && (
          <div className="space-y-12">
            <div className="card">
              <h2 className="text-2xl font-semibold text-black mb-8">How Payment Works</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {paymentProcess.map((step) => (
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

            {/* Payment Timeline */}
            <div className="card">
              <h3 className="text-xl font-semibold text-black mb-6">Payment Timeline</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <HiOutlineCheckCircle className="text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-black">Payment Authorization</h4>
                    <p className="text-gray-600 text-sm">Immediate - Your payment method is verified</p>
                  </div>
                  <span className="text-sm font-medium text-green-600">Instant</span>
                </div>
                <div className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <HiOutlineClock className="text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-black">Order Processing</h4>
                    <p className="text-gray-600 text-sm">1-2 business days - Order is forwarded to supplier</p>
                  </div>
                  <span className="text-sm font-medium text-blue-600">1-2 days</span>
                </div>
                <div className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <HiOutlineShieldCheck className="text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-black">Payment Settlement</h4>
                    <p className="text-gray-600 text-sm">2-3 business days - Payment is settled</p>
                  </div>
                  <span className="text-sm font-medium text-purple-600">2-3 days</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* FAQ Tab */}
        {activeTab === 'faq' && (
          <div className="space-y-8">
            <div className="card">
              <h2 className="text-2xl font-semibold text-black mb-8">Payment FAQ</h2>
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
                <h3 className="text-xl font-semibold text-black mb-2">Need Help with Payments?</h3>
                <p className="text-gray-600 mb-6">
                  Our support team is here to help with any payment questions or issues.
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

export default PaymentOptions;
