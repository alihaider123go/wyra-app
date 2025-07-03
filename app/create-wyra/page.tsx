"use client";

import CreateForm from "@/components/wyra/CreateForm";

export default function WyraCreatePage() {
  return (
    <>
      <div className="w-full flex mt-20 justify-center">
        <section className="flex flex-col w-[400px]   bg-gray-50 rounded-lg shadow-md p-6">
          <h1 className="text-3xl w-full text-center font-bold mb-6 font-semibold text-xl text-gray-700 mb-8">
            Create Wyra
          </h1>
          <CreateForm />
        </section>
      </div>
    </>
  );
}
