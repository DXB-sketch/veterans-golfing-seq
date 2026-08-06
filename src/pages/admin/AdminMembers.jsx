import { useEffect, useRef, useState } from "react";
import { supabase } from "../../lib/supabase.js";
import RibbonRule from "../../components/RibbonRule.jsx";
import AdminField from "./AdminField.jsx";

const BRANCH_OPTIONS = [
  { value: "", label: "— Choose —" },
  { value: "Army", label: "Army" },
  { value: "Navy", label: "Navy" },
  { value: "Air Force", label: "Air Force" },
  { value: "Family member", label: "Family member" },
];

const GA_OPTIONS = [
  { value: "", label: "Not sure" },
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
];

const emptyForm = {
  name: "",
  email: "",
  phone: "",
  service_branch: "",
  ga_handicap: "",
  golf_links_number: "",
};

function formatDate(iso) {
  if (!iso) return "—";
  return new Date(`${iso}T00:00:00`).toLocaleDateString("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// A year from today in Queensland time, as YYYY-MM-DD — the standard
// membership term. Same approach as api/create-payment.js, so a member
// added early in the morning doesn't expire a day early.
function oneYearFromToday() {
  return new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toLocaleDateString(
    "en-CA",
    { timeZone: "Australia/Brisbane" }
  );
}

export default function AdminMembers() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState(null);
  const [formError, setFormError] = useState(null);
  const [togglingId, setTogglingId] = useState(null);
  const [invitingId, setInvitingId] = useState(null);
  const formRef = useRef(null);

  async function loadMembers() {
    const { data, error } = await supabase
      .from("members")
      .select("*")
      .order("name", { ascending: true });
    if (error) {
      setLoadError(
        "Couldn't load the members list. If the site was just updated, the members register may not be switched on yet — otherwise check your internet connection and refresh the page."
      );
    } else {
      setLoadError(null);
      setMembers(data ?? []);
    }
    setLoading(false);
  }

  useEffect(() => {
    loadMembers();
  }, []);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  function startEdit(m) {
    setEditingId(m.id);
    setForm({
      name: m.name ?? "",
      email: m.email ?? "",
      phone: m.phone ?? "",
      service_branch: m.service_branch ?? "",
      ga_handicap: m.ga_handicap === true ? "yes" : m.ga_handicap === false ? "no" : "",
      golf_links_number: m.golf_links_number ?? "",
    });
    setNotice(null);
    setFormError(null);
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyForm);
    setFormError(null);
  }

  function buildPayload() {
    return {
      name: form.name.trim(),
      email: form.email.trim().toLowerCase(),
      phone: form.phone.trim() || null,
      service_branch: form.service_branch || null,
      ga_handicap:
        form.ga_handicap === "yes" ? true : form.ga_handicap === "no" ? false : null,
      golf_links_number: form.golf_links_number.trim() || null,
    };
  }

  // Add a paid member: insert the members row (active, one-year term), then
  // ask the server to email them an account invite.
  async function handleSubmit(e) {
    e.preventDefault();
    setNotice(null);
    setFormError(null);
    setSaving(true);

    const payload = buildPayload();

    if (editingId) {
      const { error } = await supabase
        .from("members")
        .update(payload)
        .eq("id", editingId);
      setSaving(false);
      if (error) {
        setFormError(
          "Couldn't save those changes — please check your internet connection and try again."
        );
        return;
      }
      setNotice(`${payload.name}'s details have been saved.`);
      cancelEdit();
      loadMembers();
      return;
    }

    const { error: insertError } = await supabase.from("members").insert({
      ...payload,
      status: "active",
      expires_at: oneYearFromToday(),
    });
    if (insertError) {
      setSaving(false);
      setFormError(
        insertError.code === "23505"
          ? "There's already a member with that email address."
          : "Couldn't add the member — please check your internet connection and try again."
      );
      return;
    }

    // The row is in — now send the login invite. If it fails, the member is
    // still recorded; the committee just needs to retry the invite later.
    let inviteMessage = "";
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const res = await fetch("/api/invite-member", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token ?? ""}`,
        },
        body: JSON.stringify({ email: payload.email }),
      });
      inviteMessage = res.ok
        ? " An email invite to set up their member login is on its way."
        : " Their login invite couldn't be sent just now — use the \"Send login invite\" button next to their name to try again later.";
    } catch {
      inviteMessage =
        " Their login invite couldn't be sent just now — use the \"Send login invite\" button next to their name to try again later.";
    }

    setSaving(false);
    setNotice(`${payload.name} has been added as a paid member.${inviteMessage}`);
    setForm(emptyForm);
    loadMembers();
  }

  // Email a member their login invite — for when the invite failed at add
  // time, or for members recorded before invites existed.
  async function sendInvite(m) {
    setNotice(null);
    setFormError(null);
    setInvitingId(m.id);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const res = await fetch("/api/invite-member", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token ?? ""}`,
        },
        body: JSON.stringify({ email: m.email }),
      });
      if (res.ok) {
        setNotice(`A login invite is on its way to ${m.email}.`);
        loadMembers();
      } else {
        setFormError(
          `Couldn't send the login invite to ${m.email} just now — please try again in a few minutes.`
        );
      }
    } catch {
      setFormError(
        `Couldn't send the login invite to ${m.email} — please check your internet connection and try again.`
      );
    }
    setInvitingId(null);
  }

  // Flip a member between active and expired.
  async function toggleStatus(m) {
    setNotice(null);
    setFormError(null);
    setTogglingId(m.id);
    const next = m.status === "active" ? "expired" : "active";
    const { error } = await supabase
      .from("members")
      .update({ status: next })
      .eq("id", m.id);
    setTogglingId(null);
    if (error) {
      setFormError(
        "Couldn't change that member's status — please check your internet connection and try again."
      );
    } else {
      setNotice(
        next === "active"
          ? `${m.name} is marked as an active member again.`
          : `${m.name} is now marked as expired.`
      );
      loadMembers();
    }
  }

  if (loading) {
    return <p className="text-lg text-ink-muted">Loading the members…</p>;
  }

  return (
    <div className="mx-auto max-w-3xl">
      <h2 className="font-display text-2xl font-semibold tracking-wide text-navy">
        Members
      </h2>
      <RibbonRule className="mt-3" />
      <p className="mt-3 text-ink-muted">
        The club&apos;s register of paid members. Members who paid online
        appear here automatically; use the form below to record someone who
        paid in person or by bank transfer.
      </p>

      {notice && (
        <p className="mt-6 border-l-4 border-gold bg-gold/10 p-4 text-lg font-semibold text-navy">
          ✓ {notice}
        </p>
      )}
      {formError && (
        <p className="mt-6 border-l-4 border-crimson bg-crimson/5 p-4 text-base text-ink">
          {formError}
        </p>
      )}

      {loadError ? (
        <p className="mt-10 text-lg text-ink-muted">{loadError}</p>
      ) : members.length === 0 ? (
        <div className="mt-10 border border-dashed border-ink/25 bg-paper p-10 text-center">
          <p className="text-lg font-semibold text-navy">No members yet</p>
          <p className="mt-1 text-ink-muted">
            Use the form below to add the first one.
          </p>
        </div>
      ) : (
        <ul className="mt-8 divide-y divide-ink/10 border-t border-ink/10">
          {members.map((m) => {
            const expired = m.status !== "active";
            return (
              <li
                key={m.id}
                className={`flex flex-wrap items-center justify-between gap-4 py-5 ${
                  expired ? "bg-crimson/5 px-4 -mx-4" : ""
                }`}
              >
                <div>
                  <p className="text-lg font-bold text-navy">
                    {m.name}{" "}
                    {expired && (
                      <span className="ml-1 align-middle border border-crimson px-2 py-0.5 text-xs font-bold uppercase tracking-[0.08em] text-crimson">
                        Expired
                      </span>
                    )}
                  </p>
                  <p className="mt-0.5 text-ink-muted">
                    {m.email}
                    {m.phone ? ` · ${m.phone}` : ""}
                  </p>
                  <p className="mt-0.5 text-sm text-ink-muted">
                    Joined {formatDate(m.joined_at)} · Membership{" "}
                    {expired ? "ended" : "runs to"} {formatDate(m.expires_at)}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => startEdit(m)}
                    className="min-h-[48px] border-2 border-navy px-6 font-body text-base font-bold uppercase tracking-[0.08em] text-navy transition-colors hover:bg-navy hover:text-white"
                  >
                    Edit
                  </button>
                  {!m.auth_user_id && (
                    <button
                      onClick={() => sendInvite(m)}
                      disabled={invitingId === m.id}
                      className="min-h-[48px] border-2 border-navy px-6 font-body text-base font-bold uppercase tracking-[0.08em] text-navy transition-colors hover:bg-navy/5 disabled:opacity-60"
                    >
                      {invitingId === m.id ? "Sending…" : "Send login invite"}
                    </button>
                  )}
                  <button
                    onClick={() => toggleStatus(m)}
                    disabled={togglingId === m.id}
                    className={`min-h-[48px] px-6 font-body text-base font-bold uppercase tracking-[0.08em] transition-colors disabled:opacity-60 ${
                      expired
                        ? "border-2 border-navy text-navy hover:bg-navy/5"
                        : "border-2 border-crimson text-crimson hover:bg-crimson hover:text-white"
                    }`}
                  >
                    {togglingId === m.id
                      ? "Saving…"
                      : expired
                        ? "Mark active"
                        : "Mark expired"}
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <form
        ref={formRef}
        onSubmit={handleSubmit}
        className="mt-12 grid gap-7 border-t-4 border-gold bg-paper p-8 shadow-soft md:p-10"
      >
        <div>
          <h3 className="font-display text-xl font-semibold tracking-wide text-navy">
            {editingId ? "Edit this member" : "Add a paid member"}
          </h3>
          {!editingId && (
            <p className="mt-1 text-sm text-ink-muted">
              For members who&apos;ve paid their $50 in person or by bank
              transfer. They&apos;ll be recorded as active for one year and
              emailed an invite to set up their member login.
            </p>
          )}
        </div>
        <AdminField
          label="Full name"
          id="member_name"
          required
          value={form.name}
          onChange={set("name")}
        />
        <div className="grid gap-7 sm:grid-cols-2">
          <AdminField
            label="Email"
            id="member_email"
            type="email"
            required
            value={form.email}
            onChange={set("email")}
          />
          <AdminField
            label="Phone"
            id="member_phone"
            type="tel"
            value={form.phone}
            onChange={set("phone")}
          />
        </div>
        <div className="grid gap-7 sm:grid-cols-2">
          <AdminField
            label="Service branch"
            id="member_branch"
            as="select"
            options={BRANCH_OPTIONS}
            value={form.service_branch}
            onChange={set("service_branch")}
          />
          <AdminField
            label="Do they have a GA handicap?"
            id="member_ga"
            as="select"
            options={GA_OPTIONS}
            value={form.ga_handicap}
            onChange={set("ga_handicap")}
          />
        </div>
        <AdminField
          label="Golf Links number"
          id="member_golf_links"
          hint="Leave blank if they don't have one."
          value={form.golf_links_number}
          onChange={set("golf_links_number")}
        />
        <div className="flex flex-col gap-4 border-t border-ink/10 pt-7 sm:flex-row sm:items-center">
          <button
            type="submit"
            disabled={saving}
            className="min-h-[56px] bg-gold px-10 font-body text-base font-bold uppercase tracking-[0.08em] text-navy-deep transition-colors hover:bg-gold-bright disabled:opacity-60"
          >
            {saving
              ? "Saving…"
              : editingId
                ? "Save changes"
                : "Add member & send invite"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={cancelEdit}
              className="min-h-[56px] border-2 border-navy px-10 font-body text-base font-bold uppercase tracking-[0.08em] text-navy transition-colors hover:bg-navy/5"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
