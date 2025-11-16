"use client";
import { useState } from "react";

export default function InvitePage() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  async function invite(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    const res = await fetch("/api/admin/invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const body = await res.json();
    setMsg(res.ok ? `Invite sent to ${email}` : `Error: ${body.error}`);
  }

  return (
    <form onSubmit={invite} className="grid gap-3 max-w-sm mx-auto">
      <input
        className="border rounded p-2"
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="newuser@example.com"
      />
      <button className="border rounded p-2">Send invite</button>
      {msg && <p>{msg}</p>}
    </form>
  );
}
