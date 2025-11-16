"use client";

import { useUser } from "@/utils/user/UserContext";

export function Navbar() {
  const { user } = useUser();

  return <div>Welcome, {user?.email}</div>;
}