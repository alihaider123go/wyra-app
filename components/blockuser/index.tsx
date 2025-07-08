"use client";

export default function BlockUserInfo() {
  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-md space-y-6 text-gray-800">
      <h2 className="text-2xl font-semibold flex items-center gap-2">
        <span role="img" aria-label="no entry sign">
          🚫
        </span>
        Block User
      </h2>

      <p>
        Sometimes, the best choice you can make is… <em>neither.</em>
      </p>

      <p>
        We get it — social media’s a place to spark fun debates, hear different opinions, and maybe even laugh at your
        friends’ questionable takes. But every now and then, someone’s vibe just doesn’t vibe with yours. That’s where the
        Block User feature comes in.
      </p>

      <h3 className="text-lg font-semibold mt-4">✋ What happens when you block someone?</h3>
      <ul className="list-disc list-inside space-y-2 text-gray-700">
        <li>They won’t be able to follow you anymore.</li>
        <li>They won’t see your Wyras on their feed or in your Circles.</li>
        <li>They won’t be able to DM you.</li>
        <li>You won’t see their Wyras or Why’s either.</li>
        <li>Peace of mind restored.</li>
      </ul>

      <p>
        It’s like putting up a polite but firm <q>Do Not Disturb</q> sign — no drama, no notifications sent to them.
        They’ll just quietly vanish from your Wyra world.
      </p>

      <h3 className="text-lg font-semibold mt-4">🤔 Can you unblock later?</h3>
      <p>
        Absolutely. People grow. Moods change. If you ever feel like giving them another shot, you can unblock them anytime
        from your Settings &gt; Privacy &gt; Blocked Users list.
      </p>

      <h3 className="text-lg font-semibold mt-4">🔍 How do you block someone?</h3>
      <p>It’s easy:</p>
      <ol className="list-decimal list-inside space-y-2 text-gray-700">
        <li>Go to their profile page.</li>
        <li>Tap or click the three vertical dots in the corner.</li>
        <li>Select Block User.</li>
        <li>Confirm when asked. Done.</li>
      </ol>

      <p>
        Or, if you come across one of their Wyras in your feed and think, “Yeah… nah,” you can also hit the three-dot menu
        on their post and select Block User from there.
      </p>

      <p>
        ❤️ Because your Wyra experience should feel like your choice.
      </p>

      <p>
        Here at Wyra, we’re all about the questions — but who shows up on your feed? That’s totally your call.
      </p>

      <p>
        So go ahead: block confidently, unblock graciously, and keep curating the kind of conversations you actually want
        to have.
      </p>

      <h3 className="text-lg font-semibold mt-4">Still have questions?</h3>
      <p>
        Slide into our inbox at{" "}
        <a href="mailto:info@wyra.xyz" className="text-indigo-600 hover:underline">
          info@wyra.xyz
        </a>{" "}
        — we’re here to help.
      </p>

      <p>Happy Wyra-ing!</p>

      <p className="font-semibold text-center text-lg mt-8">
        Would you rather… let that bad energy linger? <br />
        Or block and move on? 😉
      </p>
    </div>
  );
}
