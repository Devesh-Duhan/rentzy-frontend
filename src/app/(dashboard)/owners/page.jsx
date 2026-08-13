"use client";

import Footer from "@/components/Footer";
import Link from "next/link";
import { Rocket, ThumbsUp, HandCoins, ChevronDown, Sparkles, ArrowRight, CheckCircle } from "lucide-react";

const OwnersPage = () => {
  return (
    <div className="bg-slate-50 dark:bg-slate-950 min-h-screen">
      <main>
        <section className="bg-gradient-to-br from-indigo-600 to-indigo-900 text-white py-20 px-4 sm:px-6 lg:px-8 overflow-hidden relative">
          <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="max-w-6xl mx-auto text-center relative z-10 animate-fade-in">
            <h1 className="section-title text-white text-4xl sm:text-5xl lg:text-6xl mb-6">
              Become a Trusted <span className="text-amber-400">Property Owner</span> Partner
            </h1>
            <p className="section-subtitle text-indigo-100 text-lg sm:text-xl mb-10 max-w-3xl mx-auto opacity-90">
              List your properties with confidence, achieve higher occupancy, and get support from our verified tenant network.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/add" className="btn-primary bg-amber-400 text-indigo-900 hover:bg-amber-300 shadow-lg flex items-center gap-2 text-base py-4 px-8">
                Start Listing Now <ArrowRight size={18} />
              </Link>
              <a href="#benefits" className="btn-secondary border-white text-white hover:bg-white hover:text-indigo-900 flex items-center gap-2 text-base py-4 px-8">
                Learn More <ChevronDown size={18} />
              </a>
            </div>
          </div>
        </section>

        <section id="benefits" className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16 animate-fade-in">
              <h2 className="section-title">Why property owners choose us</h2>
              <p className="section-subtitle text-lg">Full support from listing to lease, plus local renter insights and quick payouts.</p>
            </div>
            <div className="grid gap-8 md:grid-cols-3">
              {[
                { icon: Rocket, title: "Fast Listing", desc: "Get your property live in minutes with smart forms and auto-generated content." },
                { icon: ThumbsUp, title: "Verified Leads", desc: "Receive tenant queries from verified users and pre-screened applicants." },
                { icon: HandCoins, title: "Secure Payments", desc: "Transparent deposit, rent schedule, and direct payout to your bank." },
              ].map((benefit, i) => (
                <div key={i} className="app-card p-8 hover:shadow-xl transition-all duration-500 hover:border-indigo-200 group animate-fade-in">
                  <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-500">
                    <benefit.icon size={28} />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{benefit.title}</h3>
                  <p className="section-subtitle leading-relaxed">{benefit.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-white dark:bg-slate-900 py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="section-title">Frequently Asked Questions</h2>
            </div>
            <div className="space-y-4">
              {[
                { q: "How do I list my property?", a: "Click on Add Property, fill the form with complete details, upload images and map. Our verification team will review within 24 hours." },
                { q: "What documents are required?", a: "Proof of ownership, property tax receipts, and valid ID. Optional: NOC, occupancy certificate, and layout plan." },
                { q: "How do I receive rent payments?", a: "Once your tenant signs the lease, we provide automated monthly disbursement to your bank account with invoice support." },
              ].map((faq, i) => (
                <details key={i} className="group app-card p-6 hover:border-indigo-500 transition-colors">
                  <summary className="font-bold cursor-pointer list-none flex justify-between items-center text-slate-800 dark:text-white">
                    {faq.q}
                    <ChevronDown size={18} className="text-indigo-500 transition-transform group-open:rotate-180 flex-shrink-0" />
                  </summary>
                  <p className="mt-4 text-slate-500 dark:text-slate-400 leading-relaxed border-t pt-4 border-slate-100 dark:border-slate-700/50">{faq.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 px-4 bg-gradient-to-br from-indigo-600 to-indigo-900 text-white text-center relative overflow-hidden">
          <div className="relative z-10 max-w-4xl mx-auto animate-fade-in">
            <Sparkles className="w-12 h-12 mx-auto mb-6 text-amber-400" />
            <h2 className="section-title text-white mb-6">Ready to list your property?</h2>
            <p className="section-subtitle text-indigo-100 text-xl mb-10">Join thousands of owners getting consistent leads and faster occupancy.</p>
            <Link href="/register" className="btn-primary bg-white text-indigo-600 hover:bg-indigo-50 shadow-2xl text-base py-5 px-10 flex items-center gap-2 mx-auto w-fit">
              Get Started for Free <ArrowRight size={18} />
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default OwnersPage;
