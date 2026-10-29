"use client";

import { useState } from "react";
import Link from "next/link";
import Footer from "@/components/Footer";
import { ArrowRight, BookOpen, Building2, ChevronDown, HelpCircle, Mail, Phone, Search, ShieldCheck, UserRound, X } from "lucide-react";

const topics = [
  { id: "account", title: "Getting started", description: "Sign up, log in and manage your account.", icon: UserRound },
  { id: "find", title: "Find a property", description: "Search, compare, contact and arrange a visit.", icon: Search },
  { id: "seller", title: "Owners & sellers", description: "Create and manage your property listings.", icon: Building2 },
  { id: "admin", title: "Admin guide", description: "Review listings and manage the platform.", icon: ShieldCheck },
  { id: "support", title: "Safety & support", description: "Report a problem and get help.", icon: HelpCircle },
];

const guides = [
  {
    id: "create-account", topic: "account", title: "Create an account and log in",
    description: "Start as a property seeker or register as a seller using email verification.",
    keywords: "registration signup sign up tenant buyer owner OTP gmail login",
    steps: [
      ["Choose your account", "Open Sign Up for a regular account. To list properties, use the seller registration link below."],
      ["Enter your details", "Fill in your name, email and password. Read and accept the Terms of Service and Privacy Policy, then submit."],
      ["Verify your email", "Enter the six-digit OTP sent to your email. Check Spam or Promotions if it is missing. Use the latest code before the expiry time stated in the email."],
      ["Sign in", "Use your registered email and password. Regular users go to the website, sellers to their dashboard, and admins to the admin panel."],
    ],
    links: [["Create an account", "/register"], ["Register as a seller", "/register?role=seller"], ["Sign in", "/login"]],
  },
  {
    id: "manage-account", topic: "account", title: "Manage your profile and password",
    description: "Update your contact details and recover access to your account.",
    keywords: "profile photo email phone logout forgot password reset notifications preferences",
    steps: [
      ["Update your profile", "Sign in and open Profile from your account menu. Review your name, phone and profile photo, edit the available fields and save."],
      ["Reset a forgotten password", "Choose Forgot Password on the login page, enter your registered email, verify the emailed OTP and set a new password. Then sign in with the new password."],
      ["Choose notifications", "Open Notification Preferences, choose the available settings and save your changes."],
      ["Sign out safely", "Use Log Out from your account menu on shared devices. Never share your password or verification codes."],
    ],
    links: [["My profile", "/profile"], ["Reset password", "/forgot-password"], ["Notification preferences", "/notifications/preferences"]],
  },
  {
    id: "search-properties", topic: "find", title: "Search and filter properties",
    description: "Find homes, PGs, commercial spaces and other categories for rent or sale.",
    keywords: "homepage category commercial residential rent buy sale city location budget price bedrooms bathrooms sort pagination filters",
    steps: [
      ["Choose where to start", "Use Rent, Buy or View All Properties. Each homepage category has its own horizontal row; swipe or scroll that row to see more cards."],
      ["Open Filters", "On the properties page, open Filters and enter a keyword, city, property type, rent or buy purpose, budget, bedrooms or bathrooms as needed."],
      ["Apply your choices", "Choose a sort order such as Newest First or Price: Low to High, then select Apply Filters. Clear filters or widen your search if there are no matches."],
      ["Browse the results", "Use pagination to see more results. Open a card or View Details to inspect a property before making a decision."],
    ],
    links: [["All properties", "/properties"], ["For rent", "/rent"], ["For sale", "/buy"]],
  },
  {
    id: "contact-and-visit", topic: "find", title: "Check details, contact and schedule a visit",
    description: "Understand a listing and talk to the property contact before proceeding.",
    keywords: "owner call whatsapp message chat inquiry enquiry visit gallery images photos map review rating deposit availability agreement booking",
    steps: [
      ["Review the listing", "Check photos, description, location, price, deposit, area, amenities and availability. A map is available only when the listing has location coordinates."],
      ["Contact the listing", "Call Owner and WhatsApp currently use +91 9996002136 on property pages. Mention the property title and confirm who handles your enquiry. Message owner opens a conversation with the listing seller after you sign in."],
      ["Request a visit", "Sign in and choose Schedule Visit. Enter your name, phone, preferred date and time slot, add any notes and submit. Confirm the appointment with the property contact; a request is not a rental booking."],
      ["Inspect and agree on terms", "Visit the property and confirm availability, price, deposit, charges and documents. Contacting a listing or requesting a visit does not complete a rental or sale agreement."],
      ["Follow up or review", "Continue conversations in Chat. After your experience, sign in to select a star rating and submit a relevant review on the property page."],
    ],
    links: [["Browse listings", "/properties"], ["My conversations", "/chat"]],
  },
  {
    id: "save-compare-alerts", topic: "find", title: "Save favourites, compare and create alerts",
    description: "Organise your shortlist and save your search preferences.",
    keywords: "wishlist saved heart favourite favorite compare three alerts daily weekly monthly instant notifications",
    steps: [
      ["Save a favourite", "Sign in, then use the heart on a card or Save on the detail page. Open Wishlist from your account menu to revisit saved properties. Use the same control to remove an item."],
      ["Compare your options", "Open Compare and use its property search to add up to three listings. Compare the displayed prices, deposit, rooms, area, amenities and location. Remove a listing to add another."],
      ["Create an alert", "Sign in and open Property Alerts. Add your search criteria, choose an available frequency and save. Manage or delete alerts from that page."],
      ["Check current details", "Reopen listings and confirm availability and terms with the property contact. Alert delivery depends on your settings and service availability."],
    ],
    links: [["My wishlist", "/wishlist"], ["Compare properties", "/compare"], ["Property alerts", "/alerts"]],
  },
  {
    id: "become-seller", topic: "seller", title: "Get access to the seller dashboard",
    description: "Use a seller account to publish and manage your own properties.",
    keywords: "owner landlord agent upgrade become seller register role permissions dashboard company address",
    steps: [
      ["Register or sign in", "New owners can use seller sign-up. If you already have a regular account, sign in and open Become a Seller."],
      ["Complete the seller form", "Provide the requested phone, address and company or business details. Review the information and select Unlock Seller Features."],
      ["Open your dashboard", "After your account has seller access, open Seller Dashboard. Use My Profile for your seller information and My Properties for your listings."],
      ["Use the correct account", "Seller tools manage properties belonging to your account. Creating a seller account does not grant access to admin tools."],
    ],
    links: [["Seller sign up", "/register?role=seller"], ["Become a seller", "/become-seller"], ["Seller dashboard", "/seller"]],
  },
  {
    id: "post-property", topic: "seller", title: "List a property: Basics → Pricing → Media → Review",
    description: "Follow the four listing steps and complete any required listing payment.",
    keywords: "add post create upload photos jpg jpeg png webp 5mb 10 images listing fee razorpay cashfree payment publish PG hostel rooms",
    steps: [
      ["Basics", "Sign in as a seller and open Add Property. Choose rent or sale and a category. Enter a title, district/city, address, contact number, rooms and a description of at least 20 characters. For PGs or hostels, fill in the requested room counts."],
      ["Pricing", "Enter the rent or sale price, security deposit if applicable, and property size with the correct unit. Check the figures before continuing."],
      ["Media", "Upload at least one clear property photo. Public photos must be JPG, PNG or WEBP, with up to 10 photos and a 5 MB limit per photo. Review the previews and remove incorrect images."],
      ["Review and submit", "Check the summary in Review. Use Edit or Back to correct a step, then select Confirm & Publish. Wait for the result before submitting again."],
      ["Complete payment if prompted", "If a listing fee is required, the property is saved first and stays outside public results until payment is verified. Use an available payment option shown on screen. This fee is separate from rent and the security deposit."],
      ["Check the public listing", "Open My Properties to inspect the saved listing. Public search shows available listings that meet the payment requirement and have not been rejected. Admin verification adds a badge; it is separate from listing payment."],
    ],
    links: [["Add a property", "/add"], ["My properties", "/seller/properties"]],
  },
  {
    id: "manage-listings", topic: "seller", title: "Edit listings, manage enquiries and remove a property",
    description: "Keep your property information accurate after publishing.",
    keywords: "edit delete remove seller reviews reply bulk upload CSV rented sold unavailable pending rejected verification payment",
    steps: [
      ["Find your listing", "Open Seller Dashboard → My Properties. Check that you are signed in with the account that created the property."],
      ["Edit the details", "Select Edit, update details or photos, review the changes and submit. Recheck the public detail page after a successful save."],
      ["Manage conversations and reviews", "Use Chat for property conversations and Reviews in your seller dashboard for feedback and the available reply controls."],
      ["Upload multiple listings", "Open Bulk Upload and follow its file format instructions. Review validation and upload results, then correct rejected rows before retrying."],
      ["Remove an old listing", "Select Delete in My Properties and confirm only when it should be removed. Keep availability accurate with the available management tools or contact support."],
      ["Resolve visibility problems", "Check for an incomplete payment, rented/sold status or admin rejection. Contact support about a rejection reason and review process. Verification does not replace payment."],
    ],
    links: [["Manage listings", "/seller/properties"], ["Seller reviews", "/seller/reviews"], ["Bulk upload", "/seller/bulk-upload"]],
  },
  {
    id: "admin-workflow", topic: "admin", title: "Admin workflow: review, manage and publish",
    description: "For authorised administrators using the existing admin panel.",
    keywords: "approval approve reject verification users roles featured categories locations blogs draft published SEO testimonials FAQs leads subscriptions visits reviews newsletter exports reports analytics activity settings",
    steps: [
      ["Sign in as an admin", "Use an authorised admin account on the normal login page. Open Dashboard and Analytics for the platform overview. Regular users and sellers cannot access admin actions."],
      ["Review properties and users", "Use Users for accounts and Properties for listings. In Verification, inspect details before verifying or rejecting. Verification adds a badge; explicit rejection hides a listing. Record a clear rejection reason."],
      ["Organise listings", "Manage browsing choices in Categories and Locations, and featured listings in Featured. Check each change on the corresponding public page."],
      ["Publish content", "In Blogs, create or edit an article and save its status as Published for the public blog page. Drafts remain private. Use SEO, Testimonials and FAQs for their respective content settings."],
      ["Manage requests and feedback", "Use Leads for enquiries, listing reports and follow-up, Site Visits for visit requests and Reviews for moderation. Review available statuses and notes before saving."],
      ["Maintain operations", "Use Reports for revenue and platform summaries, Subscriptions for plans, Newsletter for subscriptions, Exports for available downloads and Activity Log for recorded actions. In Settings, carefully review contact details, listing fees and site settings before saving."],
    ],
    links: [["Admin dashboard", "/admin"], ["Verification", "/admin/verification"], ["Manage blogs", "/admin/blogs"]],
  },
  {
    id: "safe-and-supported", topic: "support", title: "Stay safe and report a problem",
    description: "Know what to check and what to include when asking for help.",
    keywords: "fraud scam safety report problem support contact email phone privacy terms refund payment failed error OTP spam help",
    steps: [
      ["Check before committing", "Confirm the address, property condition, owner or agent identity and written terms. A verification badge does not replace your own visit and document checks."],
      ["Protect your account", "Never share an OTP, password or payment PIN. Review the website policies and use the website payment flow for any applicable listing fee."],
      ["Report a listing", "Use Report on the property detail page, complete the required contact fields and explain the issue with enough detail to identify and investigate it."],
      ["Explain a technical error", "Note the page URL, property title or ID, the action you tried and the error message. Keep transaction references for payment issues and confirm the existing payment status before paying again."],
      ["Contact support", "Call +91 9996002136 or email rentzyproperty@gmail.com with those details. Do not include passwords, OTPs, card details or other sensitive credentials."],
    ],
    links: [["Safety guide", "/safety"], ["Contact support", "/contact"], ["Refund policy", "/refund-policy"]],
  },
];

const faqs = [
  { topic: "account", q: "My sign-up OTP has not arrived. What should I do?", a: "Check your email address, Spam and Promotions. Wait briefly and use resend where available, or retry sign-up if the request failed. Use only the latest code. If the problem continues, contact support with the error message, without sharing your OTP." },
  { topic: "account", q: "Why am I being asked to log in again?", a: "Saving properties, messaging, visits and account tools need a signed-in account. Sign in again if your session expired. Seller and admin pages also require the matching account role." },
  { topic: "find", q: "Why are there no properties in my search?", a: "Clear filters, check the city spelling, widen your budget or try another category, then apply the updated filters. Rented, sold, unpaid or rejected listings may not appear in available public results." },
  { topic: "find", q: "Does Schedule Visit reserve the property?", a: "No. It sends your preferred visit details. Confirm the appointment, availability and terms with the property contact. A visit request or chat message does not create a rental or sale agreement." },
  { topic: "find", q: "Which number do Call Owner and WhatsApp use?", a: "Property pages currently use +91 9996002136 for both actions. Mention the property title when contacting this number. Message owner uses the seller conversation linked to that listing." },
  { topic: "seller", q: "Why is my saved property not visible on the website?", a: "Check that it was saved to your signed-in seller account. An unsigned preview saved locally is not public. Any required payment must be verified. Public results exclude rented/sold and explicitly rejected listings. Contact support if these checks do not resolve it." },
  { topic: "seller", q: "What photos can I upload?", a: "Upload JPG, PNG or WEBP property photos, up to 10 public photos and 5 MB per photo. Add at least one image and use accurate photos of the property you are listing." },
  { topic: "seller", q: "Is the listing fee the same as rent or the deposit?", a: "No. A listing fee, when required, pays for publishing the listing. Confirm rent, deposit, sale price and other charges separately with the owner. Check the displayed payment amount and refund policy before paying." },
  { topic: "admin", q: "Why does a blog not appear on the public website?", a: "In Admin → Blogs, save the article with status Published. Draft articles remain private. Then open the public Blog page and check the saved article." },
  { topic: "admin", q: "Does verifying a property complete its listing payment?", a: "No. Verification controls the badge. Listing payment is a separate requirement when fees are enabled. Explicit rejection hides the property from public results." },
  { topic: "support", q: "What should I send when reporting a technical problem?", a: "Share the page URL, property ID or title, steps you tried and error text. Include a transaction reference for payment issues. Email rentzyproperty@gmail.com or call +91 9996002136 without sharing passwords, OTPs or payment credentials." },
];

const workflow = [
  ["Find", "Browse categories and apply your filters."],
  ["Shortlist", "Check photos, prices and property details."],
  ["Connect", "Call, WhatsApp or message the listing contact."],
  ["Visit & decide", "Inspect the place and agree on the terms."],
];

export default function HelpCenter() {
  const [query, setQuery] = useState("");
  const [activeTopic, setActiveTopic] = useState("all");
  const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const matches = (topic, text) => (activeTopic === "all" || activeTopic === topic) && terms.every(term => text.toLowerCase().includes(term));
  const visibleGuides = guides.filter(guide => matches(guide.topic, [guide.title, guide.description, guide.keywords, ...guide.steps.flat()].join(" ")));
  const visibleFaqs = faqs.filter(faq => matches(faq.topic, `${faq.q} ${faq.a}`));
  const hasFilters = Boolean(query || activeTopic !== "all");
  const clearFilters = () => { setQuery(""); setActiveTopic("all"); };

  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="border-b border-slate-100 bg-gradient-to-b from-indigo-50/70 to-background pb-10 pt-24 sm:pb-14 md:pt-32 dark:border-slate-800 dark:from-indigo-950/30" aria-labelledby="help-title">
        <div className="app-container text-center">
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-white px-4 py-2 text-xs font-semibold text-indigo-600 dark:border-indigo-900 dark:bg-slate-900 dark:text-indigo-300"><BookOpen size={15} aria-hidden="true" /> RentzyPro Help Center</span>
          <h1 id="help-title" className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">Your guide to <span className="text-indigo-600 dark:text-indigo-400">RentzyPro</span></h1>
          <p className="mx-auto mb-7 mt-4 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">From finding your next place to publishing a listing, follow the steps below to understand how the website works.</p>
          <div role="search" className="relative mx-auto max-w-2xl">
            <label htmlFor="help-search" className="sr-only">Search help guides and FAQs</label>
            <Search size={19} aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input id="help-search" type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Search: OTP, filters, listing, payment..." autoComplete="off" maxLength={200} className="input-field !py-4 !pl-12 !pr-12 shadow-sm [&::-webkit-search-cancel-button]:appearance-none" />
            {query && <button type="button" onClick={() => setQuery("")} aria-label="Clear search" className="absolute right-1 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-lg text-slate-500 hover:text-indigo-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-500"><X size={18} aria-hidden="true" /></button>}
          </div>
          <div className="mt-5 flex flex-wrap justify-center gap-x-6 gap-y-3 text-sm font-semibold text-indigo-600 dark:text-indigo-300">
            {[["Find a property", "/properties"], ["Create an account", "/register"], ["List your property", "/add"]].map(([label, href]) => <Link key={href} href={href} prefetch={false} className="inline-flex min-h-11 items-center gap-1.5 rounded hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-500">{label}<ArrowRight size={15} aria-hidden="true" /></Link>)}
          </div>
        </div>
      </section>

      <section className="py-10 sm:py-12" aria-labelledby="workflow-title">
        <div className="app-container">
          <h2 id="workflow-title" className="text-xl font-bold sm:text-2xl">How finding a property works</h2>
          <ol className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {workflow.map(([title, text], index) => <li key={title} className="flex gap-3 rounded-2xl bg-slate-50 p-5 dark:bg-slate-900"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-sm font-bold text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300">{index + 1}</span><div className="min-w-0"><h3 className="font-semibold">{title}</h3><p className="mt-1 text-sm leading-6 text-muted-foreground">{text}</p></div></li>)}
          </ol>
        </div>
      </section>

      <section className="pb-12 sm:pb-16" aria-labelledby="guides-title">
        <div className="app-container">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3"><h2 id="guides-title" className="text-xl font-bold sm:text-2xl">Step-by-step guides</h2><button type="button" onClick={() => setActiveTopic("all")} aria-pressed={activeTopic === "all"} className={`min-h-11 rounded-xl border px-4 text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-500 ${activeTopic === "all" ? "border-indigo-600 bg-indigo-600 text-white" : "border-slate-200 text-muted-foreground dark:border-slate-700"}`}>All guides</button></div>
          <div role="group" aria-label="Filter help by topic" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {topics.map(({ id, title, description, icon: Icon }) => <button key={id} type="button" onClick={() => setActiveTopic(id)} aria-pressed={activeTopic === id} className={`min-w-0 rounded-2xl border p-4 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-500 ${activeTopic === id ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40" : "border-slate-200 bg-white hover:border-indigo-300 dark:border-slate-800 dark:bg-slate-900"}`}><Icon size={21} aria-hidden="true" className="mb-3 text-indigo-600 dark:text-indigo-400" /><span className="block text-sm font-semibold">{title}</span><span className="mt-1 block text-xs leading-5 text-muted-foreground">{description}</span></button>)}
          </div>
          <div className="my-6 flex flex-wrap items-center justify-between gap-3">
            <p role="status" aria-live="polite" aria-atomic="true" className="text-sm text-muted-foreground">{visibleGuides.length} {visibleGuides.length === 1 ? "guide" : "guides"} · {visibleFaqs.length} {visibleFaqs.length === 1 ? "answer" : "answers"}{activeTopic !== "all" && ` in ${topics.find(topic => topic.id === activeTopic).title}`}</p>
            {hasFilters && <button type="button" onClick={clearFilters} className="inline-flex min-h-11 items-center gap-1.5 rounded px-2 text-sm font-semibold text-indigo-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-500 dark:text-indigo-300"><X size={15} aria-hidden="true" />Clear filters</button>}
          </div>
          {visibleGuides.length > 0 && <div className="grid items-start gap-4 lg:grid-cols-2">
            {visibleGuides.map(guide => <details key={guide.id} id={guide.id} className="group min-w-0 scroll-mt-24 rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
              <summary className="flex cursor-pointer list-none items-start gap-3 rounded-2xl p-5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-500 sm:p-6 [&::-webkit-details-marker]:hidden"><BookOpen size={21} aria-hidden="true" className="mt-1 shrink-0 text-indigo-500" /><div className="min-w-0 flex-1"><span className="text-[11px] font-semibold uppercase tracking-wide text-indigo-600 dark:text-indigo-300">{topics.find(topic => topic.id === guide.topic).title} · {guide.steps.length} steps</span><h3 className="mt-1.5 text-base font-semibold leading-6">{guide.title}</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">{guide.description}</p></div><ChevronDown size={19} aria-hidden="true" className="mt-1 shrink-0 text-slate-400 transition-transform group-open:rotate-180 motion-reduce:transition-none" /></summary>
              <div className="border-t border-slate-100 px-5 pb-6 pt-5 sm:px-6 dark:border-slate-800">
                <ol className="space-y-5">{guide.steps.map(([title, text], index) => <li key={title} className="flex gap-3"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-xs font-bold text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300">{index + 1}</span><div className="min-w-0"><h4 className="text-sm font-semibold leading-7">{title}</h4><p className="mt-1 text-sm leading-7 text-muted-foreground">{text}</p></div></li>)}</ol>
                <div className="mt-6 flex flex-wrap gap-2">{guide.links.map(([label, href]) => <Link key={href} href={href} prefetch={false} className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-500 dark:bg-indigo-500/15 dark:text-indigo-300">{label}<ArrowRight size={13} aria-hidden="true" /></Link>)}</div>
              </div>
            </details>)}
          </div>}
          {!visibleGuides.length && !visibleFaqs.length && <div className="rounded-2xl border border-dashed border-slate-300 p-7 text-center sm:p-12 dark:border-slate-700"><Search size={28} aria-hidden="true" className="mx-auto mb-3 text-indigo-500" /><h3 className="font-semibold">No matching help found</h3><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">Try a shorter search such as OTP, payment or photos, or choose another topic.</p><button type="button" onClick={clearFilters} className="btn-primary mt-5 text-sm">Show all guides</button></div>}
        </div>
      </section>

      {visibleFaqs.length > 0 && <section className="bg-slate-50 py-10 sm:py-14 dark:bg-slate-950/40" aria-labelledby="faq-title"><div className="app-container !max-w-4xl"><h2 id="faq-title" className="mb-6 text-xl font-bold sm:text-2xl">Frequently asked questions</h2><div className="space-y-3">{visibleFaqs.map(faq => <details key={faq.q} className="group rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"><summary className="flex cursor-pointer list-none items-start gap-3 rounded-xl p-5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-500 [&::-webkit-details-marker]:hidden"><HelpCircle size={18} aria-hidden="true" className="mt-0.5 shrink-0 text-indigo-500" /><h3 className="min-w-0 flex-1 text-sm font-semibold leading-6">{faq.q}</h3><ChevronDown size={17} aria-hidden="true" className="mt-1 shrink-0 text-slate-400 transition-transform group-open:rotate-180 motion-reduce:transition-none" /></summary><p className="px-5 pb-5 text-sm leading-7 text-muted-foreground sm:pl-12">{faq.a}</p></details>)}</div></div></section>}

      <section className="py-12 sm:py-16" aria-labelledby="support-title"><div className="app-container"><div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-5 sm:p-8 dark:border-indigo-900 dark:bg-indigo-950/30"><div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between"><div className="min-w-0"><h2 id="support-title" className="text-xl font-bold">Still need a hand?</h2><p className="mt-2 max-w-xl text-sm leading-7 text-muted-foreground">Share the page URL, property details and the error you see so our team can help.</p></div><div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:flex-wrap"><a href="tel:+919996002136" className="btn-secondary inline-flex min-h-11 items-center justify-center gap-2 text-sm"><Phone size={16} aria-hidden="true" />+91 9996002136</a><a href="mailto:rentzyproperty@gmail.com" className="btn-primary inline-flex min-w-0 items-center justify-center gap-2 !px-4 text-sm"><Mail size={16} aria-hidden="true" /><span className="break-all">rentzyproperty@gmail.com</span></a></div></div><div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 border-t border-indigo-100 pt-5 text-xs font-semibold text-indigo-700 dark:border-indigo-900 dark:text-indigo-300">{[["Contact page", "/contact"], ["Safety tips", "/safety"], ["Terms of Service", "/terms"], ["Privacy Policy", "/privacy"]].map(([label, href]) => <Link key={href} href={href} prefetch={false} className="inline-flex min-h-11 items-center rounded hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-500">{label}</Link>)}</div></div></div></section>
      <Footer />
    </main>
  );
}
