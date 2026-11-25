/** Read-only connectivity check against the real project (no writes). */
import { cert, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import { getStorage } from "firebase-admin/storage";

const json = JSON.parse(Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_JSON ?? "", "base64").toString("utf8"));
initializeApp({ credential: cert(json), storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET });
getFirestore(process.env.FIRESTORE_DATABASE_ID || "(default)").settings({ preferRest: true });
setTimeout(() => {
  console.log("TIMEOUT");
  process.exit(2);
}, 45000);

const check = async (name: string, f: () => Promise<unknown>) => {
  try {
    console.log(name, "OK", await f());
  } catch (e) {
    console.log(name, "FAIL", (e as Error).message.split("\n")[0]?.slice(0, 200));
  }
};

(async () => {
  await check("firestore", async () => `${(await getFirestore(process.env.FIRESTORE_DATABASE_ID || "(default)").collection("treatments").limit(1).get()).size} treatment docs`);
  await check("auth", async () => `${(await getAuth().listUsers(5)).users.length} users`);
  await check("storage", async () => `bucket exists: ${(await getStorage().bucket().exists())[0]}`);
  process.exit(0);
})();
