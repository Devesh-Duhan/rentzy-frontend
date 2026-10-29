"use client";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { ShieldAlert, RefreshCcw, HelpCircle, Clock } from "lucide-react";

const RefundPolicyPage = () => {
  return (
    <div className="min-h-screen bg-background pt-24 pb-20 md:pt-32">
      <div className="app-container max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="section-title text-3xl md:text-5xl lg:text-6xl !leading-tight mb-4">
            Refund <span className="text-indigo-600">Policy</span>
          </h1>
          <p className="section-subtitle text-xs uppercase tracking-wider">
            Last Updated: May 2026 | Seenu Property
          </p>
        </motion.div>

        <div className="space-y-4 md:space-y-5">
          {[
            {
              title: "Mediator Role",
              icon: ShieldAlert,
              content: "Seenu Property is an intermediary platform connecting buyers and sellers. We do not handle payments for property deals directly and therefore cannot issue refunds for property transactions between users.",
              color: "bg-rose-500"
            },
            {
              title: "Listing Fee Refunds",
              icon: Clock,
              content: "Listing fees paid for premium advertisements are generally non-refundable once the ad is live. If a listing is rejected by our compliance team before going live, a refund may be initiated.",
              color: "bg-indigo-600"
            },
            {
              title: "Refund Process",
              icon: RefreshCcw,
              content: "Eligible refunds (for listing fees only) are processed within 5-7 business days to the original payment method used during the transaction.",
              color: "bg-teal-500"
            },
            {
              title: "Dispute Resolution",
              icon: HelpCircle,
              content: "As a mediator, we do not intervene in disputes between buyers and sellers. All financial transactions for property deals are made at the users' own risk.",
              color: "bg-purple-600"
            }
          ].map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="app-card p-5 md:p-6 flex flex-col sm:flex-row gap-5 items-start hover:-translate-y-0.5 transition-all duration-300"
            >
              <div className={`${item.color} w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-md shrink-0`}>
                <item.icon size={22} />
              </div>
              <div>
                <h2 className="font-semibold text-foreground mb-2">{item.title}</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {item.content}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-10 p-6 md:p-8 rounded-2xl bg-indigo-600 text-white text-center"
        >
          <h3 className="text-xl font-bold mb-2">Need further assistance?</h3>
          <p className="text-indigo-100 text-sm mb-6">Our support team is available to help you with listing fee related queries.</p>
          <a href="mailto:support@seenuproperty.com" className="btn-primary bg-white text-indigo-600 hover:bg-white inline-flex">
            Email Support
          </a>
        </motion.div>
      </div>
    </div>
  );
};

export default RefundPolicyPage;
