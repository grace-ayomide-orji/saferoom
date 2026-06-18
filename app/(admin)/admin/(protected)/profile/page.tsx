"use client";
import { useEffect, useState } from "react";
import { PasswordSettingModal } from "./PasswordSetting"

interface Profile {
  name: string;
  bio: string;
  photoUrl: string;
  qualifications: string[];
  email: string;
  phone: string;
  website: string;
  instagram: string;
  twitter: string;
}

const EMPTY: Profile = {
  name: "",
  bio: "",
  photoUrl: "",
  qualifications: [],
  email: "",
  phone: "",
  website: "",
  instagram: "",
  twitter: "",
};

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [newQual, setNewQual] = useState("");
  
  const [openModal, setOpenModal] = useState(false);

  useEffect(() => {
    fetch("/api/admin/profile")
      .then((r) => r.json())
      .then((d) => {
        if (d.profile) setProfile({ ...EMPTY, ...d.profile });
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleSave() {
    setSaving(true);
    setError("");
    setSuccess(false);

    const payload = Object.fromEntries(
      Object.entries(profile).map(([k, v]) => [k, v === null ? "" : v])
    );

    const res = await fetch("/api/admin/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Failed to save.");
    } else {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }
    setSaving(false);
  }

  function addQual() {
    if (!newQual.trim()) return;
    setProfile((p) => ({ ...p, qualifications: [...p.qualifications, newQual.trim()] }));
    setNewQual("");
  }

  function removeQual(index: number) {
    setProfile((p) => ({
      ...p,
      qualifications: p.qualifications.filter((_, i) => i !== index),
    }));
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-brand-cherry border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-gray-500 text-sm mt-0.5">
          This information appears on the public About page.
        </p>
        <div className="flex gap-x-2">
          <button
            onClick={() => setOpenModal(!openModal)}
            className="btn-secondary text-sm py-2 px-5"
          >Password Setting</button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary text-sm py-2 px-5"
          >
            {saving ? (
              <span className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving…
              </span>
            ) : success ? (
              "✓ Saved!"
            ) : (
              "Save Changes"
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {/* Basic Info */}
      <div className="card space-y-5">
        <h2 className="font-extrabold text-gray-900 text-base">Basic Information</h2>

        <div>
          <label className="label">Display Name</label>
          <input
            className="input-field"
            value={profile.name}
            onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
            placeholder="Efe"
          />
        </div>

        <div>
          <label className="label">Profile Photo URL</label>
          <input
            className="input-field"
            value={profile.photoUrl ?? undefined}
            onChange={(e) => setProfile((p) => ({ ...p, photoUrl: e.target.value }))}
            placeholder="https://example.com/photo.jpg"
          />
          <p className="text-xs text-gray-400 mt-1">
            Paste a direct image URL. Upload to Cloudinary or any image host.
          </p>
          {profile.photoUrl && (
            <img
              src={profile.photoUrl}
              alt="Preview"
              className="mt-3 w-20 h-20 rounded-xl object-cover border border-gray-200"
              onError={(e) => (e.currentTarget.style.display = "none")}
            />
          )}
        </div>

        <div>
          <label className="label">Bio</label>
          <textarea
            className="input-field min-h-[140px] resize-none"
            value={profile.bio}
            onChange={(e) => setProfile((p) => ({ ...p, bio: e.target.value }))}
            placeholder="Write a short bio that will appear on the About page…"
          />
        </div>
      </div>

      {/* Qualifications */}
      <div className="card space-y-4">
        <h2 className="font-extrabold text-gray-900 text-base">Qualifications</h2>
        <p className="text-sm text-gray-500">
          These appear as tags under your name on the About page.
        </p>

        {profile.qualifications.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {profile.qualifications.map((q, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1.5 bg-brand-cherry/10 text-brand-cherry text-xs font-bold px-3 py-1.5 rounded-full"
              >
                {q}
                <button
                  onClick={() => removeQual(i)}
                  className="text-brand-cherry/60 hover:text-brand-cherry text-base leading-none"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}

        <div className="flex gap-2">
          <input
            className="input-field flex-1"
            placeholder="e.g. Certified Pastoral Counselor"
            value={newQual ?? undefined}
            onChange={(e) => setNewQual(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addQual())}
          />
          <button
            onClick={addQual}
            className="btn-secondary py-2 px-4 text-sm flex-shrink-0"
          >
            Add
          </button>
        </div>
      </div>

      {/* Contact Info */}
      <div className="card space-y-4">
        <h2 className="font-extrabold text-gray-900 text-base">Contact Information</h2>

        {[
          { key: "email", label: "Email Address", placeholder: "oloruntobiga@gmail.com", type: "email" },
          { key: "phone", label: "Phone Number", placeholder: "+234 800 000 0000", type: "tel" },
          { key: "website", label: "Website", placeholder: "https://graceayomide.vercel.app", type: "url" },
        ].map((field) => (
          <div key={field.key}>
            <label className="label">{field.label}</label>
            <input
              type={field.type}
              className="input-field"
              value={profile[field.key as keyof Profile] as string ?? undefined}
              onChange={(e) =>
                setProfile((p) => ({ ...p, [field.key]: e.target.value }))
              }
              placeholder={field.placeholder}
            />
          </div>
        ))}
      </div>

      {/* Social */}
      <div className="card space-y-4">
        <h2 className="font-extrabold text-gray-900 text-base">Social Media</h2>

        <div>
          <label className="label">Instagram Handle</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">@</span>
            <input
              className="input-field pl-8"
              value={profile.instagram ?? undefined}
              onChange={(e) => setProfile((p) => ({ ...p, instagram: e.target.value }))}
              placeholder="saferoom"
            />
          </div>
        </div>

        <div>
          <label className="label">Twitter/X Handle</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">@</span>
            <input
              className="input-field pl-8"
              value={profile.twitter ?? undefined}
              onChange={(e) => setProfile((p) => ({ ...p, twitter: e.target.value }))}
              placeholder="saferoom"
            />
          </div>
        </div>
      </div>

      {/* Save */}
      <div className="flex justify-end pb-8">
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary px-8 py-2"
        >
          {saving ? "Saving…" : success ? "✓ Saved!" : "Save All Changes"}
        </button>
      </div>

      {openModal && <PasswordSettingModal onClose={() => setOpenModal(false)} />}
    </div>
  );
}