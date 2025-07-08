"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function CommunityGuidelines() {
  return (
    <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-lg animate-slide-in-right max-w-3xl mx-auto my-10">
      <CardHeader className="text-center pb-6">
        <CardTitle className="text-2xl font-bold text-gray-800">
          Community Guidelines
        </CardTitle>
      </CardHeader>

      <CardContent className="text-left space-y-4 text-gray-700 text-sm leading-relaxed">
        <p>
          Welcome to Wyra — the place where curiosity sparks conversation. Whether you’re here for the hot takes, the
          deep debates, or just some harmless “Would you rather” fun, we’re glad you’re part of our community. To keep
          Wyra a safe, respectful, and enjoyable space for everyone, we’ve put together these Community Guidelines.
          They’re not just rules — they’re our way of saying: let’s play nice, keep it legal, and make every Why count.
        </p>

        {[
          {
            title: "1. Be Kind, Not Cruel",
            content: (
              <>
                <p>
                  We know the internet can sometimes get heated — but here on Wyra, mutual respect is non-negotiable.
                  Hate speech, harassment, bullying, threats, or targeting someone based on race, ethnicity, nationality,
                  religion, gender identity, sexual orientation, disability, or appearance is strictly prohibited.
                </p>
                <p>
                  You’re free to disagree and debate, but keep it civil. We reserve the right to remove content or ban
                  accounts that cross the line into abusive behavior. If you see something out of line, report it using
                  the three-dot menu and we’ll take a look.
                </p>
              </>
            ),
          },
          {
            title: "2. Keep It Legal (Yes, That’s a Thing)",
            content: (
              <>
                <p>
                  No one likes legal trouble — not you, not us. So don’t post or share anything that’s illegal where
                  you live, or under international laws. That includes, but isn’t limited to:
                </p>
                <ul className="list-disc list-inside ml-4">
                  <li>Content that promotes or depicts violence, terrorism, child exploitation, or self-harm</li>
                  <li>Human trafficking, revenge porn, or non-consensual sharing of private information</li>
                  <li>Spam, scams, or intellectual property theft (e.g., reposting someone else’s work without rights)</li>
                </ul>
                <p>
                  Remember: by posting on Wyra, you affirm that you own or have rights to the content you’re sharing.
                </p>
              </>
            ),
          },
          {
            title: "3. Keep It Appropriate (and Age-Appropriate)",
            content: (
              <>
                <p>
                  Wyra is designed for users 13 and older, and we want the platform to feel welcoming for everyone.
                  Please avoid posting sexually explicit material, excessive gore, or anything that would violate
                  obscenity laws in your country.
                </p>
                <p>
                  Mild humor and innuendo? Sure. Graphic content that could traumatize or endanger others? Absolutely
                  not. Use good judgment — if you wouldn’t say it in a room full of strangers, maybe don’t post it here.
                </p>
              </>
            ),
          },
          {
            title: "4. Respect Privacy — Yours and Others’",
            content: (
              <>
                <p>
                  Never share someone’s personal information (like phone numbers, home addresses, IDs, private photos,
                  or financial details) without their clear consent.
                </p>
                <p>
                  Protect your own privacy too — remember that your posts, replies, and “Why” reasons are public and
                  could be screenshotted, shared, or reported. Wyra will always handle your account data responsibly and
                  in compliance with applicable data protection and privacy laws.
                </p>
              </>
            ),
          },
          {
            title: "5. Don’t Game the System",
            content: (
              <>
                <p>
                  We love seeing your posts get likes and comments — but artificially inflating engagement through bots,
                  fake accounts, or manipulation of our systems isn’t cool.
                </p>
                <p>
                  Wyra works best when it reflects real opinions from real people. Be authentic. Be yourself.
                </p>
              </>
            ),
          },
          {
            title: "6. When in Doubt, Report",
            content: (
              <>
                <p>
                  See something that feels off? Click those three dots and report the post. You’ll get a confirmation
                  message and we’ll review it as quickly as possible.
                </p>
                <p>
                  We take every report seriously — but we also encourage you to use this feature responsibly and not
                  just because you don’t agree with someone’s opinion. Healthy disagreement is part of what makes Wyra
                  interesting.
                </p>
              </>
            ),
          },
          {
            title: "7. Consequences and Enforcement",
            content: (
              <p>
                We review all reports and violations case by case. Depending on severity, consequences can include
                content removal, feature restrictions, temporary suspension, or permanent ban. Serious violations (like
                threats of violence or illegal activity) may also be reported to law enforcement as required by law.
              </p>
            ),
          },
          {
            title: "A Final Word",
            content: (
              <p>
                We built Wyra to be a space where everyone can feel free to ask questions, make choices, and explain
                their Why without fear of abuse or harm. These guidelines help protect that vision — and they apply to
                everything you post, comment, DM, or share on the platform. We reserve the right to update them as
                needed, and your continued use of Wyra means you agree to play by the rules.
                <br />
                <br />
                If you have questions about these guidelines or just want to chat about them, feel free to drop us a
                line at{" "}
                <a
                  href="mailto:info@wyra.xyz"
                  className="text-indigo-600 underline hover:text-indigo-800"
                >
                  info@wyra.xyz
                </a>
                . Thanks for helping us keep Wyra awesome.
              </p>
            ),
          },
        ].map(({ title, content }, idx) => (
          <div key={idx}>
            <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
            <div className="mt-1">{content}</div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
