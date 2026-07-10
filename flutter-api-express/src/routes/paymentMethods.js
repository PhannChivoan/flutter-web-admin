const prisma = require("../db");
const { requireAuth } = require("../auth");

module.exports = (app) => {

    // Scoped to the logged-in user (admins see everyone's) — this is "my
    // saved cards", not a global list.
    app.get("/payment-methods", requireAuth, async(req, res) => {
        const where = req.user.role === "ADMIN" ? {} : { user_id: req.user.sub };
        const m = await prisma.paymentMethod.findMany({ where });
        res.json(m)
    })

    app.get("/payment-methods/:id", requireAuth, async(req, res) => {
        const m = await prisma.paymentMethod.findUnique({
            where: { payment_id: Number(req.params.id) }
        })
        if (!m) return res.status(404).json({ message: "Payment Method not found!" })
        if (m.user_id !== req.user.sub && req.user.role !== "ADMIN") {
            return res.status(403).json({ message: "Not your payment method" });
        }
        res.json(m)
    })

    app.post("/payment-methods", requireAuth, async(req, res) => {
        const { payment_type, card_last4, is_default } = req.body;
        const m = await prisma.paymentMethod.create({
            data: { user_id: req.user.sub, payment_type, card_last4, is_default: is_default ?? false }
        });
        res.status(201).json(m)
    })

    app.put("/payment-methods/:id", requireAuth, async(req, res) => {
        const existing = await prisma.paymentMethod.findUnique({ where: { payment_id: Number(req.params.id) } });
        if (!existing) return res.status(404).json({ message: "Payment Method not found!" })
        if (existing.user_id !== req.user.sub && req.user.role !== "ADMIN") {
            return res.status(403).json({ message: "Not your payment method" });
        }
        const { payment_type, card_last4, is_default } = req.body;
        const m = await prisma.paymentMethod.update({
            where: { payment_id: Number(req.params.id) },
            data: { payment_type, card_last4, is_default }
        })
        res.json(m)
    })

    app.delete("/payment-methods/:id", requireAuth, async(req, res) => {
        const existing = await prisma.paymentMethod.findUnique({ where: { payment_id: Number(req.params.id) } });
        if (!existing) return res.status(404).json({ message: "Payment Method not found!" })
        if (existing.user_id !== req.user.sub && req.user.role !== "ADMIN") {
            return res.status(403).json({ message: "Not your payment method" });
        }
        await prisma.paymentMethod.delete({
            where: { payment_id: Number(req.params.id) }
        })
        res.json({ message: "Payment Method Deleted!" })
    })
}
