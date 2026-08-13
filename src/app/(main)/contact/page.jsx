"use client";

import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Send, MessageCircle, Clock, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { toast } from "react-hot-toast";

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      toast.success("Message sent! Our team will get back to you soon.");
      setForm({ name: "", email: "", subject: "", message: "" });
      setIsSubmitting(false);
    }, 1500);
  };

  const contactInfo = [
    { icon: Phone, title: "Phone Support", detail: "+91 800-RNTZ-PRO", desc: "Mon-Sat 9am to 6pm" },
    { icon: Mail, title: "Email Support", detail: "contact@rentzypro.com", desc: "Response within 24h" },
    { icon: MapPin, title: "Our Office", detail: "Cyber City, Gurgaon", desc: "Haryana, India 122002" },
  ];

  return (
    <main className="min-h-screen bg-background">
      <section className="pt-24 pb-16 md:pt-32 md:pb-20">
        <div className="app-container">
          <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <span className="pill bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-800/50 mb-6">
                <MessageCircle size={14} /> Connect With Us
              </span>
            </motion.div>
            <h1 className="section-title text-3xl md:text-5xl lg:text-6xl !leading-tight mb-4 mt-4">
              Let's Start a <span className="text-indigo-600">Conversation</span>
            </h1>
            <p className="section-subtitle text-base md:text-lg">
              Have a question about properties or encounter an issue? Our team of experts is dedicated to assisting you every step of the way.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-12">
            {contactInfo.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="app-card p-6 hover:-translate-y-1 transition-all duration-300"
              >
                <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-600 mb-4">
                  <item.icon size={22} />
                </div>
                <h3 className="font-semibold text-foreground mb-1">{item.title}</h3>
                <p className="text-indigo-600 font-medium text-sm mb-2">{item.detail}</p>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Clock size={12} /> {item.desc}
                </div>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              className="app-card p-6 md:p-10"
            >
              <h2 className="section-title text-2xl mb-6">Send us a message</h2>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">Full Name</label>
                    <input
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      type="text"
                      placeholder="John Doe"
                      className="input-field"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">Email Address</label>
                    <input
                      required
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      type="email"
                      placeholder="john@example.com"
                      className="input-field"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Subject</label>
                  <input
                    required
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    type="text"
                    placeholder="Inquiry about pricing"
                    className="input-field"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Message</label>
                  <textarea
                    required
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    rows={5}
                    placeholder="How can we help you?"
                    className="input-field resize-none"
                  />
                </div>
                <button
                  disabled={isSubmitting}
                  className="btn-primary w-full flex items-center justify-center gap-2"
                >
                  {isSubmitting ? "Processing..." : <>Send Message <Send size={16} /></>}
                </button>
              </form>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-8 lg:pt-4"
            >
              <div>
                <h3 className="section-title text-2xl mb-3">Support Excellence</h3>
                <p className="text-muted-foreground leading-relaxed">
                  At rentzypro, we don't just provide a platform; we provide a community. Our support team is trained to handle complex real estate inquiries and ensure your transitions are smooth.
                </p>
              </div>

              <div className="space-y-4">
                {[
                  "24/7 Priority Support for Members",
                  "Direct Connection with Area Managers",
                  "Verification Assistance for Sellers",
                  "Legal Guidance for Documents"
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 rounded-lg flex items-center justify-center">
                      <CheckCircle2 size={18} />
                    </div>
                    <span className="text-sm font-semibold text-foreground">{item}</span>
                  </div>
                ))}
              </div>

              <div className="glass-effect bg-indigo-600/10 dark:bg-indigo-600/20 border-indigo-200 dark:border-indigo-800/50 rounded-2xl p-6">
                <h4 className="text-lg font-bold text-indigo-600 dark:text-indigo-400 mb-1">Emergency Help?</h4>
                <p className="text-sm text-muted-foreground mb-4">Call our priority hotline for immediate safety assistance.</p>
                <button className="btn-primary text-sm">
                  Call 1-800-SAFE-RE
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
