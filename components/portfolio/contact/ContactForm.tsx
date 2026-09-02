"use client";

import { useState } from "react";
import { Send, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { PortfolioCustomization } from "@/types/portfolio";
import {
  getButtonStyleClass,
  getBorderRadiusClass,
} from "@/lib/constants/portfolio-customization";

interface ContactFormProps {
  username: string;
  customization: PortfolioCustomization;
}

export default function ContactForm({ username, customization }: ContactFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    website: "", // Honeypot field
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const buttonStyleClass = getButtonStyleClass(customization.buttonStyle);
  const borderRadiusClass = getBorderRadiusClass(customization.borderRadius);
  const primaryColor = customization.themeColor || "#2563EB";

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errorMessage) setErrorMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    // Client-side quick check
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setErrorMessage("Please fill in all required fields (Name, Email, Message).");
      return;
    }

    setIsSubmitting(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/portfolio/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          name: formData.name,
          email: formData.email,
          subject: formData.subject,
          message: formData.message,
          website: formData.website,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || "Failed to send message.");
      }

      setSuccessMessage("Message sent successfully! Thanks for reaching out.");
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
        website: "",
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong. Please try again.";
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`w-full max-w-2xl mx-auto p-6 sm:p-8 glass-card border border-slate-800 ${borderRadiusClass} space-y-6 shadow-xl`}>
      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs sm:text-sm font-medium flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs sm:text-sm font-medium flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Hidden Honeypot Field for Spam Trap */}
        <div className="hidden" aria-hidden="true">
          <label htmlFor="website">Leave empty</label>
          <input
            type="text"
            id="website"
            name="website"
            value={formData.website}
            onChange={handleChange}
            tabIndex={-1}
            autoComplete="off"
          />
        </div>

        {/* Name & Email Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <div className="space-y-1.5">
            <label htmlFor="contact-name" className="block text-xs font-semibold text-slate-300">
              Your Name <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              id="contact-name"
              name="name"
              required
              maxLength={100}
              autoComplete="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Jane Doe"
              className={`w-full px-4 py-2.5 bg-slate-900/80 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-opacity-50 ${borderRadiusClass} transition-all`}
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="contact-email" className="block text-xs font-semibold text-slate-300">
              Your Email <span className="text-rose-400">*</span>
            </label>
            <input
              type="email"
              id="contact-email"
              name="email"
              required
              maxLength={254}
              autoComplete="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="jane@example.com"
              className={`w-full px-4 py-2.5 bg-slate-900/80 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-opacity-50 ${borderRadiusClass} transition-all`}
            />
          </div>
        </div>

        {/* Subject */}
        <div className="space-y-1.5">
          <label htmlFor="contact-subject" className="block text-xs font-semibold text-slate-300">
            Subject <span className="text-slate-500 font-normal">(Optional)</span>
          </label>
          <input
            type="text"
            id="contact-subject"
            name="subject"
            maxLength={200}
            value={formData.subject}
            onChange={handleChange}
            placeholder="Project inquiry / Opportunity"
            className={`w-full px-4 py-2.5 bg-slate-900/80 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-opacity-50 ${borderRadiusClass} transition-all`}
          />
        </div>

        {/* Message */}
        <div className="space-y-1.5">
          <label htmlFor="contact-message" className="block text-xs font-semibold text-slate-300">
            Message <span className="text-rose-400">*</span>
          </label>
          <textarea
            id="contact-message"
            name="message"
            required
            rows={5}
            maxLength={5000}
            value={formData.message}
            onChange={handleChange}
            placeholder="Hi, I'd like to get in touch regarding..."
            className={`w-full px-4 py-2.5 bg-slate-900/80 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-opacity-50 ${borderRadiusClass} transition-all resize-none`}
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 text-white text-xs font-bold transition-all shadow-md ${buttonStyleClass} ${borderRadiusClass} disabled:opacity-50 disabled:cursor-not-allowed`}
          style={{ backgroundColor: primaryColor }}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Sending...</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>Send Message</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
