"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
export default function AboutUs() {
  return (
    <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-lg animate-slide-in-right">
      {" "}
      <CardHeader className="text-center pb-6">
        {" "}
        <CardTitle className="text-2xl font-bold text-gray-800">
          About Us
        </CardTitle>{" "}
      </CardHeader>{" "}
      <CardContent className="text-left">
        At Wyra, we believe the best conversations start with a good question —
        or better yet, two. We created Wyra (short for Would You Rather) to give
        you a fun, effortless way to spark debates, share opinions, and see what
        your friends, followers, and even total strangers would choose. Whether
        it’s life’s big dilemmas or the silliest “what ifs,” Wyra is your place
        to ask, answer, and explain why (or keep it mysterious — the Why is
        optional, after all). <br /><br />We know social media can sometimes feel… a little
        stale. That’s why we built Wyra with features that feel fresh but
        familiar: you can follow and DM your friends, dive into trending Wyras
        to see what’s hot, or join Circles to talk about the topics you really
        care about — football fans, foodies, film buffs, we see you. Every Wyra
        is a chance to connect, agree, disagree (politely, of course), and maybe
        discover a perspective you hadn’t thought of before. Because sometimes
        it’s not just about what you choose, but why. <br /> <br />At the end of the day,
        Wyra is about making social media more social again — more thoughtful,
        more playful, and more you. So go ahead: ask your burning questions,
        pick your side, and share your Why (or don’t, we won’t judge). Just be
        ready for people to agree, disagree, and maybe even spark a whole
        conversation. We’re here to help you explore the endless little choices
        that make life interesting — one Wyra at a time.
      </CardContent>
    </Card>
  );
}
