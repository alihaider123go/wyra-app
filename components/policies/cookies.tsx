"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Cookies() {
  return (
    <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-lg animate-slide-in-right max-w-3xl mx-auto my-10">
      <CardHeader className="text-center pb-6">
        <CardTitle className="text-2xl font-bold text-gray-800">
          Cookies Policy
        </CardTitle>
      </CardHeader>

      <CardContent className="text-left space-y-4 text-gray-700 text-sm leading-relaxed">
        <p>
          Welcome to Wyra’s Cookies Policy — where we talk about the other kind of cookies. Not the delicious,
          chocolate-chip kind (sadly), but the small text files that help make your Wyra experience smooth, secure,
          and fun. We know privacy and transparency are important to you — and they’re important to us too. So here’s
          everything you need to know about how we use cookies (and similar technologies) when you visit and use Wyra.
        </p>

        <h3 className="text-lg font-semibold text-gray-800">What are cookies?</h3>
        <p>
          Cookies are tiny text files that your browser saves on your device when you visit a website or use a web app
          like Wyra. These little files store bits of information about your visit — like your login status,
          preferences, or which pages you’ve browsed — to help the site work better for you. Some cookies are
          “session cookies” (they disappear when you close your browser) and others are “persistent cookies” (they stay
          for a while so we can remember you next time). We also sometimes use similar technologies like pixels and
          local storage — we’ll just call all of these “cookies” here for simplicity.
        </p>

        <h3 className="text-lg font-semibold text-gray-800">Why does Wyra use cookies?</h3>
        <ul className="list-disc list-inside space-y-1">
          <li>Keep you signed in so you don’t have to re-enter your details every time.</li>
          <li>Remember your settings and preferences (like your Circles or display choices).</li>
          <li>Show you trending Wyras and keep track of your interactions (likes, dislikes, comments, etc.).</li>
          <li>Help protect your account and keep Wyra secure.</li>
          <li>Learn how people use Wyra so we can improve the app and make it even more awesome for you.</li>
        </ul>
        <p>
          We also use third-party cookies from trusted partners to help us understand how you interact with Wyra and
          (in the future) to offer relevant promotions or features we think you’ll love.
        </p>

        <h3 className="text-lg font-semibold text-gray-800">Types of cookies we use:</h3>
        <ul className="list-none space-y-2">
          <li>✅ <strong>Strictly Necessary Cookies</strong> — Essential for Wyra to function properly (e.g., keeping you logged in, enabling navigation).</li>
          <li>✅ <strong>Performance & Analytics Cookies</strong> — Help us measure how people use Wyra so we can improve it.</li>
          <li>✅ <strong>Functional Cookies</strong> — Remember your preferences and choices to personalize your experience.</li>
          <li>✅ <strong>Targeting Cookies</strong> (if enabled in future) — Help us show you content or offers more relevant to your interests.</li>
        </ul>

        <h3 className="text-lg font-semibold text-gray-800">Your choices:</h3>
        <p>
          You’re in control. Most browsers let you block or delete cookies from your settings. But just so you know: if
          you block essential cookies, some parts of Wyra might not work properly (like staying logged in or posting a
          Wyra). You can also adjust your cookie preferences anytime by checking your browser settings.
        </p>

        <h3 className="text-lg font-semibold text-gray-800">Got questions?</h3>
        <p>
          If you’ve read this far, you’re our kind of person. If you’d like more details about how we handle your data,
          feel free to also check our Privacy Policy. And if you have any questions, thoughts, or feedback about our
          cookie use, don’t hesitate to email us at{" "}
          <a href="mailto:info@wyra.xyz" className="text-indigo-600 font-medium underline hover:text-indigo-800">
            info@wyra.xyz
          </a>. We’ll be happy to help — no crumbs left behind.
        </p>
      </CardContent>
    </Card>
  );
}
