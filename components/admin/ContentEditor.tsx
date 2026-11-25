"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { deleteContent, saveContent, uploadImage, type ContentKind } from "@/app/admin/actions";
import { checkWordingDeep } from "@/lib/wordingGuard";

/**
 * Structured JSON editor for a content document (validated server-side with Zod).
 * Localized fields are { en, te?, hi? }; reviewStatus.{te,hi} controls whether a
 * translation is shown and indexed. Dedicated per-field forms can replace this later.
 */
export function ContentEditor({
  kind,
  id: initialId,
  isNew,
  initial,
  isOwner,
  previewPath,
}: {
  kind: ContentKind;
  id: string;
  isNew: boolean;
  initial: string;
  isOwner: boolean;
  previewPath: string;
}) {
  const router = useRouter();
  const [text, setText] = useState(initial);
  const [id, setId] = useState(initialId);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ tone: "ok" | "error" | "warn"; text: string; issues?: string[] } | null>(null);
  const [wordingHits, setWordingHits] = useState<string[] | null>(null);
  const [upload, setUpload] = useState<{ url: string } | null>(null);

  const parsed = useMemo(() => {
    try {
      return { ok: true as const, value: JSON.parse(text) as Record<string, unknown> };
    } catch (e) {
      return { ok: false as const, error: (e as Error).message };
    }
  }, [text]);

  const seo = kind === "treatment" && parsed.ok ? (parsed.value.seo as { title?: Record<string, string>; description?: Record<string, string> } | undefined) : undefined;
  const liveHits = parsed.ok ? checkWordingDeep(parsed.value) : [];
  const docId = kind === "clinic" ? "clinic" : kind === "treatment" && parsed.ok ? String(parsed.value.slug ?? id) : id;

  async function save(override = false) {
    if (!parsed.ok) return setMsg({ tone: "error", text: `The JSON is not valid: ${parsed.error}` });
    if (!docId) return setMsg({ tone: "error", text: "Please enter an ID (lowercase letters, numbers and hyphens)." });
    if (kind === "gallery" && parsed.value.genuine !== true) {
      return setMsg({ tone: "error", text: 'Gallery photos must be genuine clinic photos. Set "genuine": true to confirm this is the clinic\'s own photo (never stock).' });
    }
    setBusy(true);
    setMsg(null);
    const res = await saveContent(kind, docId, { ...parsed.value, ...(kind !== "clinic" && kind !== "treatment" ? { id: docId } : {}) }, override);
    setBusy(false);
    if (res.ok) {
      setWordingHits(null);
      setMsg({ tone: "ok", text: "Saved. The public page will update within seconds." });
      if (isNew) router.replace(`/admin/content/${kind}/${docId}`);
      else router.refresh();
    } else if (res.error === "wording") {
      setWordingHits(res.hits);
      setMsg({
        tone: "warn",
        text: `This text contains wording that breaks the medical-wording rules (${res.hits.join(", ")}).${res.canOverride ? " As the owner you can save anyway." : " Please rephrase it."}`,
      });
    } else {
      setMsg({
        tone: "error",
        text: res.error === "invalid" ? "Some fields are not valid." : res.error === "forbidden" ? "You don't have permission to do this." : "Could not save. Please try again.",
        issues: "issues" in res ? res.issues : undefined,
      });
    }
  }

  async function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.set("file", file);
    fd.set("folder", kind === "gallery" ? "gallery" : kind === "treatment" ? "treatments" : kind === "doctor" ? "doctors" : "brand");
    setBusy(true);
    const res = await uploadImage(fd);
    setBusy(false);
    if (res.ok) setUpload(res.data);
    else setMsg({ tone: "error", text: "Upload failed. Use a JPEG, PNG or WebP image up to 8 MB.", issues: "issues" in res ? res.issues : undefined });
    e.target.value = "";
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-[2.25rem] leading-tight font-semibold">
          {isNew ? "New" : "Edit"} {kind}
        </h1>
        <div className="flex gap-2">
          <Link href="/admin/content" className="btn-secondary">
            Back
          </Link>
          {!isNew && (
            <a href={previewPath} target="_blank" rel="noopener noreferrer" className="btn-secondary">
              Preview page
            </a>
          )}
        </div>
      </div>

      {isNew && kind !== "treatment" && (
        <div>
          <label htmlFor="docid" className="label">
            ID
          </label>
          <input id="docid" className="input max-w-sm" value={id} onChange={(e) => setId(e.target.value.toLowerCase())} pattern="[a-z0-9-]+" aria-describedby="docid-hint" />
          <p id="docid-hint" className="hint">
            Lowercase letters, numbers and hyphens, e.g. waiting-area-2.
          </p>
        </div>
      )}

      {msg && (
        <div
          role={msg.tone === "ok" ? "status" : "alert"}
          className={`rounded-[var(--radius-soft)] p-4 text-sm ${msg.tone === "ok" ? "bg-brand-50 text-brand-800" : msg.tone === "warn" ? "bg-amber-50 text-amber-800" : "bg-red-50 text-red-700"}`}
        >
          <p>{msg.text}</p>
          {msg.issues && (
            <ul className="mt-2 list-disc pl-5">
              {msg.issues.map((i) => (
                <li key={i}>{i}</li>
              ))}
            </ul>
          )}
          {wordingHits && isOwner && (
            <button type="button" className="btn-secondary mt-3" onClick={() => save(true)} disabled={busy}>
              Save anyway (owner override)
            </button>
          )}
        </div>
      )}

      {liveHits.length > 0 && !msg && (
        <p className="rounded-[var(--radius-soft)] bg-amber-50 p-3 text-sm text-amber-800">Wording check: {liveHits.join(", ")} found. Medical text must not promise results or mention prices.</p>
      )}

      {seo && (
        <div className="grid gap-2 rounded-[var(--radius-soft)] bg-white p-4 text-sm sm:grid-cols-2">
          {(["en", "te", "hi"] as const).map((l) => (
            <p key={l}>
              SEO title ({l}): <strong className={(seo.title?.[l]?.length ?? 0) > 60 ? "text-red-700" : ""}>{seo.title?.[l]?.length ?? 0}</strong>/60 · description:{" "}
              <strong className={(seo.description?.[l]?.length ?? 0) > 160 ? "text-red-700" : ""}>{seo.description?.[l]?.length ?? 0}</strong>/160
            </p>
          ))}
        </div>
      )}

      {(kind === "gallery" || kind === "treatment" || kind === "doctor") && (
        <div className="rounded-[var(--radius-frame)] border border-sage-200 bg-white p-4">
          <label htmlFor="upload" className="label">
            Upload an image (JPEG, PNG or WebP, up to 8 MB)
          </label>
          <input id="upload" type="file" accept="image/jpeg,image/png,image/webp" onChange={onUpload} disabled={busy} />
          {upload && (
            <p className="mt-2 text-sm break-all">
              Uploaded. Put this URL in the image <code>path</code> and write the <code>alt</code> text (required): <code>{upload.url}</code>
            </p>
          )}
        </div>
      )}

      <div>
        <label htmlFor="json" className="label">
          Content (JSON)
        </label>
        <textarea
          id="json"
          className="input min-h-[60vh] font-mono text-xs"
          spellCheck={false}
          value={text}
          onChange={(e) => setText(e.target.value)}
          aria-invalid={!parsed.ok}
          aria-describedby="json-status"
        />
        <p id="json-status" className={parsed.ok ? "hint" : "error-text"}>
          {parsed.ok ? "JSON is well-formed." : `JSON error: ${parsed.error}`}
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <button type="button" className="btn-primary" onClick={() => save(false)} disabled={busy || !parsed.ok}>
          {busy ? "Saving…" : "Save"}
        </button>
        {!isNew && (kind === "procedure" || kind === "gallery" || kind === "faq") && (
          <button
            type="button"
            className="btn border border-red-700 text-red-700"
            disabled={busy}
            onClick={async () => {
              if (!window.confirm("Delete this item? This can't be undone.")) return;
              const res = await deleteContent(kind, id);
              if (res.ok) router.replace("/admin/content");
              else setMsg({ tone: "error", text: "Could not delete." });
            }}
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
}
