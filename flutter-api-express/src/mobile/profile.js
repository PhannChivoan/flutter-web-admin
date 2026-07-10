const prisma = require("../db");
const { requireAuth, hashPassword, verifyPassword } = require("../auth");

function toSafeUser(user) {
    const { password_hash, ...safe } = user;
    return safe;
}

module.exports = (app) => {

    // Powers "My Profile".
    app.get("/mobile/profile", requireAuth, async(req, res) => {
        const user = await prisma.user.findUnique({
            where: { user_id: req.user.sub },
            include: { loyalty_tier: true },
        });
        if (!user) return res.status(404).json({ message: "User not found" });
        res.json(toSafeUser(user));
    });

    // Powers editing on "My Profile" / "Settings & Preferences".
    app.patch("/mobile/profile", requireAuth, async(req, res) => {
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

    // Change password from within the app (distinct from "forgot password").
    app.post("/mobile/profile/change-password", requireAuth, async(req, res) => {
        const { current_password, new_password } = req.body;
        if (!current_password || !new_password) {
            return res.status(422).json({ message: "current_password and new_password are required" });
        }

        const user = await prisma.user.findUnique({ where: { user_id: req.user.sub } });
        if (!user || !(await verifyPassword(current_password, user.password_hash))) {
            return res.status(401).json({ message: "Current password is incorrect" });
        }

        const password_hash = await hashPassword(new_password);
        await prisma.user.update({ where: { user_id: req.user.sub }, data: { password_hash } });
        res.json({ message: "Password updated" });
    });
};
