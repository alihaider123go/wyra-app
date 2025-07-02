import { getUserSession } from "@/actions/auth";

export default async function PrivatePage() {
  const response = await getUserSession();

  return (
    <p className="flex min-h-screen flex-col items-center justify-between p-24">
      Hello, {response?.user?.user_metadata?.firstname}
    </p>
  );
}
