"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type State = "checking" | "ready" | "invalid" | "saving" | "done";

export function InviteContributorClient() {
  const router = useRouter();
  const [state, setState] = useState<State>("checking");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function prepareSession() {
      const supabase = createClient();
      const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
      const accessToken = hash.get("access_token");
      const refreshToken = hash.get("refresh_token");

      if (accessToken && refreshToken) {
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        if (error) {
          if (!cancelled) setState("invalid");
          return;
        }
        window.history.replaceState({}, document.title, window.location.pathname + window.location.search);
      }

      const { data, error } = await supabase.auth.getUser();
      if (!cancelled) setState(!error && data.user ? "ready" : "invalid");
    }
    void prepareSession();
    return () => {
      cancelled = true;
    };
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    if (password.length < 12) {
      setMessage("Usa una password di almeno 12 caratteri.");
      return;
    }
    if (password !== confirm) {
      setMessage("Le due password non coincidono.");
      return;
    }

    setState("saving");
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setState("ready");
      setMessage("Non è stato possibile impostare la password. Il link potrebbe essere scaduto.");
      return;
    }

    setState("done");
    router.replace("/app/contributore");
    router.refresh();
  }

  if (state === "checking") {
    return <p className="text-sm text-neutral-600">Verifica dell’invito…</p>;
  }
  if (state === "invalid") {
    return (
      <div>
        <p className="text-sm leading-6 text-neutral-700">Il link di invito non è valido o è scaduto.</p>
        <Link href="/accedi" className="mt-4 inline-block text-sm font-semibold underline underline-offset-4">Vai all’accesso</Link>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label htmlFor="new-password" className="block text-sm font-medium text-black">Scegli una password</label>
        <input id="new-password" type="password" autoComplete="new-password" minLength={12} required value={password} onChange={(event) => setPassword(event.target.value)} disabled={state === "saving" || state === "done"} className="mt-1 w-full border border-neutral-400 px-3 py-2 text-sm" />
      </div>
      <div>
        <label htmlFor="confirm-password" className="block text-sm font-medium text-black">Conferma password</label>
        <input id="confirm-password" type="password" autoComplete="new-password" minLength={12} required value={confirm} onChange={(event) => setConfirm(event.target.value)} disabled={state === "saving" || state === "done"} className="mt-1 w-full border border-neutral-400 px-3 py-2 text-sm" />
      </div>
      {message ? <p className="text-sm text-black" role="alert">{message}</p> : null}
      <button type="submit" disabled={state === "saving" || state === "done"} className="w-full border border-black bg-black px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">
        {state === "saving" ? "Salvataggio…" : state === "done" ? "Completato" : "Attiva il mio accesso"}
      </button>
    </form>
  );
}
