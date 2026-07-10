const prisma = require("../db");
const { requireAdmin } = require("../auth");

module.exports = (app) => {

    app.get("/cast", async(req, res) => {
        const where = req.query.movie_id ? { movie_id: Number(req.query.movie_id) } : undefined;
        const m = await prisma.cast.findMany({
            where,
            include: { movie: true, actor: true },
            orderBy: { position: "asc" },
        });
        res.json(m)
    })

    app.get("/cast/:id", async(req, res) => {
        const m = await prisma.cast.findUnique({
            where: { cast_id: Number(req.params.id) },
            include: { movie: true, actor: true }
        })
        if (!m) return res.status(404).json({ message: "Cast not found!" })
        res.json(m)
    })

    app.post("/cast", requireAdmin, async(req, res) => {
        const { movie_id, actor_id, character_name, position } = req.body;
        try {
            const m = await prisma.cast.create({
                data: { movie_id, actor_id, character_name, position },
                include: { actor: true },
            });
            res.status(201).json(m)
        } catch (err) {
            if (err.code === "P2002") {
                return res.status(409).json({ message: "This actor is already in the cast for this movie." });
            }
            throw err;
        }
    })

    app.put("/cast/:id", requireAdmin, async(req, res) => {
        const { actor_id, character_name, position } = req.body;
        try {
            const m = await prisma.cast.update({
                where: { cast_id: Number(req.params.id) },
                data: { actor_id, character_name, position },
                include: { actor: true },
            })
            res.json(m)
        } catch (err) {
            if (err.code === "P2002") {
                return res.status(409).json({ message: "This actor is already in the cast for this movie." });
            }
            throw err;
        }
    })

    app.delete("/cast/:id", requireAdmin, async(req, res) => {
        await prisma.cast.delete({
            where: { cast_id: Number(req.params.id) }
        })
        res.json({ message: "Cast Deleted!" })
    })
}
