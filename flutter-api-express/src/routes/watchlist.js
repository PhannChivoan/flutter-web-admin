const prisma = require("../db");
const { requireAuth } = require("../auth");
const userSelect = require("../userSafeSelect");

module.exports = (app) => {

    app.get("/watchlist", requireAuth, async(req, res) => {
        const m = await prisma.watchlist.findMany({
            include: { user: { select: userSelect }, movie: true }
        });
        res.json(m)
    })

    app.post("/watchlist", requireAuth, async(req, res) => {
        const { user_id, movie_id } = req.body;
        const m = await prisma.watchlist.create({
            data: { user_id, movie_id }
        });
        res.status(201).json(m)
    })

    app.delete("/watchlist", requireAuth, async(req, res) => {
        const { user_id, movie_id } = req.body;
        await prisma.watchlist.delete({
            where: { user_id_movie_id: { user_id, movie_id } }
        })
        res.json({ message: "Watchlist item Deleted!" })
    })
}
