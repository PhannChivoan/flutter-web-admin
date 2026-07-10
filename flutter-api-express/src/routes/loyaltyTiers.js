const prisma = require("../db");
const { requireAdmin } = require("../auth");

module.exports = (app) => {

    app.get("/loyalty-tiers", async(req, res) => {
        const m = await prisma.loyaltyTier.findMany();
        res.json(m)
    })

    app.get("/loyalty-tiers/:id", async(req, res) => {
        const m = await prisma.loyaltyTier.findUnique({
            where: { tier_id: Number(req.params.id) }
        })
        if (!m) return res.status(404).json({ message: "Loyalty Tier not found!" })
        res.json(m)
    })

    app.post("/loyalty-tiers", requireAdmin, async(req, res) => {
        const { tier_name, min_points, next_tier_id } = req.body;
        const m = await prisma.loyaltyTier.create({
            data: { tier_name, min_points, next_tier_id }
        });
        res.status(201).json(m)
    })

    app.put("/loyalty-tiers/:id", requireAdmin, async(req, res) => {
        const { tier_name, min_points, next_tier_id } = req.body;
        const m = await prisma.loyaltyTier.update({
            where: { tier_id: Number(req.params.id) },
            data: { tier_name, min_points, next_tier_id }
        })
        res.json(m)
    })

    app.delete("/loyalty-tiers/:id", requireAdmin, async(req, res) => {
        try {
            await prisma.loyaltyTier.delete({
            where: { tier_id: Number(req.params.id) }
        })
            res.json({ message: "Loyalty Tier Deleted!" })
        } catch (err) {
            if (err.code === "P2003") {
                return res.status(409).json({ message: "This loyalty tier still has members assigned to it. Reassign them first." });
            }
            throw err;
        }
    })
}
