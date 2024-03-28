"use client";
import { signIn, signOut } from "next-auth/react";

export function Login({ isSignout }: { isSignout?: boolean }) {
  const handleLogin = async () => {
    if (isSignout) {
      await signOut();
    } else {
      await signIn("google");
    }
  };

  return (
    <button onClick={handleLogin}>{isSignout ? "Sign out" : "Login"}</button>
  );
}
