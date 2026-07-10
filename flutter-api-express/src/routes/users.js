const prisma = require("../db");
const bcrypt = require("bcrypt");
const { requireAdmin } = require("../auth");

function toSafeUser(user) {
    const { password_hash, ...safe } = user;
    return safe;
}

module.exports = (app) => {

    app.get("/users", requireAdmin, async(req, res) => {
        const m = await prisma.user.findMany({
            include: { loyalty_tier: true }
        });
        res.json(m.map(toSafeUser))
    })

    app.get("/users/:id", requireAdmin, async(req, res) => {
        const m = await prisma.user.findUnique({
            where: { user_id: Number(req.params.id) },
            include: { loyalty_tier: true, payment_methods: true }
        })
        if (!m) return res.status(404).json({ message: "User not found!" })
        res.json(toSafeUser(m))
    })

    app.post("/users", requireAdmin, async(req, res) => {
        const { full_name, email, password, loyalty_tier_id, loyalty_points } = req.body;
        const password_hash = await bcrypt.hash(password, 10);
        const m = await prisma.user.create({
            data: {
                full_name, email, password_hash,
                loyalty_points: loyalty_points ?? 0,
                loyalty_tier: { connect: { tier_id: loyalty_tier_id } }
            }
        });
        res.status(201).json(toSafeUser(m))
    })

    app.put("/users/:id", requireAdmin, async(req, res) => {
        const { full_name, email, loyalty_tier_id, loyalty_points } = req.body;
        const m = await prisma.user.update({
            where: { user_id: Number(req.params.id) },
            data: { full_name, email, loyalty_tier_id, loyalty_points },
            include: { loyalty_tier: true }
        })
        res.json(toSafeUser(m))
    })

    app.delete("/users/:id", requireAdmin, async(req, res) => {
        try {
            await prisma.user.delete({
            where: { user_id: Number(req.params.id) }
        })
            res.json({ message: "User Deleted!" })
        } catch (err) {
            if (err.code === "P2003") {
                return res.status(409).json({ message: "This user still has bookings, payment methods, or other linked records. Remove them first." });
            }
            throw err;
        }
    })
}
