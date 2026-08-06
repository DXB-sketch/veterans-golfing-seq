import { useEffect, useRef, useState } from "react";
import { supabase } from "../../lib/supabase.js";
import { TIERS, tierByKey } from "../../lib/tiers.js";
import { logoUrl } from "../../lib/sponsors.js";
import RibbonRule from "../../components/RibbonRule.jsx";
import AdminField from "./AdminField.jsx";

const TIER_OPTIONS = [
  { value: "", label: "No tier" },
  ...TIERS.map((t) => ({ value: t.key, label: `${t.label} (${t.priceLabel})` })),
];

const emptyForm = {
  company_name: "",
  website_url: "",
  description: "",
  tier: "",
  amount_dollars: "",
  display_order: "",
  contact_name: "",
  contact_email: "",
};

// Thumbnail with a graceful fallback: if the logo file is missing or 404s,
// show the "No logo" block instead of a broken image (as the public page does).
function SponsorThumb({ sponsor }) {
  const [failed, setFailed] = useState(false);
  const logo = logoUrl(sponsor.logo_path);

  if (!logo || failed) {
    return (
      <div className="flex h-14 w-14 items-center justify-center border border-dashed border-ink/25 text-xs text-ink-muted">
        No logo
      </div>
    );
  }
  return (
    <img
      src={logo}
      alt=""
      onError={() => setFailed(true)}
      className="h-14 w-14 border border-ink/10 bg-white object-contain p-1"
    />
  );
}

function TierBadge({ tier }) {
  const t = tierByKey(tier);
  if (!t) return null;
  return (
    <span
      className={`inline-block px-2 py-0.5 text-xs font-bold uppercase tracking-[0.08em] ${t.badgeClass}`}
    >
      {t.label}
    </span>
  );
}

export default function AdminSponsors() {
  const [sponsors, setSponsors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [editingLogoPath, setEditingLogoPath] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState(null);
  const [formError, setFormError] = useState(null);
  const [togglingId, setTogglingId] = useState(null);
  const formRef = useRef(null);
  const fileInputRef = useRef(null);

  async function loadSponsors() {
    const { data, error } = await supabase
      .from("sponsors")
      .select("*")
      .order("is_active", { ascending: true })
      .order("display_order", { ascending: true })
      .order("company_name", { ascending: true });
    if (error) {
      setLoadError(
        "Couldn't load the sponsors list. If the site was just updated, sponsor management may not be switched on yet. Otherwise check your internet connection and refresh the page."
      );
    } else {
      setLoadError(null);
      // Pending (not yet approved) sponsors first so they're impossible to miss.
      setSponsors([...(data ?? [])].sort((a, b) => Number(a.is_active) - Number(b.is_active)));
    }
    setLoading(false);
  }

  useEffect(() => {
    loadSponsors();
  }, []);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  function startEdit(s) {
    setEditingId(s.id);
    setEditingLogoPath(s.logo_path ?? null);
    setLogoFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setForm({
      company_name: s.company_name ?? "",
      website_url: s.website_url ?? "",
      description: s.description ?? "",
      tier: s.tier ?? "",
      amount_dollars:
        s.amount_cents === null || s.amount_cents === undefined
          ? ""
          : String(s.amount_cents / 100),
      display_order:
        s.display_order === null || s.display_order === undefined
          ? ""
          : String(s.display_order),
      contact_name: s.contact_name ?? "",
      contact_email: s.contact_email ?? "",
    });
    setNotice(null);
    setFormError(null);
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function cancelEdit() {
    setEditingId(null);
    setEditingLogoPath(null);
    setForm(emptyForm);
    setLogoFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setFormError(null);
  }

  // Upload the chosen logo to the sponsor-logos bucket and return its path.
  async function uploadLogo(file) {
    const ext = (file.name.split(".").pop() || "png").toLowerCase();
    const safeName = form.company_name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "sponsor";
    const path = `${safeName}-${Date.now()}.${ext}`;
    const { data, error } = await supabase.storage
      .from("sponsor-logos")
      .upload(path, file, { upsert: false });
    if (error) throw error;
    return data.path;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setNotice(null);
    setFormError(null);
    setSaving(true);

    // Tidy and check the website address before doing anything else. A bare
    // "example.com" gets https:// added; anything that isn't http(s) is
    // rejected so a broken link never reaches the public page.
    let websiteUrl = form.website_url.trim() || null;
    if (websiteUrl) {
      if (!/^[a-z][a-z0-9+.-]*:/i.test(websiteUrl)) {
        websiteUrl = `https://${websiteUrl}`;
      }
      let parsed = null;
      try {
        parsed = new URL(websiteUrl);
      } catch {
        parsed = null;
      }
      if (!parsed || (parsed.protocol !== "http:" && parsed.protocol !== "https:")) {
        setSaving(false);
        setFormError(
          "That website address doesn't look right. It needs to start with https:// (e.g. https://urbanfairways.com.au). Please fix it and save again."
        );
        return;
      }
    }

    let logoPath = editingLogoPath;
    if (logoFile) {
      try {
        logoPath = await uploadLogo(logoFile);
      } catch {
        setSaving(false);
        setFormError(
          "Couldn't upload the logo. Please check it's an image file and try again. The rest of the form hasn't been saved yet."
        );
        return;
      }
    }

    const amount = form.amount_dollars === "" ? null : Number(form.amount_dollars);
    const payload = {
      company_name: form.company_name.trim(),
      website_url: websiteUrl,
      description: form.description.trim() || null,
      tier: form.tier || null,
      amount_cents:
        amount === null || Number.isNaN(amount) ? null : Math.round(amount * 100),
      display_order:
        form.display_order === "" ? null : Number(form.display_order),
      contact_name: form.contact_name.trim() || null,
      contact_email: form.contact_email.trim() || null,
      logo_path: logoPath,
    };

    const query = editingId
      ? supabase.from("sponsors").update(payload).eq("id", editingId)
      : supabase.from("sponsors").insert(payload);
    const { error } = await query;
    setSaving(false);
    if (error) {
      setFormError(
        "Couldn't save the sponsor. Please check your internet connection and try again."
      );
      return;
    }
    setNotice(
      editingId
        ? `${payload.company_name} has been saved.`
        : `${payload.company_name} has been added. Switch them to "shown" when you're ready for them to appear on the website.`
    );
    cancelEdit();
    loadSponsors();
  }

  // Show or hide a sponsor on the public website.
  async function toggleActive(s) {
    setNotice(null);
    setFormError(null);
    setTogglingId(s.id);
    const { error } = await supabase
      .from("sponsors")
      .update({ is_active: !s.is_active })
      .eq("id", s.id);
    setTogglingId(null);
    if (error) {
      setFormError(
        "Couldn't change that sponsor. Please check your internet connection and try again."
      );
    } else {
      setNotice(
        s.is_active
          ? `${s.company_name} is now hidden from the website.`
          : `${s.company_name} is now shown on the website.`
      );
      loadSponsors();
    }
  }

  if (loading) {
    return <p className="text-lg text-ink-muted">Loading the sponsors…</p>;
  }

  return (
    <div className="mx-auto max-w-3xl">
      <h2 className="font-display text-2xl font-semibold tracking-wide text-navy">
        Sponsors
      </h2>
      <RibbonRule className="mt-3" />
      <p className="mt-3 text-ink-muted">
        Sponsors marked as shown appear on the public sponsors page. When a
        business pays for sponsorship online, they arrive here as{" "}
        <span className="font-semibold">pending approval</span>. Check their
        details, add a logo, then switch them to shown.
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
      ) : sponsors.length === 0 ? (
        <div className="mt-10 border border-dashed border-ink/25 bg-paper p-10 text-center">
          <p className="text-lg font-semibold text-navy">No sponsors yet</p>
          <p className="mt-1 text-ink-muted">
            Use the form below to add the first one.
          </p>
        </div>
      ) : (
        <ul className="mt-8 divide-y divide-ink/10 border-t border-ink/10">
          {sponsors.map((s) => {
            const pending = !s.is_active;
            return (
              <li
                key={s.id}
                className={`flex flex-wrap items-center justify-between gap-4 py-5 ${
                  pending ? "bg-gold/10 px-4 -mx-4" : ""
                }`}
              >
                <div className="flex items-center gap-4">
                  <SponsorThumb key={s.logo_path ?? "none"} sponsor={s} />
                  <div>
                    <p className="text-lg font-bold text-navy">
                      {s.company_name}{" "}
                      {pending && (
                        <span className="ml-1 align-middle border border-navy px-2 py-0.5 text-xs font-bold uppercase tracking-[0.08em] text-navy">
                          Pending approval, not on the website
                        </span>
                      )}
                    </p>
                    <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-ink-muted">
                      <TierBadge tier={s.tier} />
                      {s.amount_cents ? (
                        <span>${(s.amount_cents / 100).toLocaleString("en-AU")}</span>
                      ) : null}
                      {s.contact_email && <span>{s.contact_email}</span>}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => startEdit(s)}
                    className="min-h-[48px] border-2 border-navy px-6 font-body text-base font-bold uppercase tracking-[0.08em] text-navy transition-colors hover:bg-navy hover:text-white"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => toggleActive(s)}
                    disabled={togglingId === s.id}
                    className={`min-h-[48px] px-6 font-body text-base font-bold uppercase tracking-[0.08em] transition-colors disabled:opacity-60 ${
                      pending
                        ? "bg-gold text-navy-deep hover:bg-gold-bright"
                        : "border-2 border-crimson text-crimson hover:bg-crimson hover:text-white"
                    }`}
                  >
                    {togglingId === s.id
                      ? "Saving…"
                      : pending
                        ? "Show on website"
                        : "Hide from website"}
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
        <h3 className="font-display text-xl font-semibold tracking-wide text-navy">
          {editingId ? "Edit this sponsor" : "Add a sponsor"}
        </h3>
        <AdminField
          label="Company name"
          id="sponsor_company"
          required
          value={form.company_name}
          onChange={set("company_name")}
        />
        <AdminField
          label="Website"
          id="sponsor_website"
          type="url"
          hint="Their full address, e.g. https://urbanfairways.com.au"
          value={form.website_url}
          onChange={set("website_url")}
        />
        <AdminField
          label="About the sponsor"
          id="sponsor_description"
          as="textarea"
          hint="A sentence or two shown on the sponsors page."
          value={form.description}
          onChange={set("description")}
        />
        <div className="grid gap-7 sm:grid-cols-3">
          <AdminField
            label="Tier"
            id="sponsor_tier"
            as="select"
            options={TIER_OPTIONS}
            value={form.tier}
            onChange={set("tier")}
          />
          <AdminField
            label="Amount ($)"
            id="sponsor_amount"
            type="number"
            min="0"
            step="0.01"
            hint="What they paid or pledged."
            value={form.amount_dollars}
            onChange={set("amount_dollars")}
          />
          <AdminField
            label="Display order"
            id="sponsor_order"
            type="number"
            min="0"
            hint="Lower numbers show first within a tier."
            value={form.display_order}
            onChange={set("display_order")}
          />
        </div>
        <div className="grid gap-7 sm:grid-cols-2">
          <AdminField
            label="Contact name"
            id="sponsor_contact_name"
            hint="Never shown on the website."
            value={form.contact_name}
            onChange={set("contact_name")}
          />
          <AdminField
            label="Contact email"
            id="sponsor_contact_email"
            type="email"
            hint="Never shown on the website."
            value={form.contact_email}
            onChange={set("contact_email")}
          />
        </div>
        <div>
          <label
            htmlFor="sponsor_logo"
            className="block font-body text-base font-bold text-navy"
          >
            Logo
          </label>
          <p className="mt-0.5 text-sm text-ink-muted">
            A PNG or JPG of their logo.{" "}
            {editingLogoPath
              ? "Choosing a new file replaces the current logo when you save."
              : "You can add it later if you don't have it yet."}
          </p>
          <input
            ref={fileInputRef}
            id="sponsor_logo"
            type="file"
            accept="image/*"
            onChange={(e) => setLogoFile(e.target.files?.[0] ?? null)}
            className="mt-2 w-full text-base text-ink file:mr-4 file:min-h-[48px] file:cursor-pointer file:border-2 file:border-navy file:bg-paper file:px-6 file:font-body file:text-base file:font-bold file:uppercase file:tracking-[0.08em] file:text-navy"
          />
        </div>
        <div className="flex flex-col gap-4 border-t border-ink/10 pt-7 sm:flex-row sm:items-center">
          <button
            type="submit"
            disabled={saving}
            className="min-h-[56px] bg-gold px-10 font-body text-base font-bold uppercase tracking-[0.08em] text-navy-deep transition-colors hover:bg-gold-bright disabled:opacity-60"
          >
            {saving ? "Saving…" : editingId ? "Save changes" : "Add sponsor"}
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
