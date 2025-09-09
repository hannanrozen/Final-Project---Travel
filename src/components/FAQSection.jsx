import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { commonButtons } from "../utils/buttonStyles";

export default function FAQSection({ className = "" }) {
  const [openFAQ, setOpenFAQ] = useState(0);

  const faqs = [
    {
      question: "How do I book a trip on Magnolia?",
      answer:
        "Booking your trip is easy! Simply search for your destination, select your preferred dates, choose from our available options, and complete the secure checkout process. You'll receive instant confirmation via email.",
    },
    {
      question: "Does Magnolia offer travel insurance?",
      answer:
        "Yes, we offer comprehensive travel insurance options to protect your trip. Our insurance covers trip cancellation, medical emergencies, lost luggage, and more. You can add insurance during the booking process.",
    },
    {
      question: "Does Magnolia provide travel recommendations?",
      answer:
        "Absolutely! Our expert travel team curates personalized recommendations based on your preferences, budget, and travel style. We also feature trending destinations and seasonal highlights to inspire your next adventure.",
    },
    {
      question: "Do you offer discounts for group bookings?",
      answer:
        "Yes, we offer special group discounts for bookings of 6 or more people. Contact our group travel specialists for customized packages and additional savings on accommodations, activities, and transportation.",
    },
    {
      question: "Can I cancel or reschedule my trip?",
      answer:
        "Our flexible booking policy allows you to cancel or reschedule most bookings. Cancellation terms vary by provider and booking type. Premium bookings often include free cancellation up to 24-48 hours before travel.",
    },
    {
      question: "What payment methods do you accept?",
      answer:
        "We accept all major credit cards (Visa, MasterCard, American Express), PayPal, bank transfers, and local payment methods including GoPay, OVO, and DANA for Indonesian customers.",
    },
  ];

  return (
    <section className={`py-16 bg-white ${className}`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="text-sm font-semibold text-blue-600 uppercase tracking-wide mb-4 block">
            FAQ
          </span>
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Have questions? We've got answers. Find essential information to
            help plan your perfect trip.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
            >
              <button
                onClick={() => setOpenFAQ(openFAQ === index ? -1 : index)}
                className="w-full px-6 py-6 text-left flex items-center justify-between hover:bg-gray-50 transition-colors rounded-xl"
              >
                <h3 className="text-lg font-semibold text-gray-900 pr-4">
                  {faq.question}
                </h3>
                <div className="flex-shrink-0">
                  {openFAQ === index ? (
                    <ChevronUp className="w-5 h-5 text-blue-500" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              </button>

              {openFAQ === index && (
                <div className="px-6 pb-6">
                  <div className="border-t border-gray-100 pt-4">
                    <p className="text-gray-600 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Contact Support */}
        <div className="mt-12 text-center">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Still have questions?
            </h3>
            <p className="text-gray-600 mb-6">
              Our customer support team is here to help you 24/7
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className={commonButtons.bookNowButton}>
                Contact Support
              </button>
              <button className={commonButtons.learnMoreButton}>
                Live Chat
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
