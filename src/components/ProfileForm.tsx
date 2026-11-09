import { useState } from "react";
import { ImagePlus, User, X } from "@/components/PixelIcons";
import { toast } from "sonner";
import { fileToAvatar, filesToMedia } from "@/lib/media";
import { DISCIPLINES, NEIGHBOURHOODS } from "@/lib/data";
import type { MyProfile } from "@/lib/store";
import { MediaItem } from "./Portfolio";

/** Shared by onboarding ("Build your collective") and Edit profile. */
export function ProfileForm({
  initial,
  onSave,
  submitLabel,
  showDiscipline = true,
  children,
}: {
  initial: MyProfile;
  onSave: (p: MyProfile) => void;
  submitLabel: string;
  showDiscipline?: boolean;
  children?: React.ReactNode;
}) {
  const [p, setP] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [picBusy, setPicBusy] = useState(false);
  const up = (patch: Partial<MyProfile>) => setP((v) => ({ ...v, ...patch }));

  const pickAvatar = async (f: File) => {
    setPicBusy(true);
    up({ avatar: await fileToAvatar(f) });
    setPicBusy(false);
  };

  const add = async (files: FileList | null) => {
    if (!files?.length) return;
    setBusy(true);
    const { media, skipped } = await filesToMedia(files);
    setBusy(false);
    up({ media: [...p.media, ...media] });
    if (skipped) toast(`${skipped} file${skipped > 1 ? "s" : ""} skipped — videos up to 3 MB for now.`);
  };

  return (
    <form
      className="flex flex-col gap-5"
      onSubmit={(e) => {
        e.preventDefault();
        onSave(p);
      }}
    >
      <fieldset>
        <legend className="label">Profile photo</legend>
        <div className="mt-2 flex items-center gap-4">
          <span className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-full border border-dashed border-foreground bg-background">
            {p.avatar ? (
              <img src={p.avatar} alt="Your profile photo" className="size-full object-cover" />
            ) : (
              <User className="size-7 text-muted-foreground" aria-hidden="true" />
            )}
          </span>
          <div className="flex flex-col items-start gap-1">
            <label className="btn btn-secondary cursor-pointer focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-foreground">
              {picBusy ? "Adding…" : p.avatar ? "Change" : "Add"}
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                disabled={picBusy}
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  e.target.value = "";
                  if (f) void pickAvatar(f);
                }}
              />
            </label>
            {p.avatar && (
              <button
                type="button"
                className="link-u min-h-11 text-xs text-muted-foreground"
                onClick={() => up({ avatar: "" })}
              >
                Remove
              </button>
            )}
          </div>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">The face you show on the map and in chats.</p>
      </fieldset>

      <fieldset>
        <legend className="label">Images &amp; videos</legend>
        <div className="mt-2 grid grid-cols-3 gap-px bg-muted">
          {p.media.map((m, i) => (
            <div key={i} className="relative aspect-square bg-muted">
              <MediaItem m={m} alt={`Your work ${i + 1}`} className="size-full" />
              <button
                type="button"
                aria-label={`Remove item ${i + 1}`}
                onClick={() => up({ media: p.media.filter((_, k) => k !== i) })}
                className="absolute right-0 top-0 flex size-11 items-center justify-center"
              >
                <span className="flex size-6 items-center justify-center rounded-full border border-foreground bg-background">
                  <X className="size-3.5" />
                </span>
              </button>
            </div>
          ))}
          <label className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 border border-dashed border-foreground bg-background text-[11px] uppercase tracking-widest focus-within:outline-2 focus-within:outline-foreground">
            <ImagePlus className="size-5" />
            {busy ? "Adding…" : "Add"}
            <input
              type="file"
              accept="image/*,video/*"
              multiple
              className="sr-only"
              onChange={(e) => {
                void add(e.target.files);
                e.target.value = "";
              }}
            />
          </label>
        </div>
      </fieldset>

      {showDiscipline && (
        <div>
          <label htmlFor="pf-disc" className="label">Discipline</label>
          <select id="pf-disc" className="field mt-2" value={p.discipline} onChange={(e) => up({ discipline: e.target.value })}>
            <option value="">Pick one</option>
            {DISCIPLINES.map((d) => <option key={d}>{d}</option>)}
          </select>
        </div>
      )}

      <fieldset className="flex flex-col gap-2">
        <legend className="label">Socials</legend>
        <label className="sr-only" htmlFor="pf-ig">Instagram handle</label>
        <input id="pf-ig" className="field" placeholder="Instagram @handle" value={p.instagram} onChange={(e) => up({ instagram: e.target.value.replace(/^@/, "") })} />
        <label className="sr-only" htmlFor="pf-tt">TikTok handle</label>
        <input id="pf-tt" className="field" placeholder="TikTok @handle" value={p.tiktok} onChange={(e) => up({ tiktok: e.target.value.replace(/^@/, "") })} />
        <label className="sr-only" htmlFor="pf-web">Website</label>
        <input id="pf-web" type="url" className="field" placeholder="Website (https://…)" value={p.website} onChange={(e) => up({ website: e.target.value })} />
      </fieldset>

      <div>
        <label htmlFor="pf-about" className="label">About</label>
        <textarea
          id="pf-about"
          className="field mt-2 min-h-24 py-3"
          maxLength={240}
          placeholder="A line or two about you and your work."
          value={p.about}
          onChange={(e) => up({ about: e.target.value })}
        />
        <p className="mt-1 text-right text-xs text-muted-foreground">{p.about.length}/240</p>
      </div>

      <div>
        <label htmlFor="pf-hood" className="label">Neighbourhood</label>
        <input id="pf-hood" list="hoods" className="field mt-2" placeholder="e.g. Dalston, Peckham" value={p.neighbourhood} onChange={(e) => up({ neighbourhood: e.target.value })} />
        <datalist id="hoods">{NEIGHBOURHOODS.map((n) => <option key={n} value={n} />)}</datalist>
        <p className="mt-1 text-xs text-muted-foreground">Neighbourhood only — never your exact address.</p>
      </div>

      <button className="btn btn-primary w-full" disabled={busy}>{submitLabel}</button>
      {children}
    </form>
  );
}
