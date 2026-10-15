"use client";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  Lock,
  FileText,
  CheckCircle2,
  Users,
  Database,
  Globe,
} from "lucide-react";

export default function PrivacyPolicyPage() {
  const sections = [
    {
      id: "introduction",
      title: "1. Introduction",
      icon: Globe,
      content:
        "Welcome to Rentzypro. We value your privacy and are committed to protecting your personal data. This Privacy Policy explains how we collect, use, and safeguard your information when you visit our platform.",
    },
    {
      id: "data-collection",
      title: "2. Data Collection",
      icon: Database,
      content:
        "We collect personal information that you voluntarily provide to us when you register on the platform, express an interest in obtaining information about us or our services, or otherwise contact us. The personal information we collect includes: Name, Phone Number, Email Address, and Property Details (for sellers).",
    },
    {
      id: "data-usage",
      title: "3. Data Usage",
      icon: FileText,
      content:
        "We use the information we collect to facilitate the connection between property sellers and buyers/tenants. This includes verifying listings, enabling communication between users, improving our platform services, and sending relevant updates or notifications.",
    },
    {
      id: "cookies-policy",
      title: "4. Cookies Policy",
      icon: ShieldCheck,
      content:
        "Rentzypro uses cookies and similar tracking technologies to track the activity on our service and hold certain information. Cookies are files with small amount of data which may include an anonymous unique identifier. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.",
    },
    {
      id: "data-security",
      title: "5. Account & Security",
      icon: Lock,
      content:
        "We implement appropriate technical and organizational security measures designed to protect the security of any personal information we process. However, please also remember that we cannot guarantee that the internet itself is 100% secure. Although we will do our best to protect your personal information, transmission of personal information to and from our platform is at your own risk.",
    },
    {
      id: "changes-to-policy",
      title: "6. Changes to Policy",
      icon: FileText,
      content:
        "We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page. You are advised to review this Privacy Policy periodically for any changes.",
    },
    {
      id: "contact-info",
      title: "7. Contact Information",
      icon: Users,
      content:
        "If you have any questions or concerns about this Privacy Policy, please contact us at rentzyproperty@gmail.com",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <main className="pb-20 pt-24 md:pt-32">
        <div className="app-container max-w-4xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <span className="pill bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-800/50 mb-6">
              <Lock size={14} /> Compliance & Privacy
            </span>
            <h1 className="section-title text-3xl md:text-5xl lg:text-6xl !leading-tight mb-4 mt-4">
              Privacy <span className="text-indigo-600">Policy</span>
            </h1>
            <p className="section-subtitle">
              Effective Date: May 4, 2026. Your privacy is our priority at
              Rentzypro.
            </p>
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="app-card p-6 md:p-10"
          >
            <div className="flex items-start gap-3 p-4 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 rounded-xl mb-10 border border-indigo-100 dark:border-indigo-800/50">
              <CheckCircle2 className="flex-shrink-0 mt-0.5" size={18} />
              <p className="text-sm font-medium">
                TL;DR: We only connect buyers and sellers. We do not take
                responsibility for transactions.
              </p>
            </div>

            <div className="space-y-10">
              {sections.map((section) => (
                <div key={section.id}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                      <section.icon size={18} />
                    </div>
                    <h2 className="text-lg font-bold text-foreground">
                      {section.title}
                    </h2>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed pl-13 md:pl-14">
                    {section.content}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
