const prisma = require("../db");
const { requireAuth } = require("../auth");

module.exports = (app) => {

    app.get("/mobile/watchlist", requireAuth, async(req, res) => {
        const items = await prisma.watchlist.findMany({
            where: { user_id: req.user.sub },
            include: { movie: { include: { genre: true } } },
            orderBy: { saved_at: "desc" },
        });
        res.json(items);
    });

    // Single tap add/remove for a movie's watchlist/heart icon.
    app.post("/mobile/watchlist/toggle", requireAuth, async(req, res) => {
        const { movie_id } = req.body;
        if (!movie_id) return res.status(422).json({ message: "movie_id is required" });

        const key = { user_id_movie_id: { user_id: req.user.sub, movie_id: Number(movie_id) } };
        const existing = await prisma.watchlist.findUnique({ where: key });

        if (existing) {
            await prisma.watchlist.delete({ where: key });
            return res.json({ saved: false });
        }

        await prisma.watchlist.create({ data: { user_id: req.user.sub, movie_id: Number(movie_id) } });
        res.json({ saved: true });
    });
};
