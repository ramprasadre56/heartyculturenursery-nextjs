"use client";

import { useEffect, useRef, useState, FormEvent } from "react";
import { Mail, Send, CheckCircle, AlertCircle } from "lucide-react";
import styles from "./page.module.css";

/* ─── scroll-reveal hook (same pattern as home page) ─── */
function useScrollReveal(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, isVisible };
}

export default function ContactPage() {
  const formReveal = useScrollReveal(0.1);
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("sending");

    const form = e.currentTarget;
    const formData = new FormData(form);
    formData.append("access_key", "15ab2aa8-6b74-41f9-842d-5c23b25c06de");
    formData.append("subject", (formData.get("subject") as string) || "New Enquiry from Website");
    formData.append("from_name", "Govinda's Horticulture Nursery Website");

    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (data.success) {
        setStatus("success");
        form.reset();
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  return (
    <div className={styles.contactPage}>
      {/* ========== Hero ========== */}
      <section className={styles.heroSection}>
        <div className={styles.heroGlow} />
        <span className={styles.heroEyebrow}>
          <Mail size={14} />
          Get in Touch
        </span>
        <h1 className={styles.heroTitle}>
          We&apos;d Love to{" "}
          <span className={styles.heroTitleAccent}>Hear from You</span>
        </h1>
        <p className={styles.heroSubtitle}>
          Have a question about our plants, need help choosing the right
          variety, or want to place a bulk order? Reach out — we&apos;re here to
          help.
        </p>
      </section>

      <div className={styles.contentContainer}>

        {/* ========== Form ========== */}
        <div
          ref={formReveal.ref}
          className={`${styles.mainGrid} ${styles.reveal} ${formReveal.isVisible ? styles.revealVisible : ""}`}
        >
          <div className={styles.formSection}>
            <h2 className={styles.sectionTitle}>Send Us a Message</h2>
            <p className={styles.sectionSubtitle}>
              Fill out the form and we&apos;ll get back to you as soon as
              possible.
            </p>

            {status === "success" ? (
              <div className={styles.successMessage}>
                <CheckCircle size={32} />
                <h3>Message Sent!</h3>
                <p>Thank you for reaching out. We&apos;ll get back to you shortly.</p>
                <button
                  className={styles.submitButton}
                  onClick={() => setStatus("idle")}
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel} htmlFor="contact-name">
                      Your Name
                    </label>
                    <input
                      id="contact-name"
                      name="name"
                      type="text"
                      className={styles.formInput}
                      placeholder="Ravi Kumar"
                      required
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel} htmlFor="contact-email">
                      Email Address
                    </label>
                    <input
                      id="contact-email"
                      name="email"
                      type="email"
                      className={styles.formInput}
                      placeholder="ravi@example.com"
                      required
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel} htmlFor="contact-phone">
                      Phone Number
                    </label>
                    <input
                      id="contact-phone"
                      name="phone"
                      type="tel"
                      className={styles.formInput}
                      placeholder="+91 98765 43210"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel} htmlFor="contact-subject">
                      Subject
                    </label>
                    <input
                      id="contact-subject"
                      name="subject"
                      type="text"
                      className={styles.formInput}
                      placeholder="Bulk order enquiry"
                    />
                  </div>

                  <div className={styles.formGroupFull}>
                    <label className={styles.formLabel} htmlFor="contact-message">
                      Message
                    </label>
                    <textarea
                      id="contact-message"
                      name="message"
                      className={styles.formTextarea}
                      placeholder="Tell us what you're looking for..."
                      required
                    />
                  </div>
                </div>

                {status === "error" && (
                  <div className={styles.errorMessage}>
                    <AlertCircle size={16} />
                    <span>Something went wrong. Please try again.</span>
                  </div>
                )}

                <button
                  type="submit"
                  className={styles.submitButton}
                  disabled={status === "sending"}
                >
                  <Send size={16} />
                  <span>{status === "sending" ? "Sending..." : "Send Message"}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
