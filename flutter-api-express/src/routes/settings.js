const prisma = require("../db");
const { requireAdmin } = require("../auth");

module.exports = (app) => {

    app.get("/settings", async(req, res) => {
        const m = await prisma.setting.findMany();
        res.json(m)
    })

    app.get("/settings/:id", async(req, res) => {
        const m = await prisma.setting.findUnique({
            where: { setting_id: Number(req.params.id) }
        })
        if (!m) return res.status(404).json({ message: "Setting not found!" })
        res.json(m)
    })

    app.post("/settings", requireAdmin, async(req, res) => {
        const { section, setting_name, default_value } = req.body;
        const m = await prisma.setting.create({
            data: { section, setting_name, default_value }
        });
        res.status(201).json(m)
    })

    app.put("/settings/:id", requireAdmin, async(req, res) => {
        const { section, setting_name, default_value } = req.body;
        const m = await prisma.setting.update({
            where: { setting_id: Number(req.params.id) },
            data: { section, setting_name, default_value }
        })
        res.json(m)
    })

    app.delete("/settings/:id", requireAdmin, async(req, res) => {
        await prisma.setting.delete({
            where: { setting_id: Number(req.params.id) }
        })
        res.json({ message: "Setting Deleted!" })
    })
}
