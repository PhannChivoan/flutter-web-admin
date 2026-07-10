const crypto = require("crypto");
const prisma = require("../db");
const { verifyFirebaseIdToken } = require("../firebaseAdmin");
const {
    hashPassword,
    verifyPassword,
    signAccessToken,
    signRefreshToken,
    verifyRefreshToken,
    refreshTokenExpiryDate,
    requireAuth,
} = require("../auth");

function toSafeUser(user) {
    const { password_hash, ...safe } = user;
    return safe;
}

// Shared by /auth/firebase: reuses an existing account with this email, or
// creates a new customer account for it. Social accounts get a random,
// never-shared password hash since they never log in with one.
async function findOrCreateSocialUser({ email, fullName }) {
    const existing = await prisma.user.findUnique({ where: { email }, include: { loyalty_tier: true } });
    if (existing) return existing;

    const defaultTier = await prisma.loyaltyTier.findFirst({ orderBy: { tier_id: "asc" } });
    if (!defaultTier) throw new Error("No loyalty tier configured");

    const password_hash = await hashPassword(crypto.randomBytes(24).toString("hex"));
    return prisma.user.create({
        data: { full_name: fullName, email, password_hash, loyalty_tier_id: defaultTier.tier_id },
        include: { loyalty_tier: true },
    });
}

async function issueSession(res, status, user) {
    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user.user_id);
    await prisma.refreshToken.create({
        data: { token: refreshToken, user_id: user.user_id, expires_at: refreshTokenExpiryDate() },
    });
    res.status(status).json({ user: toSafeUser(user), accessToken, refreshToken });
}

module.exports = (app) => {
    // Mobile app + web-admin both hit this to create a customer account.
    app.post("/auth/register", async(req, res) => {
        const { full_name, email, password } = req.body;
        if (!full_name || !email || !password) {
            return res.status(422).json({ message: "full_name, email and password are required" });
        }

        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) return res.status(409).json({ message: "An account with this email already exists" });

        const defaultTier = await prisma.loyaltyTier.findFirst({ orderBy: { tier_id: "asc" } });
        if (!defaultTier) return res.status(500).json({ message: "No loyalty tier configured" });

        const password_hash = await hashPassword(password);
        const user = await prisma.user.create({
            data: {
                full_name,
                email,
                password_hash,
                loyalty_tier_id: defaultTier.tier_id,
            },
            include: { loyalty_tier: true },
        });

        await issueSession(res, 201, user);
    });

    // Every mobile sign-in path (email/password, Google, Facebook) goes
    // through Firebase Auth client-side, then lands here: the app sends us
    // the resulting Firebase ID token, we verify it server-side and exchange
    // it for our own access/refresh tokens. Creates a local account
    // automatically on first sign-in, matched by email — that's what makes
    // a freshly-registered mobile user show up in the web-admin user list.
    app.post("/auth/firebase", async(req, res) => {
        const { idToken, full_name } = req.body;
        if (!idToken) return res.status(422).json({ message: "idToken is required" });

        let payload;
        try {
            payload = await verifyFirebaseIdToken(idToken);
        } catch (err) {
            if (err.message && err.message.includes("FIREBASE_SERVICE_ACCOUNT_PATH")) {
                return res.status(500).json({ message: "Firebase is not configured on the server yet." });
            }
            console.error("verifyFirebaseIdToken failed:", err.code || err.message, "-", err.message);
            return res.status(401).json({ message: "Invalid Firebase token" });
        }
        if (!payload.email) {
            return res.status(422).json({ message: "This account has no email" });
        }

        // full_name (sent explicitly right after sign-up, before Firebase's
        // own profile update has necessarily propagated to token claims)
        // takes priority over whatever name Firebase attached to the token.
        const user = await findOrCreateSocialUser({
            email: payload.email,
            fullName: full_name || payload.name || payload.email,
        });
        await issueSession(res, 200, user);
    });

    // Shared login for both the Flutter mobile app and the web-admin.
    app.post("/auth/login", async(req, res) => {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(422).json({ message: "email and password are required" });
        }

        const user = await prisma.user.findUnique({
            where: { email },
            include: { loyalty_tier: true },
        });
        if (!user || !(await verifyPassword(password, user.password_hash))) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        await issueSession(res, 200, user);
    });

    app.post("/auth/refresh", async(req, res) => {
        const { refreshToken } = req.body;
        if (!refreshToken) return res.status(422).json({ message: "refreshToken is required" });

        const stored = await prisma.refreshToken.findUnique({ where: { token: refreshToken } });
        if (!stored || stored.expires_at < new Date()) {
            return res.status(401).json({ message: "Refresh token is invalid or expired" });
        }

        let payload;
        try {
            payload = verifyRefreshToken(refreshToken);
        } catch {
            return res.status(401).json({ message: "Refresh token is invalid or expired" });
        }

        const user = await prisma.user.findUnique({ where: { user_id: payload.sub } });
        if (!user) return res.status(404).json({ message: "User not found" });

        await prisma.refreshToken.delete({ where: { token: refreshToken } });

        const accessToken = signAccessToken(user);
        const newRefreshToken = signRefreshToken(user.user_id);
        await prisma.refreshToken.create({
            data: { token: newRefreshToken, user_id: user.user_id, expires_at: refreshTokenExpiryDate() },
        });

        res.json({ accessToken, refreshToken: newRefreshToken });
    });

    app.post("/auth/logout", async(req, res) => {
        const { refreshToken } = req.body;
        if (refreshToken) {
            await prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
        }
        res.json({ message: "Logged out" });
    });

    app.get("/auth/me", requireAuth, async(req, res) => {
        const user = await prisma.user.findUnique({
            where: { user_id: req.user.sub },
            include: { loyalty_tier: true },
        });
        if (!user) return res.status(404).json({ message: "User not found" });
        res.json(toSafeUser(user));
    });

    // Shared profile editor: mobile "My Profile" and the web-admin Settings screen.
    app.patch("/auth/me", requireAuth, async(req, res) => {
        const { full_name, phone, avatar_url } = req.body;
        const user = await prisma.user.update({
            where: { user_id: req.user.sub },
            data: {
                ...(full_name !== undefined ? { full_name } : {}),
                ...(phone !== undefined ? { phone } : {}),
                ...(avatar_url !== undefined ? { avatar_url } : {}),
            },
            include: { loyalty_tier: true },
        });
        res.json(toSafeUser(user));
    });
};
