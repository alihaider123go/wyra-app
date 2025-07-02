import ClientComponent from "@/components/ClientComponent";
import WyraTimeLine from "@/components/wyra/TimeLine";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      {/* <ClientComponent /> */}
      <WyraTimeLine />
    </main>
  );
}
