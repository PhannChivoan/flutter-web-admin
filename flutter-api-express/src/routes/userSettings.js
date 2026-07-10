const prisma = require("../db");
const { requireAuth } = require("../auth");
const userSelect = require("../userSafeSelect");

module.exports = (app) => {

    app.get("/user-settings", requireAuth, async(req, res) => {
        const m = await prisma.userSetting.findMany({
            include: { user: { select: userSelect }, setting: true }
        });
        res.json(m)
    })

    app.post("/user-settings", requireAuth, async(req, res) => {
        const { user_id, setting_id, current_value } = req.body;
        const m = await prisma.userSetting.create({
            data: { user_id, setting_id, current_value }
        });
        res.status(201).json(m)
    })

    app.put("/user-settings", requireAuth, async(req, res) => {
        const { user_id, setting_id, current_value } = req.body;
        const m = await prisma.userSetting.update({
            where: { user_id_setting_id: { user_id, setting_id } },
            data: { current_value }
        })
        res.json(m)
    })

    app.delete("/user-settings", requireAuth, async(req, res) => {
        const { user_id, setting_id } = req.body;
        await prisma.userSetting.delete({
            where: { user_id_setting_id: { user_id, setting_id } }
        })
        res.json({ message: "User Setting Deleted!" })
    })
}
