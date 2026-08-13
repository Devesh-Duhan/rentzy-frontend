"use client";

import Image from "next/image";
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "@/lib/axios";
import { motion } from "framer-motion";
import {
  Search,
  MapPin,
  Mail,
  Phone,
  Building2,
  Calendar,
  Home,
  UserPlus,
  MessageCircle,
  X,
  Briefcase,
  Filter,
} from "lucide-react";
import Link from "next/link";
import Footer from "@/components/Footer";

export default function AgentsClient() {
  const [search, setSearch] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [companyFilter, setCompanyFilter] = useState("");

  const { data: usersData, isLoading } = useQuery({
    queryKey: ["agents"],
    queryFn: async () => {
      try {
        const res = await axios.get("/admin/users");
        const users = res.data.users || res.data || [];
        return users.filter(
          (u) =>
            u.role === "seller" || u.role === "agent" || u.role === "admin"
        );
      } catch {
        const res = await axios.get("/users");
        const users = res.data.users || res.data || [];
        return users.filter(
          (u) =>
            u.role === "seller" || u.role === "agent" || u.role === "admin"
        );
      }
    },
  });

  const agents = useMemo(() => usersData || [], [usersData]);

  const cities = useMemo(() => {
    const set = new Set();
    agents.forEach((a) => {
      if (a.city) set.add(a.city);
      if (a.location?.city) set.add(a.location.city);
    });
    return Array.from(set).sort();
  }, [agents]);

  const companies = useMemo(() => {
    const set = new Set();
    agents.forEach((a) => {
      if (a.company) set.add(a.company);
    });
    return Array.from(set).sort();
  }, [agents]);

  const filteredAgents = useMemo(() => {
    return agents.filter((a) => {
      const name = (a.name || a.username || "").toLowerCase();
      const email = (a.email || "").toLowerCase();
      const phone = a.phone || "";
      const city = a.city || a.location?.city || "";
      const company = a.company || "";
      const term = search.toLowerCase();

      if (term && !name.includes(term) && !email.includes(term) && !phone.includes(term)) {
        return false;
      }
      if (cityFilter && city !== cityFilter) return false;
      if (companyFilter && company !== companyFilter) return false;
      return true;
    });
  }, [agents, search, cityFilter, companyFilter]);

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <main className="min-h-screen bg-[var(--background)]">
      <div className="app-container pt-8 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <h1 className="section-title mb-2">
            Find Real Estate Agents
          </h1>
          <p className="section-subtitle">
            Connect with trusted agents and property sellers in your area
          </p>
        </motion.div>

        <div className="flex flex-col md:flex-row gap-4 mb-10">
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-12"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X size={16} />
              </button>
            )}
          </div>
          <select
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            className="input-field min-w-[160px]"
          >
            <option value="">All Cities</option>
            {cities.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <select
            value={companyFilter}
            onChange={(e) => setCompanyFilter(e.target.value)}
            className="input-field min-w-[160px]"
          >
            <option value="">All Companies</option>
            {companies.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {isLoading ? (
          <div className="app-grid">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div
                key={i}
                className="app-card overflow-hidden animate-pulse"
              >
                <div className="p-6 flex flex-col items-center">
                  <div className="w-20 h-20 rounded-full bg-slate-200 dark:bg-slate-700 mb-4" />
                  <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-32 mb-2" />
                  <div className="h-4 bg-slate-100 dark:bg-slate-700 rounded w-40 mb-4" />
                  <div className="h-4 bg-slate-100 dark:bg-slate-700 rounded w-28 mb-2" />
                  <div className="h-4 bg-slate-100 dark:bg-slate-700 rounded w-24 mb-2" />
                  <div className="h-4 bg-slate-100 dark:bg-slate-700 rounded w-36 mb-4" />
                  <div className="h-10 bg-slate-100 dark:bg-slate-700 rounded-xl w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredAgents.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-32 text-center"
          >
            <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-500/10 rounded-full flex items-center justify-center mb-6">
              <UserPlus size={36} className="text-indigo-400" />
            </div>
            <h2 className="section-title !text-2xl mb-3">
              No agents found
            </h2>
            <p className="section-subtitle max-w-md mb-2">
              {search || cityFilter || companyFilter
                ? "Try adjusting your search or filters."
                : "No agents or sellers registered yet."}
            </p>
            <Link
              href="/contact"
              className="btn-primary mt-6"
            >
              List Your Properties
            </Link>
          </motion.div>
        ) : (
          <div className="app-grid">
            {filteredAgents.map((agent, i) => (
              <motion.div
                key={agent._id || agent.id || i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="app-card overflow-hidden card-shadow hover:-translate-y-1 transition-all duration-300 group"
              >
                <div className="p-6 flex flex-col items-center">
                  <div className="w-20 h-20 rounded-full overflow-hidden mb-4 ring-4 ring-slate-100 dark:ring-slate-700 group-hover:ring-indigo-200 dark:group-hover:ring-indigo-800 transition-all">
                    {agent.profilePhoto || agent.avatar ? (
                      <Image
                        src={agent.profilePhoto || agent.avatar}
                        alt={agent.name || agent.username}
                        width={80}
                        height={80}
                        className="w-full h-full object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
                        {(agent.name || agent.username || "A")[0].toUpperCase()}
                      </div>
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white text-center">
                    {agent.name || agent.username || "Unknown"}
                  </h3>
                  {agent.company && (
                    <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-1">
                      <Building2 size={14} />
                      {agent.company}
                    </p>
                  )}
                  <div className="w-full space-y-2 mt-4 text-sm">
                    {agent.email && (
                      <a
                        href={`mailto:${agent.email}`}
                        className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                      >
                        <Mail size={14} />
                        <span className="truncate">{agent.email}</span>
                      </a>
                    )}
                    {agent.phone && (
                      <a
                        href={`tel:${agent.phone}`}
                        className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                      >
                        <Phone size={14} />
                        <span>{agent.phone}</span>
                      </a>
                    )}
                    {(agent.city || agent.location?.city) && (
                      <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                        <MapPin size={14} />
                        <span>
                          {agent.city || agent.location?.city}
                          {agent.location?.state ? `, ${agent.location.state}` : ""}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                      <Home size={14} />
                      <span>
                        {agent.propertyCount || agent.propertiesCount || 0} properties
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                      <Calendar size={14} />
                      <span>Joined {formatDate(agent.createdAt || agent.created)}</span>
                    </div>
                  </div>
                  <div className="w-full mt-6 space-y-2">
                    {agent.phone ? (
                      <a
                        href={`https://wa.me/${agent.phone.replace(/[^0-9]/g, "")}?text=Hi, I saw your profile on rentzypro`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-primary w-full flex items-center justify-center gap-2 !py-2.5 text-sm !rounded-xl"
                      >
                        <MessageCircle size={16} /> Contact via WhatsApp
                      </a>
                    ) : (
                      <a
                        href={`mailto:${agent.email}`}
                        className="btn-primary w-full flex items-center justify-center gap-2 !py-2.5 text-sm !rounded-xl"
                      >
                        <Mail size={16} /> Send Email
                      </a>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        <div className="mt-16 text-center p-8 glass-effect rounded-3xl">
          <h2 className="section-title !text-2xl mb-2">
            Are you a real estate agent?
          </h2>
          <p className="section-subtitle mb-6">
            List your properties and reach thousands of potential buyers and tenants.
          </p>
          <Link
            href="/contact"
            className="btn-primary inline-flex items-center gap-2"
          >
            <Briefcase size={18} /> List Your Properties
          </Link>
        </div>
      </div>
      <Footer />
    </main>
  );
}
