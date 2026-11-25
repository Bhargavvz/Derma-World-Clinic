// Emulator only: mark a test user's email as verified.
import { initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
process.env.FIREBASE_AUTH_EMULATOR_HOST ||= "127.0.0.1:9099";
initializeApp({ projectId: "demo-derma-world" });
const email = process.argv[2]!;
getAuth().getUserByEmail(email).then((u) => getAuth().updateUser(u.uid, { emailVerified: true })).then(() => console.log("verified"));
