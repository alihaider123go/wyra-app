import ForgotPassword from "@/components/ForgotPassword";
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function ForgotPasswordPage() {
  return (
    <>
      <div className="w-full flex mt-20 mb-20 justify-center">
        <section className="flex flex-col w-[400px]">

          <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-lg animate-slide-in-right">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-2xl font-bold text-gray-800">Forgot Password</CardTitle>
            </CardHeader>
            <CardContent>

          {/* Forgot Password Form */}
          <ForgotPassword />

           </CardContent>
      </Card>
        </section>
      </div>
    </>
  );
}
