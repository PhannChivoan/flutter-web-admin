const prisma = require("../db");
const { generateSeatLabels } = require("./seatMap");

module.exports = (app) => {

    // Filterable showtime list (by movie and/or theater and/or date) for the
    // mobile app's movie-detail "pick a showtime" flow.
    app.get("/mobile/showtimes", async(req, res) => {
        const { movie_id, theater_id, date } = req.query;

        const where = {
            ...(movie_id ? { movie_id: Number(movie_id) } : {}),
            ...(theater_id ? { screen: { theater_id: Number(theater_id) } } : {}),
            ...(date ? { show_date: new Date(date) } : {}),
        };

        const showtimes = await prisma.showtime.findMany({
            where,
            include: { movie: true, screen: { include: { theater: true } } },
            orderBy: [{ show_date: "asc" }, { show_time: "asc" }],
        });

        res.json(showtimes);
    });

    app.get("/mobile/showtimes/:id", async(req, res) => {
        const showtime = await prisma.showtime.findUnique({
            where: { showtime_id: Number(req.params.id) },
            include: { movie: true, screen: { include: { theater: true } } },
        });
        if (!showtime) return res.status(404).json({ message: "Showtime not found!" });
        res.json(showtime);
    });

    // Powers the "Seat Selection" mobile screen: full seat grid with each
    // seat's live availability for this specific showtime.
    app.get("/mobile/showtimes/:id/seats", async(req, res) => {
        const showtimeId = Number(req.params.id);
        const showtime = await prisma.showtime.findUnique({
            where: { showtime_id: showtimeId },
            include: { screen: true },
        });
        if (!showtime) return res.status(404).json({ message: "Showtime not found!" });

        const taken = await prisma.bookingSeat.findMany({
            where: { showtime_id: showtimeId },
            select: { seat_label: true },
        });
        const takenSet = new Set(taken.map((t) => t.seat_label));

        const seats = generateSeatLabels(showtime.screen.total_seats).map((label) => ({
            seat_label: label,
            status: takenSet.has(label) ? "BOOKED" : "AVAILABLE",
        }));

        res.json({
            showtime_id: showtimeId,
            ticket_price: showtime.ticket_price,
            total_seats: showtime.screen.total_seats,
            seats_remaining: showtime.screen.total_seats - takenSet.size,
            seats,
        });
    });
};
