const prisma = require("../db");
const { verifyAccessToken } = require("../auth");

// Auth is optional here: logged-in users get their search recorded to
// tbl_search_history, guests can still search.
function attachUserIfPresent(req, res, next) {
    const header = req.headers.authorization || "";
    const [scheme, token] = header.split(" ");
    if (scheme === "Bearer" && token) {
        try {
            req.user = verifyAccessToken(token);
        } catch {
            // ignore invalid/expired token for a public search endpoint
        }
    }
    next();
}

module.exports = (app) => {

    // Powers the "Search & Explore" mobile screen.
    app.get("/mobile/search", attachUserIfPresent, async(req, res) => {
        const q = String(req.query.q || "").trim();
        if (!q) return res.status(422).json({ message: "q query param is required" });

        const [movies, theaters] = await Promise.all([
            prisma.movie.findMany({
                where: { title: { contains: q, mode: "insensitive" } },
                include: { genre: true },
                take: 20,
            }),
            prisma.theater.findMany({
                where: { theater_name: { contains: q, mode: "insensitive" } },
                include: { amenity: true },
                take: 20,
            }),
        ]);

        if (req.user) {
            await prisma.searchHistory.create({
                data: { user_id: req.user.sub, search_type: "RECENT_SEARCH", entry: q },
            });
        }

        res.json({ movies, theaters });
    });

    // Trending searches / genre shortcuts shown before the user types anything.
    app.get("/mobile/search/trending", async(req, res) => {
        const genres = await prisma.genre.findMany({ take: 8 });
        res.json({ genres });
    });
};
