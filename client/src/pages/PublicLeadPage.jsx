import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Send,
  CheckCircle2,
  Sparkles,
  Building2,
  Phone,
  Mail,
  User,
  Check,
  MessageSquare,
  Loader2,
} from "lucide-react";
import api from "../api/axios";

const PublicLeadPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError("");
      await api.post("/leads/public", formData);
      setSubmitted(true);
      setFormData({ name: "", email: "", phone: "", company: "", message: "" });
    } catch (err) {
      const msg =
        err.response?.data?.errors?.join(", ") ||
        err.response?.data?.message ||
        "Failed to submit lead. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex-1 flex flex-col justify-center py-4 lg:py-0 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-[#E7E4D8] text-[#161D18]"
    >
      {/* Background Soft Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#49755B]/15 blur-[140px] rounded-full pointer-events-none" />

      <div className="max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-center relative z-10 my-auto">
        {/* Left Content Banner */}
        <div className="lg:col-span-6 space-y-4 text-center lg:text-left">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#2A4B3A]/10 border border-[#2A4B3A]/20 text-[#2A4B3A] text-xs font-bold"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#2A4B3A]" />
            <span>Digital Heroes CRM Platform</span>
          </motion.div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tighter text-[#161D18] leading-[1.05]">
            NO MORE <br />
            <span className="text-[#2A4B3A]">MISSED DEADLINES.</span>
          </h1>

          <p className="text-[#575D58] text-xs sm:text-sm leading-relaxed font-medium">
            <span className="font-serif text-3xl sm:text-4xl text-[#2A4B3A] float-left mr-2 leading-none font-bold">
              W
            </span>
            e build custom software, mobile apps, web apps, and
            Shopify/WordPress development Solution. Done Fast, Done right, done
            once, <em className="italic font-serif">the first time.</em>
          </p>

          <div className="space-y-2 pt-1 text-xs sm:text-sm text-[#161D18]">
            <div className="flex items-center gap-2.5 justify-center lg:justify-start">
              <div className="p-1 bg-[#2A4B3A]/15 text-[#2A4B3A] rounded-full shrink-0">
                <Check className="w-3.5 h-3.5" />
              </div>
              <span className="font-bold">
                Automated lead routing & assignment
              </span>
            </div>
            <div className="flex items-center gap-2.5 justify-center lg:justify-start">
              <div className="p-1 bg-[#2A4B3A]/15 text-[#2A4B3A] rounded-full shrink-0">
                <Check className="w-3.5 h-3.5" />
              </div>
              <span className="font-bold">
                Complete timeline notes & audit history
              </span>
            </div>
            <div className="flex items-center gap-2.5 justify-center lg:justify-start">
              <div className="p-1 bg-[#2A4B3A]/15 text-[#2A4B3A] rounded-full shrink-0">
                <Check className="w-3.5 h-3.5" />
              </div>
              <span className="font-bold">
                Enterprise JWT token rotation security
              </span>
            </div>
          </div>
        </div>

        {/* Right Section: Form Card */}
        <div className="lg:col-span-6 relative flex items-center justify-center">
          {/* Form Container Card */}
          <div className="w-full bg-[#F0EEE4]/95 backdrop-blur-md border border-[#C5C2B4] rounded-3xl p-5 sm:p-6 shadow-2xl relative z-10">
            {submitted ? (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-center py-8 space-y-3"
              >
                <div className="w-14 h-14 bg-[#2A4B3A]/15 text-[#2A4B3A] rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-black text-[#161D18]">
                  Inquiry Received!
                </h3>
                <p className="text-[#575D58] text-xs sm:text-sm max-w-md mx-auto font-medium">
                  Thank you for reaching out. A digital sales specialist will
                  review your details and connect with you shortly.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="mt-2 px-6 py-2.5 bg-[#2A4B3A] hover:bg-[#1E372B] text-white font-bold rounded-full text-xs sm:text-sm shadow-md transition-all hover:scale-105 active:scale-95"
                >
                  Submit Another Request
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <h2 className="text-lg font-black text-[#161D18] tracking-tight">
                    Get in Touch
                  </h2>
                  <p className="text-[11px] text-[#575D58] font-medium">
                    Fill in your inquiry details below for a quick consultation.
                  </p>
                </div>

                {error && (
                  <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs font-medium">
                    {error}
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-extrabold text-[#161D18] uppercase tracking-wider mb-1">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User className="w-3.5 h-3.5 text-stone-500 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="John Doe"
                      className="w-full bg-[#FAF8F0] border border-[#C5C2B4] rounded-2xl pl-9 pr-3 py-2 text-[#161D18] text-xs sm:text-sm focus:border-2 focus:border-[#2A4B3A] focus:bg-white outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-extrabold text-[#161D18] uppercase tracking-wider mb-1">
                      Email Address *
                    </label>
                    <div className="relative">
                      <Mail className="w-3.5 h-3.5 text-stone-500 absolute left-3 top-2.5" />
                      <input
                        type="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="john@company.com"
                        className="w-full bg-[#FAF8F0] border border-[#C5C2B4] rounded-2xl pl-9 pr-3 py-2 text-[#161D18] text-xs sm:text-sm focus:border-2 focus:border-[#2A4B3A] focus:bg-white outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-extrabold text-[#161D18] uppercase tracking-wider mb-1">
                      Phone Number *
                    </label>
                    <div className="relative">
                      <Phone className="w-3.5 h-3.5 text-stone-500 absolute left-3 top-2.5" />
                      <input
                        type="tel"
                        name="phone"
                        required
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+1 555-0199"
                        className="w-full bg-[#FAF8F0] border border-[#C5C2B4] rounded-2xl pl-9 pr-3 py-2 text-[#161D18] text-xs sm:text-sm focus:border-2 focus:border-[#2A4B3A] focus:bg-white outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-extrabold text-[#161D18] uppercase tracking-wider mb-1">
                    Company Name
                  </label>
                  <div className="relative">
                    <Building2 className="w-3.5 h-3.5 text-stone-500 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      name="company"
                      value={formData.company}
                      onChange={handleChange}
                      placeholder="Acme Inc."
                      className="w-full bg-[#FAF8F0] border border-[#C5C2B4] rounded-2xl pl-9 pr-3 py-2 text-[#161D18] text-xs sm:text-sm focus:border-2 focus:border-[#2A4B3A] focus:bg-white outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-extrabold text-[#161D18] uppercase tracking-wider mb-1">
                    Message / Scope
                  </label>
                  <div className="relative">
                    <MessageSquare className="w-3.5 h-3.5 text-stone-500 absolute left-3 top-2.5" />
                    <textarea
                      name="message"
                      rows={2}
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Tell us about your lead goals..."
                      className="w-full bg-[#FAF8F0] border border-[#C5C2B4] rounded-2xl pl-9 pr-3 py-2 text-[#161D18] text-xs sm:text-sm focus:border-2 focus:border-[#2A4B3A] focus:bg-white outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Full-Width Send Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-[#2A4B3A] hover:bg-[#1E372B] text-white font-bold text-xs sm:text-sm rounded-2xl shadow-lg shadow-[#2A4B3A]/25 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2.5 mt-2"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Submit Project Inquiry — Get Started</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default PublicLeadPage;
