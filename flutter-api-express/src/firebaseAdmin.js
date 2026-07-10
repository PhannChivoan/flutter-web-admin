// Lazily-initialized Firebase Admin SDK, used only to verify ID tokens the
// mobile app gets after signing into Firebase with Google/Facebook as the
// identity provider (see /auth/firebase in routes/auth.js).
//
// Setup: Firebase console -> Project settings -> Service accounts ->
// "Generate new private key". Save the downloaded JSON somewhere inside
// this project (NOT committed to git) and point FIREBASE_SERVICE_ACCOUNT_PATH
// at it in .env, e.g.:
//   FIREBASE_SERVICE_ACCOUNT_PATH="./firebase-service-account.json"
//
// Until that's set, /auth/firebase responds 500 with a clear message instead
// of crashing the whole server at startup.
// firebase-admin v14 uses a flatter, modular API — no more admin.credential.cert
// / admin.auth(app) namespacing from older versions.
const { initializeApp, cert } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");

let app = null;

function getFirebaseApp() {
    if (app) return app;

    const path = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
    if (!path) {
        throw new Error(
            "FIREBASE_SERVICE_ACCOUNT_PATH is not set — see src/firebaseAdmin.js for setup steps."
        );
    }

    const serviceAccount = require(require("path").resolve(path));
    app = initializeApp({ credential: cert(serviceAccount) });
    return app;
}

async function verifyFirebaseIdToken(idToken) {
    return getAuth(getFirebaseApp()).verifyIdToken(idToken);
}

module.exports = { verifyFirebaseIdToken };
