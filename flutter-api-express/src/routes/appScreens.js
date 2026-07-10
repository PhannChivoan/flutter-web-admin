const prisma = require("../db");
const { requireAdmin } = require("../auth");

module.exports = (app) => {

    app.get("/app-screens", async(req, res) => {
        const m = await prisma.appScreen.findMany();
        res.json(m)
    })

    app.get("/app-screens/:id", async(req, res) => {
        const m = await prisma.appScreen.findUnique({
            where: { screen_id: Number(req.params.id) }
        })
        if (!m) return res.status(404).json({ message: "App Screen not found!" })
        res.json(m)
    })

    app.post("/app-screens", requireAdmin, async(req, res) => {
        const { screen_name, route, nav_tab, auth_required } = req.body;
        const m = await prisma.appScreen.create({
            data: { screen_name, route, nav_tab, auth_required: auth_required ?? true }
        });
        res.status(201).json(m)
    })

    app.put("/app-screens/:id", requireAdmin, async(req, res) => {
        const { screen_name, route, nav_tab, auth_required } = req.body;
        const m = await prisma.appScreen.update({
            where: { screen_id: Number(req.params.id) },
            data: { screen_name, route, nav_tab, auth_required }
        })
        res.json(m)
    })

    app.delete("/app-screens/:id", requireAdmin, async(req, res) => {
        await prisma.appScreen.delete({
            where: { screen_id: Number(req.params.id) }
        })
        res.json({ message: "App Screen Deleted!" })
    })
}
