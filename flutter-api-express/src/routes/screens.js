const prisma = require("../db");
const { requireAdmin } = require("../auth");

module.exports = (app) => {

    app.get("/screens", async(req, res) => {
        const m = await prisma.screen.findMany({
            include: { theater: true }
        });
        res.json(m)
    })

    app.get("/screens/:id", async(req, res) => {
        const m = await prisma.screen.findUnique({
            where: { screen_id: Number(req.params.id) },
            include: { theater: true }
        })
        if (!m) return res.status(404).json({ message: "Screen not found!" })
        res.json(m)
    })

    app.post("/screens", requireAdmin, async(req, res) => {
        const { theater_id, screen_name, format_type, total_seats } = req.body;
        const m = await prisma.screen.create({
            data: { theater_id, screen_name, format_type, total_seats }
        });
        res.status(201).json(m)
    })

    app.put("/screens/:id", requireAdmin, async(req, res) => {
        const { screen_name, format_type, total_seats } = req.body;
        const m = await prisma.screen.update({
            where: { screen_id: Number(req.params.id) },
            data: { screen_name, format_type, total_seats }
        })
        res.json(m)
    })

    app.delete("/screens/:id", requireAdmin, async(req, res) => {
        try {
            await prisma.screen.delete({
            where: { screen_id: Number(req.params.id) }
        })
            res.json({ message: "Screen Deleted!" })
        } catch (err) {
            if (err.code === "P2003") {
                return res.status(409).json({ message: "This screen still has scheduled showtimes. Remove them first." });
            }
            throw err;
        }
    })
}
