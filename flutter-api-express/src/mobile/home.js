const prisma = require("../db");

module.exports = (app) => {

    // Powers the "Home - Now Showing" mobile screen: now playing + coming soon rails.
    app.get("/mobile/home", async(req, res) => {
        const [nowShowing, comingSoon] = await Promise.all([
            prisma.movie.findMany({
                where: { status: "NOW_SHOWING" },
                include: { genre: true },
                orderBy: { release_date: "desc" },
            }),
            prisma.movie.findMany({
                where: { status: "COMING_SOON" },
                include: { genre: true },
                orderBy: { release_date: "asc" },
            }),
        ]);

        res.json({ now_showing: nowShowing, coming_soon: comingSoon });
    });
};
