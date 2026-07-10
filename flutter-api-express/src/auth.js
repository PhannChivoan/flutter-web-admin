const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const ACCESS_EXPIRES_IN = process.env.JWT_ACCESS_EXPIRES_IN || "15m";
const REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || "30d";

function hashPassword(password) {
    return bcrypt.hash(password, 10);
}

function verifyPassword(password, hash) {
    return bcrypt.compare(password, hash);
}

function signAccessToken(user) {
    return jwt.sign(
        { sub: user.user_id, email: user.email, role: user.role },
        ACCESS_SECRET,
        { expiresIn: ACCESS_EXPIRES_IN }
    );
}

function signRefreshToken(userId) {
    return jwt.sign({ sub: userId }, REFRESH_SECRET, { expiresIn: REFRESH_EXPIRES_IN });
}

function verifyAccessToken(token) {
    return jwt.verify(token, ACCESS_SECRET);
}

function verifyRefreshToken(token) {
    return jwt.verify(token, REFRESH_SECRET);
}

function refreshTokenExpiryDate() {
    const days = parseInt(String(REFRESH_EXPIRES_IN).replace(/[^0-9]/g, ""), 10) || 30;
    return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}

// Express middleware: attaches req.user from a Bearer access token.
function requireAuth(req, res, next) {
    const header = req.headers.authorization || "";
    const [scheme, token] = header.split(" ");
    if (scheme !== "Bearer" || !token) {
        return res.status(401).json({ message: "Missing or invalid Authorization header" });
    }
    try {
        req.user = verifyAccessToken(token);
        next();
    } catch {
        return res.status(401).json({ message: "Invalid or expired access token" });
    }
}

function requireAdmin(req, res, next) {
    requireAuth(req, res, () => {
        if (req.user.role !== "ADMIN") {
            return res.status(403).json({ message: "Admin access required" });
        }
        next();
    });
}

module.exports = {
    hashPassword,
    verifyPassword,
    signAccessToken,
    signRefreshToken,
    verifyAccessToken,
    verifyRefreshToken,
    refreshTokenExpiryDate,
    requireAuth,
    requireAdmin,
};
