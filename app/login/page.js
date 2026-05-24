import { Suspense } from "react";
import AuthForm from "@/app/components/Auth/AuthForm";

export const metadata = { title: "Sign in — Karmic" };

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <AuthForm mode="login" />
    </Suspense>
  );
}
