const prisma = require("../db");
const { requireAuth } = require("../auth");
const userSelect = require("../userSafeSelect");

module.exports = (app) => {

    app.get("/search-history", requireAuth, async(req, res) => {
        const m = await prisma.searchHistory.findMany({
            include: { user: { select: userSelect } }
        });
        res.json(m)
    })

    app.get("/search-history/:id", requireAuth, async(req, res) => {
        const m = await prisma.searchHistory.findUnique({
            where: { search_id: Number(req.params.id) }
        })
        if (!m) return res.status(404).json({ message: "Search History not found!" })
        res.json(m)
    })

    app.post("/search-history", requireAuth, async(req, res) => {
        const { user_id, search_type, entry, category } = req.body;
        const m = await prisma.searchHistory.create({
            data: { user_id, search_type, entry, category }
        });
        res.status(201).json(m)
    })

    app.delete("/search-history/:id", requireAuth, async(req, res) => {
        await prisma.searchHistory.delete({
            where: { search_id: Number(req.params.id) }
        })
        res.json({ message: "Search History Deleted!" })
    })
}
