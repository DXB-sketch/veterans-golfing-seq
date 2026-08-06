import { useEffect, useState } from "react";
import { useAuth } from "../../admin/AuthProvider.jsx";
import {
  listTeam,
  createTeamMember,
  removeTeamMember,
  teamErrorMessage,
} from "../../lib/team.js";
import RibbonRule from "../../components/RibbonRule.jsx";
import AdminField from "./AdminField.jsx";

function formatWhen(iso) {
  if (!iso) return "Never";
  return new Date(iso).toLocaleDateString("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function AdminTeam() {
  const { session } = useAuth();
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [notice, setNotice] = useState(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState(null);

  const [confirmRemove, setConfirmRemove] = useState(null); // member pending confirmation
  const [removingId, setRemovingId] = useState(null);
  const [removeError, setRemoveError] = useState(null);

  async function refresh() {
    try {
      const { users } = await listTeam();
      setTeam(users);
      setLoadError(null);
    } catch {
      setLoadError(
        "Couldn't load the team list. Please check your internet connection and refresh the page."
      );
    }
    setLoading(false);
  }

  useEffect(() => {
    refresh();
  }, []);

  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(null), 8000);
    return () => clearTimeout(t);
  }, [notice]);

  async function handleAdd(e) {
    e.preventDefault();
    setAddError(null);
    setAdding(true);
    try {
      await createTeamMember(email, password);
      setNotice(
        `Account created for ${email.trim().toLowerCase()}. Pass on their email and password so they can sign in.`
      );
      setEmail("");
      setPassword("");
      await refresh();
    } catch (err) {
      setAddError(teamErrorMessage(err.message));
    }
    setAdding(false);
  }

  async function handleRemove(member) {
    setRemoveError(null);
    setRemovingId(member.id);
    try {
      await removeTeamMember(member.id);
      setNotice(`${member.email} can no longer sign in.`);
      setConfirmRemove(null);
      await refresh();
    } catch (err) {
      setRemoveError(teamErrorMessage(err.message));
      setConfirmRemove(null);
    }
    setRemovingId(null);
  }

  return (
    <div className="mx-auto max-w-3xl">
      {notice && (
        <p className="mb-8 border-l-4 border-gold bg-gold/10 p-4 text-lg font-semibold text-navy">
          ✓ {notice}
        </p>
      )}

      <h2 className="font-display text-2xl font-semibold tracking-wide text-navy">
        Committee team
      </h2>
      <RibbonRule className="mt-3" />
      <p className="mt-3 text-ink-muted">
        Everyone listed here can sign in and manage the website. Add a new
        volunteer below, or remove someone when they leave the committee.
      </p>

      {loading ? (
        <p className="mt-10 text-lg text-ink-muted">Loading the team…</p>
      ) : loadError ? (
        <p className="mt-10 text-lg text-ink-muted">{loadError}</p>
      ) : (
        <ul className="mt-8 divide-y divide-ink/10 border-t border-ink/10">
          {team.map((m) => {
            const isYou = m.id === session?.user?.id;
            return (
              <li
                key={m.id}
                className="flex flex-wrap items-center justify-between gap-4 py-5"
              >
                <div>
                  <p className="text-lg font-bold text-navy">
                    {m.email}
                    {isYou && (
                      <span className="ml-3 bg-gold/20 px-2 py-0.5 text-xs font-bold uppercase tracking-[0.08em] text-navy">
                        That&apos;s you
                      </span>
                    )}
                  </p>
                  <p className="mt-0.5 text-ink-muted">
                    Added {formatWhen(m.created_at)} · Last signed in{" "}
                    {formatWhen(m.last_sign_in_at)}
                  </p>
                </div>
                {!isYou &&
                  (confirmRemove?.id === m.id ? (
                    <span className="flex flex-wrap items-center gap-3">
                      <span className="text-base font-semibold text-crimson">
                        Remove their access?
                      </span>
                      <button
                        onClick={() => handleRemove(m)}
                        disabled={removingId === m.id}
                        className="min-h-[48px] bg-crimson px-6 font-body text-sm font-bold uppercase tracking-[0.08em] text-white transition-colors hover:bg-[#8f1a21] disabled:opacity-60"
                      >
                        {removingId === m.id ? "Removing…" : "Yes, remove"}
                      </button>
                      <button
                        onClick={() => setConfirmRemove(null)}
                        className="min-h-[48px] border-2 border-navy px-6 font-body text-sm font-bold uppercase tracking-[0.08em] text-navy transition-colors hover:bg-navy/5"
                      >
                        No, keep
                      </button>
                    </span>
                  ) : (
                    <button
                      onClick={() => {
                        setRemoveError(null);
                        setConfirmRemove(m);
                      }}
                      className="min-h-[48px] border-2 border-crimson px-6 font-body text-sm font-bold uppercase tracking-[0.08em] text-crimson transition-colors hover:bg-crimson hover:text-white"
                    >
                      Remove
                    </button>
                  ))}
              </li>
            );
          })}
        </ul>
      )}

      {removeError && (
        <p className="mt-6 border-l-4 border-crimson bg-crimson/5 p-4 text-base text-ink">
          {removeError}
        </p>
      )}

      <form
        onSubmit={handleAdd}
        className="mt-12 grid gap-7 border-t-4 border-gold bg-paper p-8 shadow-soft md:p-10"
      >
        <div>
          <h3 className="font-display text-xl font-semibold tracking-wide text-navy">
            Add a new team member
          </h3>
          <p className="mt-2 text-ink-muted">
            Fill in their email and choose a starting password for them, then
            pass both on. That&apos;s what they&apos;ll use to sign in.
          </p>
        </div>
        <AdminField
          label="Their email address"
          id="new_email"
          type="email"
          required
          autoComplete="off"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <AdminField
          label="Choose a password for them"
          id="new_password"
          type="text"
          required
          minLength={8}
          autoComplete="off"
          hint="At least 8 characters. It stays visible while you type so you can write it down for them."
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {addError && (
          <p className="border-l-4 border-crimson bg-crimson/5 p-4 text-base text-ink">
            {addError}
          </p>
        )}
        <div>
          <button
            type="submit"
            disabled={adding}
            className="min-h-[56px] bg-gold px-10 font-body text-base font-bold uppercase tracking-[0.08em] text-navy-deep transition-colors hover:bg-gold-bright disabled:opacity-60"
          >
            {adding ? "Creating account…" : "Create their account"}
          </button>
        </div>
      </form>
    </div>
  );
}
