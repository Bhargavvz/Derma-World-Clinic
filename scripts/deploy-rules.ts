/** Release firestore.rules and storage.rules to the real project via the Firebase Rules API (service account). */
import { readFileSync } from "node:fs";
import { cert, initializeApp } from "firebase-admin/app";

const json = JSON.parse(Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_JSON ?? "", "base64").toString("utf8"));
const credential = cert(json);
initializeApp({ credential });
const project = json.project_id as string;
const dbId = process.env.FIRESTORE_DATABASE_ID || "(default)";
const bucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!;
const base = `https://firebaserules.googleapis.com/v1/projects/${project}`;

async function call(method: string, url: string, body?: unknown) {
  const { access_token } = await credential.getAccessToken();
  const r = await fetch(url, { method, headers: { Authorization: `Bearer ${access_token}`, "Content-Type": "application/json" }, body: body ? JSON.stringify(body) : undefined });
  const text = await r.text();
  if (!r.ok) throw new Error(`${method} ${url} → ${r.status} ${text.slice(0, 300)}`);
  return JSON.parse(text || "{}");
}

async function release(file: string, releaseName: string) {
  const rs = await call("POST", `${base}/rulesets`, { source: { files: [{ name: file, content: readFileSync(file, "utf8") }] } });
  const name = `projects/${project}/releases/${releaseName}`;
  try {
    await call("PATCH", `${base}/releases/${releaseName}`, { release: { name, rulesetName: rs.name } });
  } catch {
    await call("POST", `${base}/releases`, { name, rulesetName: rs.name });
  }
  console.log(`released ${file} → ${releaseName} (${rs.name.split("/").pop()})`);
}

(async () => {
  await release("firestore.rules", dbId === "(default)" ? "cloud.firestore" : `cloud.firestore/${dbId}`);
  await release("storage.rules", `firebase.storage/${bucket}`);
})().catch((e) => {
  console.error("FAIL", (e as Error).message);
  process.exit(1);
});
