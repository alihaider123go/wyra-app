// components/VerifyEmailAlert.tsx
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function VerifyEmailAlert() {
  return (
    <Alert className="bg-yellow-100 text-center text-yellow-800">
      <AlertDescription>
        Please verify your email to unlock full access. Check your inbox or spam folder.
      </AlertDescription>
    </Alert>
  );
}
