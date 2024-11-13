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
    <button
      className='p-4 bg-black rounded text-white w-40'
      onClick={handleLogin}
    >
      {isSignout ? "Sign out" : "Login"}
    </button>
  );
}
