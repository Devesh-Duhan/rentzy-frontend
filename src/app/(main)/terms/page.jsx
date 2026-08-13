"use client";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { Scale, AlertTriangle, Info } from "lucide-react";

export default function TermsOfService() {
  const sections = [
    {
      title: "1. Introduction",
      content: "Welcome to Seenu Property. These Terms and Conditions govern your use of our website and services. By accessing Seenu Property, you agree to abide by these terms. If you do not agree, please refrain from using our services."
    },
    {
      title: "2. Nature of Service (Intermediary)",
      content: "Seenu Property acts only as a mediator and listing service provider. We provide a platform that connects property sellers with potential buyers or tenants. We do not participate in actual deals or transactions."
    },
    {
      title: "3. No Responsibility / Disclaimer",
      content: "Seenu Property is NOT responsible for the authenticity of property listings, any fraud, disputes, or payment issues that may arise between users. We do not verify the legal status of properties or the identity of users beyond basic registration. All deals happen directly between users at their own risk."
    },
    {
      title: "4. User Responsibilities",
      content: "Users are responsible for verifying the property details, legal documents, and ownership before entering into any transaction. Users must provide accurate information and must not post misleading or fraudulent listings."
    },
    {
      title: "5. Account & Security",
      content: "You are responsible for maintaining the confidentiality of your account credentials. Any activity performed through your account is your responsibility. Notify us immediately if you suspect any unauthorized access."
    },
    {
      title: "6. Listing Rules",
      content: "Listings must be real estate related, accurate, and not violate any local laws. We reserve the right to remove any listing that we deem inappropriate, fraudulent, or in violation of these terms."
    },
    {
      title: "7. Limitation of Liability",
      content: "To the maximum extent permitted by law, Seenu Property shall not be liable for any direct, indirect, incidental, or consequential damages arising from your use of the platform or any interactions between users."
    },
    {
      title: "8. Termination of Access",
      content: "We reserve the right to terminate or suspend your access to Seenu Property at our sole discretion, without notice, for conduct that we believe violates these Terms or is harmful to other users or our business interests."
    },
    {
      title: "9. Changes to Terms",
      content: "We may update these Terms & Conditions periodically. Continued use of the platform after changes are posted constitutes your acceptance of the new terms."
    },
    {
      title: "10. Contact Information",
      content: "For any legal inquiries, please contact us at legal@seenuproperty.com."
    }
  ];

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <section className="pt-24 pb-12 md:pt-32 md:pb-16">
        <div className="app-container max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-600 mx-auto mb-4">
              <Scale size={22} />
            </div>
            <span className="pill bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-800/50 mb-4">
              Legal Compliance
            </span>
            <h1 className="section-title text-3xl md:text-5xl lg:text-6xl !leading-tight mb-4 mt-4">
              Terms & Conditions
            </h1>
            <p className="section-subtitle text-sm">
              Last Updated: May 4, 2026 | Seenu Property
            </p>
          </motion.div>
        </div>
      </section>

      {/* Crucial Notice */}
      <section className="py-8 bg-rose-50 dark:bg-rose-950/20 border-y border-rose-100 dark:border-rose-900/30">
        <div className="app-container max-w-4xl flex flex-col md:flex-row items-start gap-4">
          <div className="w-12 h-12 bg-rose-100 dark:bg-rose-900/50 rounded-full flex items-center justify-center text-rose-600 shrink-0">
            <AlertTriangle size={24} />
          </div>
          <div>
            <h3 className="text-base font-bold text-rose-700 dark:text-rose-400 mb-1">Crucial Disclaimer</h3>
            <p className="text-sm text-rose-600 dark:text-rose-300 font-medium">
              "We only connect buyers and sellers and are not responsible for any transaction, deal, or dispute."
            </p>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 md:py-16">
        <div className="app-container max-w-4xl">
          <div className="space-y-10">
            {sections.map((section, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-1.5 w-2 h-2 rounded-full bg-indigo-600 shrink-0" />
                  <div>
                    <h2 className="text-lg font-bold text-foreground mb-2">{section.title}</h2>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {section.content}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Hindi Summary */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-12 p-6 md:p-8 rounded-2xl bg-indigo-600 text-white"
          >
            <div className="flex items-center gap-3 mb-4">
              <Info size={24} className="text-indigo-200" />
              <h2 className="text-xl font-bold">Hindi Summary (संक्षिप्त विवरण)</h2>
            </div>
            <div className="space-y-3 text-sm text-indigo-50">
              <p>1. Seenu Property केवल खरीदार और विक्रेता को मिलाने का एक माध्यम है।</p>
              <p>2. हम किसी भी लेनदेन, पैसे के लेन-देया या प्रॉपर्टी की सच्चाई की जिम्मेदारी नहीं लेते।</p>
              <p>3. कोई भी डील करने से पहले आप खुद प्रॉपर्टी के कागजात और मालिक की जांच करें।</p>
              <p>4. किसी भी विवाद या धोखाधड़ी के लिए Seenu Property उत्तरदायी नहीं होगी।</p>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
