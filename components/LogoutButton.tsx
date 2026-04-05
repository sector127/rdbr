"use client";

import { signOut } from "next-auth/react";
import { Button } from "./Button";

export function LogoutButton() {
  return (
    <Button 
      variant="ghost" 
      className="text-sm h-10 px-4"
      onClick={() => signOut({ callbackUrl: "/" })}
    >
      Log Out
    </Button>
  );
}
