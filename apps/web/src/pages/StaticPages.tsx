import React, { useState } from 'react';
import {
  ShieldCheck,
  CreditCard,
  Zap,
  Mail,
  Phone,
  HelpCircle,
  FileText,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { PLATFORM_CONFIG, CANCELLATION_POLICIES } from '@vflow/shared';

export const AboutPage: React.FC = () => (
  <div className="max-w-4xl mx-auto px-4 py-14 space-y-8">
    <div className="space-y-3">
      <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">About VFlow</span>
      <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
        Powering Urban Mobility & Energy Access
      </h1>
      <p className="text-base text-slate-600 leading-relaxed">
        VFlow is an Airbnb-style marketplace designed to solve two critical urban challenges simultaneously: congested parking and electric vehicle charging availability.
      </p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
        <h3 className="font-bold text-slate-900 text-lg">For Drivers</h3>
        <p className="text-xs text-slate-600 leading-relaxed">
          Guaranteed parking spots and high-speed EV chargers reserved before you leave home. Digital PIN gates, transparent pricing, verified Razorpay payments, and curated nearby hangout recommendations while you wait.
        </p>
      </div>

      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
        <h3 className="font-bold text-slate-900 text-lg">For Hosts & Operators</h3>
        <p className="text-xs text-slate-600 leading-relaxed">
          Monetize driveways, commercial basements, residential bays, and EV wallboxes. Single canonical host dashboard, complete resource tracking, and guaranteed next-day earnings disbursements.
        </p>
      </div>
    </div>
  </div>
);

export const HelpPage: React.FC = () => (
  <div className="max-w-4xl mx-auto px-4 py-14 space-y-8">
    <div>
      <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Support & Help</span>
      <h1 className="text-3xl font-black text-slate-900 mt-1">Frequently Asked Questions</h1>
      <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
        Answers to common questions about reservations, EV charging, and next-day host payouts
      </p>
    </div>

    <div className="space-y-4">
      {[
        {
          q: 'How does parking reservation work?',
          a: 'Select your preferred city, arrival, and departure time. Pick a verified space and checkout securely via Razorpay. Once confirmed, you will instantly receive a digital barrier PIN and directions to the space.',
        },
        {
          q: 'How are next-day provider payouts calculated and transferred?',
          a: 'When a booking or charging session completes, our settlement engine calculates net earnings (Gross minus 10% platform commission) and queues it for disbursement on the next calendar day (cutoff 18:30 UTC / midnight IST) directly to the host bank account or UPI ID.',
        },
        {
          q: 'What if I need to cancel my reservation?',
          a: 'Cancellations follow the listing policy (Flexible, Moderate, or Strict). Eligible refunds are automatically processed through Razorpay back to your original payment method.',
        },
        {
          q: 'Is Valet booking available right now?',
          a: 'Valet parking and charging are currently in pre-launch preview and disabled in the MVP while partner venues are onboarded. Drivers can join our priority waitlist on the Valet page.',
        },
      ].map((faq, i) => (
        <div key={i} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <h4 className="font-bold text-slate-900 text-base flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{faq.q}</span>
          </h4>
          <p className="text-xs text-slate-600 leading-relaxed pl-6">{faq.a}</p>
        </div>
      ))}
    </div>
  </div>
);

export const ContactPage: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="max-w-3xl mx-auto px-4 py-14 space-y-8">
      <div>
        <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Contact</span>
        <h1 className="text-3xl font-black text-slate-900 mt-1">Get in Touch with VFlow Support</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          We're here to assist drivers and space hosts 24/7 across India.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 flex items-center gap-3">
          <Phone className="w-5 h-5 text-emerald-600" />
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-bold">Helpline</div>
            <div className="font-bold text-slate-900 text-sm">{PLATFORM_CONFIG.SUPPORT_PHONE}</div>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 flex items-center gap-3">
          <Mail className="w-5 h-5 text-emerald-600" />
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-bold">Email Support</div>
            <div className="font-bold text-slate-900 text-sm">{PLATFORM_CONFIG.SUPPORT_EMAIL}</div>
          </div>
        </div>
      </div>

      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="font-bold text-slate-900 text-base">Send Us a Message</h3>
        {submitted ? (
          <div className="p-4 bg-emerald-50 text-emerald-800 rounded-2xl text-xs font-bold text-center">
            Thank you! Your ticket has been logged. Our mobility support specialist will reply shortly.
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setSubmitted(true);
            }}
            className="space-y-3 text-xs"
          >
            <div>
              <label className="block font-bold text-slate-700 mb-1">Your Name</label>
              <input type="text" required className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 font-semibold" />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Email</label>
              <input type="email" required className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 font-semibold" />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Message</label>
              <textarea rows={4} required className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 font-semibold" />
            </div>
            <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-xl shadow">
              Submit Ticket
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export const TermsPage: React.FC = () => (
  <div className="max-w-4xl mx-auto px-4 py-14 space-y-6 text-xs text-slate-600 leading-relaxed">
    <h1 className="text-2xl font-black text-slate-900">VFlow Terms of Service</h1>
    <p>Last updated: October 2026. Welcome to VFlow. By accessing our platform or installable Progressive Web App, you agree to these Terms.</p>
    <h3 className="text-sm font-bold text-slate-900">1. Marketplace Platform</h3>
    <p>VFlow acts as an intermediary technology marketplace connecting vehicle drivers with independent space hosts and EV charging operators. VFlow does not own or operate third-party parking bays.</p>
    <h3 className="text-sm font-bold text-slate-900">2. Host Next-Day Settlements</h3>
    <p>Providers receive eligible net payouts on the next calendar day following successful session completion and settlement verification.</p>
    <h3 className="text-sm font-bold text-slate-900">3. Valet Service Disclaimers</h3>
    <p>Valet mobility services are strictly pre-launch previews and disabled. No driver dispatch or valet contracts exist at this stage.</p>
  </div>
);

export const PrivacyPage: React.FC = () => (
  <div className="max-w-4xl mx-auto px-4 py-14 space-y-6 text-xs text-slate-600 leading-relaxed">
    <h1 className="text-2xl font-black text-slate-900">VFlow Privacy & Data Protection Policy</h1>
    <p>We respect your privacy and protect personal data strictly adhering to applicable Indian digital data protection laws and international best practices.</p>
    <h3 className="text-sm font-bold text-slate-900">1. Data Minimization</h3>
    <p>We only collect information required for vehicle reservations, gate PIN access, and host bank settlements. We never collect or store raw credit/debit card details.</p>
    <h3 className="text-sm font-bold text-slate-900">2. Payment Security</h3>
    <p>All financial checkout transactions are securely handled by Razorpay through 256-bit SSL encryption and verified server-side signatures.</p>
  </div>
);

export const RefundPolicyPage: React.FC = () => (
  <div className="max-w-4xl mx-auto px-4 py-14 space-y-6 text-xs text-slate-600 leading-relaxed">
    <h1 className="text-2xl font-black text-slate-900">Cancellation & Refund Policy</h1>
    <p>VFlow provides clear, automated cancellation and refund mechanisms.</p>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
      <div className="bg-white p-5 rounded-2xl border border-slate-200">
        <h4 className="font-bold text-slate-900 text-sm">Flexible</h4>
        <p className="mt-1">Full 100% refund if cancelled up to 2 hours before scheduled arrival.</p>
      </div>
      <div className="bg-white p-5 rounded-2xl border border-slate-200">
        <h4 className="font-bold text-slate-900 text-sm">Moderate</h4>
        <p className="mt-1">Full refund up to 24 hours before arrival, 50% refund thereafter.</p>
      </div>
      <div className="bg-white p-5 rounded-2xl border border-slate-200">
        <h4 className="font-bold text-slate-900 text-sm">Strict</h4>
        <p className="mt-1">50% refund up to 48 hours before arrival, non-refundable thereafter.</p>
      </div>
    </div>
  </div>
);
