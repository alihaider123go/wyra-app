import ResetPassword from "@/components/ResetPassword";
import React, { Suspense } from "react";

export default function ResetPasswordPage() {
  return (
    <>
      <div className="w-full flex mt-20 justify-center">
        <section className="flex flex-col w-[400px]">
          <h1 className="text-3xl w-full text-center font-bold mb-6">
            Reset Password
          </h1>
          <Suspense fallback={<div>Loading...</div>}>
            <ResetPassword />
          </Suspense>
        </section>
      </div>
    </>
  );
}
