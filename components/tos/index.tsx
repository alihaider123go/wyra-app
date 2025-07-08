"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TermsOfService() {
  return (
    <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-lg animate-slide-in-right max-w-3xl mx-auto my-10">
      <CardHeader className="text-center pb-6">
        <CardTitle className="text-2xl font-bold text-gray-800">
          Terms & Conditions
        </CardTitle>
      </CardHeader>

      <CardContent className="text-left space-y-4 text-gray-700 text-sm leading-relaxed">
        <p>
          Welcome to Wyra — the place where every question has two sides and every answer has a story. Before you dive
          into the debates, here’s the legal stuff you agree to when using our app. We promise to keep it human, not
          robotic — but still legally sound.
        </p>

        {[
          {
            title: "1. Acceptance of Terms",
            content:
              "By accessing or using Wyra (the “App”), you agree to these Terms & Conditions (“Terms”), our Privacy Policy, and any other rules we may post. If you don’t agree, we’d rather you didn’t use the app — no hard feelings.",
          },
          {
            title: "2. What is Wyra?",
            content:
              "Wyra (“Would You Rather”) lets users post two-option questions for others to choose between and optionally explain why. You can interact with posts, join Circles, follow users, send DMs, and express yourself — within reason (see Section 6). The App is available on web and mobile.",
          },
          {
            title: "3. Who Can Use Wyra?",
            content:
              "Wyra is designed for users aged 13 and older (or the minimum digital age in your country, whichever is higher). If you’re under 18, you must have parental consent. By using Wyra, you promise you’re old enough and legally allowed to use social media in your location.",
          },
          {
            title: "4. Your Account",
            content: (
              <ul className="list-disc list-inside space-y-1">
                <li>You’re responsible for your account and everything that happens through it.</li>
                <li>Don’t share your password with others.</li>
                <li>
                  If you spot suspicious activity on your account, email us at{" "}
                  <a
                    href="mailto:info@wyra.xyz"
                    className="text-indigo-600 underline hover:text-indigo-800"
                  >
                    info@wyra.xyz
                  </a>.
                </li>
                <li>
                  We reserve the right to suspend or delete accounts that violate these Terms or applicable laws.
                </li>
              </ul>
            ),
          },
          {
            title: "5. User-Generated Content",
            content: (
              <ul className="list-disc list-inside space-y-1">
                <li>
                  When you post a Wyra, respond to one, comment, or upload anything, you grant Wyra a non-exclusive,
                  royalty-free, worldwide license to use, display, reproduce, and share your content on the platform.
                </li>
                <li>You retain all ownership of your content — it’s still yours.</li>
                <li>
                  But don’t post stuff that you don’t have the rights to, or that breaks the law or our guidelines (see
                  next section).
                </li>
              </ul>
            ),
          },
          {
            title: "6. Rules of the Game (Acceptable Use Policy)",
            content: (
              <>
                <p>
                  We love spirited debate — but keep it respectful, legal, and fun. By using Wyra, you agree not to:
                </p>
                <ul className="list-disc list-inside space-y-1">
                  <li>
                    Post content that’s unlawful, hateful, threatening, defamatory, obscene, or discriminatory.
                  </li>
                  <li>Harass, bully, or impersonate others.</li>
                  <li>Share private or confidential information without consent.</li>
                  <li>Spam people or manipulate platform metrics (likes, shares, etc.).</li>
                  <li>Attempt to hack, reverse-engineer, or otherwise mess with Wyra’s tech.</li>
                </ul>
                <p>
                  If you see something that violates these rules, please report it via the three-dot menu on the post.
                </p>
              </>
            ),
          },
          {
            title: "7. Intellectual Property",
            content:
              "Wyra and its logo, design, and software are owned by us. You agree not to copy, modify, distribute, sell, or otherwise exploit any part of the App that isn’t your own content without our written permission.",
          },
          {
            title: "8. Privacy",
            content:
              "Your privacy matters to us. We collect and use your information as described in our Privacy Policy. We’ll never sell your data to creepy marketers.",
          },
          {
            title: "9. Termination",
            content:
              "We hope you stick around, but you can stop using Wyra anytime. We may suspend or terminate your access if you violate these Terms or applicable law — though we’ll usually give you a heads-up.",
          },
          {
            title: "10. Disclaimers and Limitation of Liability",
            content:
              'Wyra is provided “as is” and “as available.” We can’t guarantee the app will always be bug-free or that everyone on the app will play nice. Use at your own risk. To the fullest extent allowed by law, Wyra and its team aren’t liable for any indirect, incidental, or consequential damages arising out of your use of the app.',
          },
          {
            title: "11. International Users",
            content:
              "We’re global, but we comply with U.S. laws and some international regulations like GDPR. If you’re accessing Wyra from outside the U.S., you’re responsible for complying with your local laws too.",
          },
          {
            title: "12. Changes to These Terms",
            content:
              "We might update these Terms from time to time. When we do, we’ll post the new version on our site and/or app. Keep an eye out — continued use means you agree to the updated Terms.",
          },
          {
            title: "13. Contact Us",
            content: (
              <p>
                Have a question? Need help? Want to argue about pineapple on pizza? We’re all ears at{" "}
                <a
                  href="mailto:info@wyra.xyz"
                  className="text-indigo-600 underline hover:text-indigo-800"
                >
                  info@wyra.xyz
                </a>
                . Thanks for being part of Wyra. Stay curious, stay kind, and keep asking great questions!
              </p>
            ),
          },
        ].map(({ title, content }, i) => (
          <div key={i}>
            <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
            <div>{content}</div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
