"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Phone,
  Mail,
  ArrowUpRight,
  ArrowUp,
  MapPin,
  Send,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { subscribe } from "@/lib/subscribers/api";

// ============================================
// COLOR SCHEME
// ============================================
const PURPLE = "#3C1E74";
const CYAN = "#5CE1E6";
const PINK = "#FFA7E4";
const MAGENTA = "#B462B6";
const DARK = "#1E0F3D";

export default function Footer() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subscribing, setSubscribing] = useState(false);
  const [subscribeMsg, setSubscribeMsg] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    const handleScroll = () => setIsVisible(window.scrollY > 300);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  const handleSubscribe = async (e) => {
    e.preventDefault();
    setSubscribeMsg(null);

    if (!name.trim() || name.trim().length < 2) {
      setSubscribeMsg({ type: "error", text: "Please enter your name" });
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setSubscribeMsg({ type: "error", text: "Please enter a valid email address" });
      return;
    }

    setSubscribing(true);
    const res = await subscribe({ name: name.trim(), email: email.trim() });

    if (res.success) {
      setSubscribeMsg({
        type: "success",
        text: res.message || "Successfully subscribed to our newsletter!",
      });
      setName("");
      setEmail("");
      setTimeout(() => setSubscribeMsg(null), 6000);
    } else {
      setSubscribeMsg({
        type: "error",
        text: res.message || "Something went wrong. Please try again.",
      });
    }
    setSubscribing(false);
  };

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "About", href: "/about" },
    { name: "Properties", href: "/properties" },
    { name: "Services", href: "/services" },
    { name: "Blog", href: "/blogs" },
    { name: "Contact", href: "/contact" },
  ];

  const contactInfo = [
    {
      icon: Phone,
      label: "Phone",
      value: "437-494-5181",
      href: "tel:+437-494-5181",
    },
    {
      icon: Mail,
      label: "Email",
      value: "matt@torontosrunningrealtor.com",
      href: "mailto:matt@torontosrunningrealtor.com",
    },
    {
      icon: MapPin,
      label: "Location",
      value: "Beaches, East York, Scarborough, Toronto",
      href: null,
    },
  ];

  const socialLinks = [
    {
      name: "Instagram",
      href: "https://www.instagram.com/torontosrunningrealtor/",
      hoverColor: PINK,
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
        </svg>
      ),
    },
    {
      name: "Facebook",
      href: "https://www.facebook.com/torontosrunningrealtor/",
      hoverColor: MAGENTA,
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      ),
    },
  ];

  return (
    <footer
      className="relative overflow-hidden text-white"
      style={{ backgroundColor: DARK }}
    >
      {/* ============ BACKGROUND ============ */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(180deg, ${DARK} 0%, #150A2B 100%)`,
          }}
        />
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-175 h-50 rounded-full"
          style={{
            background: `radial-gradient(ellipse, ${CYAN}30 0%, transparent 70%)`,
            filter: "blur(60px)",
          }}
        />
        <div
          className="absolute bottom-0 right-0 w-100 h-100 rounded-full"
          style={{
            background: `radial-gradient(circle, ${MAGENTA}15 0%, transparent 70%)`,
            filter: "blur(80px)",
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, ${CYAN} 1px, transparent 0)`,
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      {/* ============ TOP ACCENT LINE ============ */}
      <div
        className="relative z-10 h-0.5 w-full"
        style={{
          background: `linear-gradient(to right, transparent, ${MAGENTA}, ${CYAN}, ${PINK}, transparent)`,
        }}
      />

      {/* ============ MAIN CONTAINER ============ */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {/* ============ LOGO + CTA ROW ============ */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 pb-10 mb-10 border-b" style={{ borderColor: `${CYAN}15` }}>
          {/* ✅ FIXED LOGO — bulletproof approach */}
          <div className="flex flex-col gap-4">
            <div
              className="relative"
              style={{ height: "60px", width: "200px" }}
            >
              <Image
                src="/images/mettlogo11.png"
                alt="Matt Vatcher — Toronto's Running Realtor"
                fill
                style={{
                  objectFit: "contain",
                  objectPosition: "left center",
                }}
                priority
                sizes="200px"
              />
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            <Link
              href="https://calendar.app.google/zf9eeGFTRRb44AKU6"
              className="group inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 hover:scale-105"
              style={{
                background: `linear-gradient(135deg, ${MAGENTA}, ${PURPLE})`,
                color: "#FFFFFF",
                boxShadow: `0 6px 20px ${MAGENTA}40`,
              }}
            >
              Book a Consultation
              <ArrowUpRight
                size={16}
                strokeWidth={2.5}
                className="group-hover:translate-x-1 group-hover:-translate-y-0.5 transition-transform"
              />
            </Link>
            <Link
              href="/properties"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 hover:scale-105"
              style={{
                backgroundColor: `${CYAN}10`,
                color: CYAN,
                border: `1px solid ${CYAN}30`,
              }}
            >
              Browse Properties
              <ArrowUpRight size={16} strokeWidth={2.5} />
            </Link>
          </div>
        </div>

        {/* ============ 4-COLUMN GRID ============ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
          {/* ====== COL 1: NAVIGATION ====== */}
          <div>
            <h4
              className="text-xs uppercase tracking-[0.2em] font-extrabold mb-5"
              style={{ color: "#FFFFFF" }}
            >
              Navigation
            </h4>
            <ul className="space-y-3">
              {navLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="group flex items-center gap-2 text-sm transition-all duration-300"
                    style={{ color: `${CYAN}99` }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "#FFFFFF")}
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.color = `${CYAN}99`)
                    }
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full transition-all duration-300 group-hover:scale-150"
                      style={{ backgroundColor: PINK }}
                    />
                    <span className="group-hover:translate-x-1 transition-transform duration-300">
                      {link.name}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ====== COL 2: CONTACT ====== */}
          <div>
            <h4
              className="text-xs uppercase tracking-[0.2em] font-extrabold mb-5"
              style={{ color: "#FFFFFF" }}
            >
              Contact
            </h4>
            <ul className="space-y-4">
              {contactInfo.map((info, index) => {
                const Icon = info.icon;
                const content = (
                  <div className="flex items-start gap-3">
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                      style={{
                        backgroundColor: `${MAGENTA}20`,
                        color: CYAN,
                      }}
                    >
                      <Icon size={15} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p
                        className="text-[10px] uppercase tracking-wider font-bold mb-0.5"
                        style={{ color: PINK }}
                      >
                        {info.label}
                      </p>
                      <p className="text-sm font-semibold text-white wrap-break-word">
                        {info.value}
                      </p>
                    </div>
                  </div>
                );
                return (
                  <li key={index}>
                    {info.href ? (
                      <a
                        href={info.href}
                        className="block transition-all duration-300 hover:-translate-x-1"
                      >
                        {content}
                      </a>
                    ) : (
                      content
                    )}
                  </li>
                );
              })}
            </ul>
          </div>

          {/* ====== COL 3: CONNECT ====== */}
          <div>
            <h4
              className="text-xs uppercase tracking-[0.2em] font-extrabold mb-5"
              style={{ color: "#FFFFFF" }}
            >
              Connect
            </h4>

            <p
              className="text-xs leading-relaxed mb-4"
              style={{ color: `${CYAN}99` }}
            >
              Follow along on social media for the latest listings and market
              updates.
            </p>

            <div className="flex items-center gap-2.5 mb-6">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.name}
                  className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110 hover:-translate-y-0.5"
                  style={{
                    backgroundColor: `${CYAN}12`,
                    border: `1px solid ${CYAN}30`,
                    color: CYAN,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = social.hoverColor;
                    e.currentTarget.style.borderColor = social.hoverColor;
                    e.currentTarget.style.color = "#FFFFFF";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = `${CYAN}12`;
                    e.currentTarget.style.borderColor = `${CYAN}30`;
                    e.currentTarget.style.color = CYAN;
                  }}
                >
                  {social.icon}
                </a>
              ))}
            </div>

            {/* Quick CTA */}
            <div
              className="p-4 rounded-xl"
              style={{
                backgroundColor: `${CYAN}08`,
                border: `1px solid ${CYAN}15`,
              }}
            >
              <p
                className="text-[10px] uppercase tracking-wider font-bold mb-1"
                style={{ color: PINK }}
              >
                Quick Question?
              </p>
              <p className="text-xs mb-3" style={{ color: `${CYAN}B0` }}>
                Let&apos;s talk about your real estate goals.
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center gap-1.5 text-xs font-bold transition-all duration-300 hover:gap-2.5"
                style={{ color: CYAN }}
              >
                Reach Out
                <ArrowUpRight size={12} strokeWidth={2.5} />
              </Link>
            </div>
          </div>

          {/* ====== COL 4: NEWSLETTER ====== */}
          <div>
            <h4
              className="text-xs uppercase tracking-[0.2em] font-extrabold mb-5"
              style={{ color: "#FFFFFF" }}
            >
              Newsletter
            </h4>

            <div className="flex items-center gap-2 mb-3">
              <Send size={14} style={{ color: PINK }} />
              <p
                className="text-[10px] uppercase tracking-[0.2em] font-bold"
                style={{ color: PINK }}
              >
                Stay Updated
              </p>
            </div>

            <p
              className="text-xs leading-relaxed mb-4"
              style={{ color: `${CYAN}99` }}
            >
              Market insights, new listings &amp; tips delivered monthly.
            </p>

            <form onSubmit={handleSubscribe} className="space-y-2.5">
              <input
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={subscribing}
                required
                minLength={2}
                maxLength={100}
                className="w-full rounded-lg py-2.5 px-4 text-sm text-white placeholder-white/40 focus:outline-none transition-all duration-300 disabled:opacity-50"
                style={{
                  backgroundColor: `${CYAN}08`,
                  border: `1px solid ${CYAN}20`,
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = CYAN;
                  e.currentTarget.style.boxShadow = `0 0 0 2px ${CYAN}20`;
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = `${CYAN}20`;
                  e.currentTarget.style.boxShadow = "none";
                }}
              />
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={subscribing}
                required
                maxLength={200}
                className="w-full rounded-lg py-2.5 px-4 text-sm text-white placeholder-white/40 focus:outline-none transition-all duration-300 disabled:opacity-50"
                style={{
                  backgroundColor: `${CYAN}08`,
                  border: `1px solid ${CYAN}20`,
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = CYAN;
                  e.currentTarget.style.boxShadow = `0 0 0 2px ${CYAN}20`;
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = `${CYAN}20`;
                  e.currentTarget.style.boxShadow = "none";
                }}
              />
              <button
                type="submit"
                disabled={subscribing}
                className="w-full py-2.5 px-4 rounded-lg text-sm font-bold text-white transition-all duration-300 hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
                style={{
                  background: `linear-gradient(135deg, ${MAGENTA}, ${PURPLE})`,
                  boxShadow: `0 4px 14px ${MAGENTA}40`,
                }}
                aria-label="Subscribe"
              >
                {subscribing ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Subscribing...
                  </>
                ) : (
                  <>
                    Subscribe
                    <ArrowUpRight size={14} strokeWidth={2.5} />
                  </>
                )}
              </button>

              {subscribeMsg && (
                <div
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium"
                  style={{
                    backgroundColor:
                      subscribeMsg.type === "success"
                        ? `${CYAN}12`
                        : "rgba(239, 68, 68, 0.10)",
                    border: `1px solid ${
                      subscribeMsg.type === "success"
                        ? `${CYAN}40`
                        : "rgba(239, 68, 68, 0.30)"
                    }`,
                    color: subscribeMsg.type === "success" ? CYAN : "#fca5a5",
                  }}
                >
                  {subscribeMsg.type === "success" ? (
                    <CheckCircle2 size={13} className="shrink-0" />
                  ) : (
                    <AlertCircle size={13} className="shrink-0" />
                  )}
                  {subscribeMsg.text}
                </div>
              )}
            </form>
          </div>
        </div>

        {/* ============ BOTTOM BAR ============ */}
        <div
          className="mt-10 pt-6 flex flex-col sm:flex-row items-center justify-center gap-2 text-center"
          style={{ borderTop: `1px solid ${CYAN}15` }}
        >
          <Link
            href="https://leatonic.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold transition-all duration-300 hover:gap-2"
            style={{ color: `${CYAN}99` }}
            onMouseEnter={(e) => (e.currentTarget.style.color = PINK)}
            onMouseLeave={(e) => (e.currentTarget.style.color = `${CYAN}99`)}
          >
            <span>© {currentYear} Leatonic. All rights reserved.</span>
            <ArrowUpRight
              size={12}
              strokeWidth={2.5}
              className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
            />
          </Link>
        </div>
      </div>

      {/* ============ FLOATING SCROLL-TO-TOP ============ */}
      <button
        onClick={scrollToTop}
        className={`fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full text-white flex items-center justify-center transition-all duration-300 hover:scale-110 ${
          isVisible
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-4 pointer-events-none"
        }`}
        style={{
          background: `linear-gradient(135deg, ${MAGENTA}, ${PURPLE})`,
          boxShadow: `0 8px 24px ${MAGENTA}60`,
        }}
        aria-label="Scroll to top"
      >
        <ArrowUp size={20} strokeWidth={2.5} />
      </button>
    </footer>
  );
}