const prisma = require("../db");
const { requireAuth } = require("../auth");

const ticketInclude = {
    showtime: { include: { movie: true, screen: { include: { theater: true } } } },
    payment_method: true,
    seats: true,
};

module.exports = (app) => {

    // Powers "My Tickets" list for the logged-in mobile user.
    app.get("/mobile/tickets", requireAuth, async(req, res) => {
        const bookings = await prisma.booking.findMany({
            where: { user_id: req.user.sub },
            include: ticketInclude,
            orderBy: { booked_at: "desc" },
        });
        res.json(bookings);
    });

    // Powers the "My Ticket - QR" mobile screen. `qr_code` is the exact string
    // the app should encode into the QR image; the venue kiosk scans it back
    // to this same endpoint (or a staff-facing lookup) to validate the booking.
    app.get("/mobile/tickets/:id", requireAuth, async(req, res) => {
        const booking = await prisma.booking.findUnique({
            where: { booking_id: Number(req.params.id) },
            include: ticketInclude,
        });
        if (!booking) return res.status(404).json({ message: "Ticket not found!" });
        if (booking.user_id !== req.user.sub && req.user.role !== "ADMIN") {
            return res.status(403).json({ message: "Not your ticket" });
        }
        res.json(booking);
    });

    // Staff/kiosk-facing lookup by QR payload (e.g. scanning at the door).
    app.get("/mobile/tickets/verify/:qrCode", requireAuth, async(req, res) => {
        const booking = await prisma.booking.findUnique({
            where: { qr_code: req.params.qrCode },
            include: ticketInclude,
        });
        if (!booking) return res.status(404).json({ message: "Invalid ticket" });
        res.json({ valid: true, booking });
    });
};
