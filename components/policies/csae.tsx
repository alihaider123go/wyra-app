"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function CSAEPolicy() {
  return (
    <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-lg animate-slide-in-right max-w-3xl mx-auto my-10">
      <CardHeader className="text-center pb-6">
        <CardTitle className="text-2xl font-bold text-gray-800">
          Child Sexual Abuse and Exploitation (CSAE) Policy
        </CardTitle>
      </CardHeader>

      <CardContent className="text-left space-y-4 text-gray-700 text-sm leading-relaxed">
        <p>
          At Wyra, we’re here to help you spark conversations, ask bold questions, and share your “Why”s — but
          protecting children is not up for debate. We are firmly committed to preventing and responding to all forms of
          child sexual abuse and exploitation (CSAE) on our platform. This page outlines what CSAE means, what’s prohibited,
          how we enforce our rules, how to report concerns, and what resources are available if you or someone you know
          needs help.
        </p>

        <h3 className="text-lg font-semibold text-gray-800">1. Our Commitment</h3>
        <p>
          We believe every child has the right to grow up free from sexual abuse, exploitation, and harm. That’s why Wyra
          has a zero-tolerance policy towards any content or behavior that depicts, enables, encourages, or trivializes CSAE.
          Our commitment is guided by:
        </p>
        <ul className="list-disc list-inside ml-4">
          <li>The United Nations Convention on the Rights of the Child (CRC).</li>
          <li>The Optional Protocol on the Sale of Children, Child Prostitution and Child Pornography.</li>
          <li>National laws in all countries where we operate (including but not limited to the U.S. Protect Act, U.K. Sexual Offences Act, and EU Digital Services Act).</li>
          <li>International best practices, including recommendations from NCMEC (National Center for Missing & Exploited Children), Internet Watch Foundation (IWF), and WePROTECT Global Alliance.</li>
        </ul>

        <h3 className="text-lg font-semibold text-gray-800">2. What’s Prohibited on Wyra</h3>
        <p>
          The following are strictly forbidden on Wyra. Posting, sharing, soliciting, or engaging in any of these behaviors
          will result in immediate removal of content, permanent banning of accounts, and escalation to law enforcement
          where required.
        </p>

        <strong>CSAE Content:</strong>
        <ul className="list-disc list-inside ml-4">
          <li>✅ Any media (photos, videos, illustrations, animations, memes) that depicts the sexual abuse or exploitation of a minor (under 18).</li>
          <li>✅ “Sexualized” depictions of children even if stylized, drawn, or digital (e.g., anime or AI-generated).</li>
          <li>✅ Sexual commentary, fantasies, or hypothetical “Wyras” about children that are exploitative, obscene, or normalize abuse.</li>
        </ul>

        <strong>Grooming & Solicitation:</strong>
        <ul className="list-disc list-inside ml-4">
          <li>✅ Using Wyra to approach or befriend minors with the intent of sexual exploitation.</li>
          <li>✅ Asking for, offering, or exchanging explicit material of minors.</li>
          <li>✅ Coercing, blackmailing, or threatening minors into sharing sexual content (sometimes called sextortion).</li>
        </ul>

        <strong>Facilitating Exploitation:</strong>
        <ul className="list-disc list-inside ml-4">
          <li>✅ Sharing links to websites, services, or communities that host CSAE content.</li>
          <li>✅ Advertising or arranging paid sexual services involving minors.</li>
        </ul>

        <h3 className="text-lg font-semibold text-gray-800">3. How We Detect & Respond</h3>
        <p>We take a proactive and reactive approach to keep CSAE off Wyra:</p>
        <ul className="list-disc list-inside ml-4">
          <li>We use automated tools to scan uploads against known CSAE material databases (such as NCMEC’s CyberTipline hash lists).</li>
          <li>Our moderators review all reported posts, comments, and DMs within 24 hours.</li>
          <li>Verified CSAE content or behavior is immediately removed and escalated to relevant child protection agencies and law enforcement, as required by law.</li>
          <li>Repeat offenders and accounts set up for grooming or trafficking are permanently banned and blocked from rejoining.</li>
          <li>We may preserve evidence of CSAE activity in accordance with legal requirements to assist investigations.</li>
        </ul>

        <h3 className="text-lg font-semibold text-gray-800">4. Reporting CSAE Content or Behavior</h3>
        <p>If you see something suspicious, don’t scroll past — please report it.</p>
        <p>How to report:</p>
        <ul className="list-disc list-inside ml-4">
          <li>✅ On posts or comments: tap the three dots (…) menu and select Report.</li>
          <li>✅ On direct messages: tap and hold the message and select Report.</li>
          <li>✅ Or email us directly at <a href="mailto:info@wyra.xyz" className="text-indigo-600 underline">info@wyra.xyz</a> with details and screenshots if possible.</li>
        </ul>
        <p>
          When you report CSAE-related content, we treat it with urgency and confidentiality. If you make a good-faith report,
          you will not face retaliation or penalties — even if it turns out to be a false alarm.
        </p>

        <h3 className="text-lg font-semibold text-gray-800">5. Legal Definitions & Age of Consent</h3>
        <p>For the purposes of Wyra:</p>
        <ul className="list-disc list-inside ml-4">
          <li>A child is defined as any person under 18, regardless of local age of consent laws for sexual activity.</li>
          <li>Content may still be considered CSAE even if the minor appears to consent or the content is user-generated/self-generated (because minors cannot legally consent to the distribution of their own sexualized images).</li>
          <li>Grooming, sextortion, and solicitation are crimes even if no physical abuse occurs.</li>
        </ul>

        <h3 className="text-lg font-semibold text-gray-800">6. What to Do if You’re Affected</h3>
        <p>If you’re under 18 and someone is making you feel uncomfortable, pressuring you to share explicit material, or threatening you — please know it’s not your fault, and help is available:</p>
        <ul className="list-disc list-inside ml-4">
          <li>Report the behavior to Wyra immediately.</li>
          <li>Block the user and don’t respond to their messages.</li>
          <li>Contact a trusted adult or a child protection helpline in your country.</li>
          <li>In the U.S.: <a href="https://cybertipline.org" className="underline text-indigo-600">cybertipline.org</a> or 1-800-THE-LOST</li>
          <li>In the U.K.: <a href="https://ceop.police.uk" className="underline text-indigo-600">ceop.police.uk</a></li>
          <li>Globally: <a href="https://childhelplineinternational.org" className="underline text-indigo-600">childhelplineinternational.org</a></li>
        </ul>

        <h3 className="text-lg font-semibold text-gray-800">7. Our Shared Responsibility</h3>
        <p>Keeping Wyra safe for everyone — especially children — is a team effort. As a community, we ask all our users to:</p>
        <ul className="list-disc list-inside ml-4">
          <li>Think before you post: if your question involves a minor, keep it wholesome and respectful.</li>
          <li>Respect boundaries when interacting with others, especially users who may be under 18.</li>
          <li>Speak up if you see something concerning — you might just save someone from harm.</li>
        </ul>

        <h3 className="text-lg font-semibold text-gray-800">8. Contact Us</h3>
        <p>
          If you have questions about this policy, need to make a report, or want to suggest ways we can improve our protections
          for minors, please reach out to us anytime at <a href="mailto:info@wyra.xyz" className="text-indigo-600 underline">info@wyra.xyz</a>. Our team is here to listen, take action, and keep our community safe.
        </p>

        <p>
          Thanks for helping us keep Wyra the fun, creative, and respectful space it was meant to be — where everyone can share,
          explore, and ask the big questions… without putting anyone at risk.
        </p>
      </CardContent>
    </Card>
  );
}
