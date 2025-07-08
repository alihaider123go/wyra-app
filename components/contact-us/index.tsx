"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
export default function ContactUs() {
  return (
    <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-lg animate-slide-in-right">
      {" "}
      <CardHeader className="text-center pb-6">
        {" "}
        <CardTitle className="text-2xl font-bold text-gray-800">
          Contact Us
        </CardTitle>{" "}
      </CardHeader>{" "}
      <CardContent className="text-left">
        Got a burning question, a brilliant idea, or just want to say hi? We’d
        rather hear from you. Whether you’ve spotted a bug, have feedback on how
        to make Wyra even better, or just want to chat about your favorite
        Wyras, drop us a line anytime at{" "}
        <a
          href="mailto:info@wyra.xyz"
          className="text-indigo-600 font-medium underline hover:text-indigo-800"
        >
          info@wyra.xyz
        </a>
        . We check our inbox like it’s a trending post, so you can expect a
        thoughtful reply. Don’t be shy — we love hearing the why behind what
        you’re thinking!
      </CardContent>
    </Card>
  );
}
