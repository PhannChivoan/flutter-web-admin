const prisma = require("../db");
const { requireAuth } = require("../auth");

module.exports = (app) => {

    // Powers the notification bell / inbox on the mobile app.
    app.get("/mobile/notifications", requireAuth, async(req, res) => {
        const notifications = await prisma.notification.findMany({
            where: { user_id: req.user.sub },
            include: { movie: true },
            orderBy: { created_at: "desc" },
        });
        res.json(notifications);
    });

    app.put("/mobile/notifications/:id/read", requireAuth, async(req, res) => {
        const existing = await prisma.notification.findUnique({ where: { notification_id: Number(req.params.id) } });
        if (!existing || existing.user_id !== req.user.sub) {
            return res.status(404).json({ message: "Notification not found!" });
        }
        const m = await prisma.notification.update({
            where: { notification_id: Number(req.params.id) },
            data: { is_read: true },
        });
        res.json(m);
    });

    app.put("/mobile/notifications/read-all", requireAuth, async(req, res) => {
        await prisma.notification.updateMany({
            where: { user_id: req.user.sub, is_read: false },
            data: { is_read: true },
        });
        res.json({ message: "All notifications marked read." });
    });

    app.delete("/mobile/notifications/:id", requireAuth, async(req, res) => {
        const existing = await prisma.notification.findUnique({ where: { notification_id: Number(req.params.id) } });
        if (!existing || existing.user_id !== req.user.sub) {
            return res.status(404).json({ message: "Notification not found!" });
        }
        await prisma.notification.delete({ where: { notification_id: Number(req.params.id) } });
        res.json({ message: "Notification deleted." });
    });
};
