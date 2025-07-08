"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PrivacyPolicy() {
  return (
    <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-lg animate-slide-in-right max-w-3xl mx-auto my-10">
      <CardHeader className="text-center pb-6">
        <CardTitle className="text-2xl font-bold text-gray-800">
          Privacy Policy & Data Use
        </CardTitle>
      </CardHeader>

      <CardContent className="text-left space-y-4 text-gray-700 text-sm leading-relaxed">
        <p>
          Hey there, privacy-conscious human (or very polite bot)! At Wyra, we take your privacy and data seriously —
          but not ourselves. This Privacy Policy & Data Use document explains what info we collect, why we collect it,
          how we use it, and what rights you have over it. So grab a coffee and have a read.
        </p>

        <p>
          By using Wyra, you agree to the terms in this policy. If you don’t agree, that’s okay — but please don’t use
          the app.
        </p>

        {[
          {
            title: "1. Who We Are",
            content: (
              <>
                <p>
                  Wyra (“Would You Rather”), operated by Wyra Inc. (collectively, “Wyra,” “we,” “us,” or “our”),
                  provides a social platform where users can ask and answer dual-choice questions and share their
                  opinions.
                </p>
                <p>
                  We’re reachable anytime at{" "}
                  <a
                    href="mailto:info@wyra.xyz"
                    className="text-indigo-600 underline hover:text-indigo-800"
                  >
                    info@wyra.xyz
                  </a>{" "}
                  if you have privacy-related questions or requests.
                </p>
              </>
            ),
          },
          {
            title: "2. What Data We Collect",
            content: (
              <>
                <p>When you use Wyra, we collect the following kinds of information:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>
                    <strong>a) Account Information</strong>: Name, username, email, profile picture (if uploaded),
                    hashed password (never stored in plain text), optional bio, and circles you join.
                  </li>
                  <li>
                    <strong>b) Content You Post</strong>: Wyras, comments, “Why” explanations, likes/dislikes, shares,
                    DMs, and any edits/deletions (for moderation & transparency).
                  </li>
                  <li>
                    <strong>c) Usage Data</strong>: How you interact with Wyra (views, posts, likes), device info, IP
                    address, browser type, language, time zone, and cookies/tracking to improve your experience.
                  </li>
                  <li>
                    <strong>d) Reported Content</strong>: When you report a post, the post and related metadata is
                    sent to our moderation team.
                  </li>
                </ul>
              </>
            ),
          },
          {
            title: "3. Why We Collect Data",
            content: (
              <ul className="list-disc list-inside space-y-1">
                <li>✅ To operate Wyra and deliver our services</li>
                <li>✅ To personalize your feed and recommend content & circles</li>
                <li>✅ To improve, test, and fix features</li>
                <li>✅ To keep Wyra safe, fair, and free of harmful behavior</li>
                <li>✅ To send you account-related emails (e.g., password resets, feature updates)</li>
                <li>✅ To comply with laws and enforce our Terms of Service</li>
              </ul>
            ),
          },
          {
            title: "4. Legal Bases for Processing (for our EU/UK friends)",
            content: (
              <ul className="list-disc list-inside space-y-1">
                <li>Your consent (e.g., signing up)</li>
                <li>To perform our contract with you (providing the app)</li>
                <li>Our legitimate interests (improving Wyra, preventing abuse)</li>
                <li>To comply with legal obligations</li>
              </ul>
            ),
          },
          {
            title: "5. Who We Share Your Data With",
            content: (
              <ul className="list-disc list-inside space-y-1">
                <li>
                  With service providers who help us run Wyra (cloud hosting, analytics) — all bound by confidentiality.
                </li>
                <li>If legally required (e.g., court orders, to prevent harm).</li>
                <li>With your consent (e.g., if you share content outside the app).</li>
                <li>We don’t sell or rent your info to advertisers or spammers.</li>
              </ul>
            ),
          },
          {
            title: "6. How Long We Keep Your Data",
            content:
              "We retain your data while your account is active and afterward only as needed for legal or security purposes. You can delete your account anytime from Settings, but public content may remain in others’ feeds or backups for a limited time.",
          },
          {
            title: "7. Your Privacy Rights",
            content: (
              <>
                <p>You may have the right to:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Access the data we hold about you</li>
                  <li>Request correction or deletion of your data</li>
                  <li>Request we stop processing your data</li>
                  <li>Download your data in a portable format</li>
                  <li>Opt out of certain tracking (cookies, targeted suggestions)</li>
                </ul>
                <p>
                  To exercise your rights, email us at{" "}
                  <a
                    href="mailto:info@wyra.xyz"
                    className="text-indigo-600 underline hover:text-indigo-800"
                  >
                    info@wyra.xyz
                  </a>
                  . If you're in the EU/EEA, you can also complain to your local data authority.
                </p>
              </>
            ),
          },
          {
            title: "8. Keeping Your Data Safe",
            content:
              "We use industry-standard security measures (encryption, secure servers, etc.) to protect your data. That said, no system is 100% secure — please use a strong password and don’t share it.",
          },
          {
            title: "9. Children’s Privacy",
            content:
              "Wyra isn’t for kids under 13 (or higher age if required in your country). We don’t knowingly collect data from children under 13 — if we learn we have, we’ll delete it immediately.",
          },
          {
            title: "10. Cookies & Tracking",
            content: (
              <>
                <p>We use cookies and similar tech to:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Keep you logged in</li>
                  <li>Remember your preferences</li>
                  <li>Understand how people use Wyra to improve it</li>
                </ul>
                <p>
                  You can manage or block cookies in your browser settings — though some features may stop working
                  correctly without them.
                </p>
              </>
            ),
          },
          {
            title: "11. Changes to This Policy",
            content:
              "We may update this policy from time to time. We’ll post updates here and notify you in-app or via email if the changes are significant.",
          },
          {
            title: "12. Contact Us",
            content: (
              <p>
                Questions, concerns, compliments, or privacy jokes? Email our team at{" "}
                <a
                  href="mailto:info@wyra.xyz"
                  className="text-indigo-600 underline hover:text-indigo-800"
                >
                  info@wyra.xyz
                </a>{" "}
                — we’re here to help.
              </p>
            ),
          },
        ].map(({ title, content }, i) => (
          <div key={i}>
            <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
            <div>{content}</div>
          </div>
        ))}

        <p>
          Thanks for trusting us with your data — and for being part of the Wyra community. Now go start a great
          debate.
        </p>
      </CardContent>
    </Card>
  );
}
