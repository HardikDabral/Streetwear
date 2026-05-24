import { Suspense } from "react";
import AuthForm from "@/app/components/Auth/AuthForm";

export const metadata = { title: "Create account — Karmic" };

export default function SignupPage() {
  return (
    <Suspense fallback={null}>
      <AuthForm mode="signup" />
    </Suspense>
  );
}
