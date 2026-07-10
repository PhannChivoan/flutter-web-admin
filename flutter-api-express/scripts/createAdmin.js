// Create (or promote) an admin user.
//
// Usage:
//   node scripts/createAdmin.js
//   node scripts/createAdmin.js admin@gmail.com admin123
//   node scripts/createAdmin.js --email=admin@gmail.com --password=admin123 --name="Site Admin"
//
// Defaults: admin@gmail.com / admin123 / "Admin"
require("dotenv").config();
const bcrypt = require("bcrypt");
const prisma = require("../src/db");

function parseArgs() {
    const args = process.argv.slice(2);
    const flags = {};
    const positional = [];

    for (const arg of args) {
        const match = arg.match(/^--([^=]+)=(.*)$/);
        if (match) {
            flags[match[1]] = match[2];
        } else {
            positional.push(arg);
        }
    }

    return {
        email: flags.email || positional[0] || "admin@gmail.com",
        password: flags.password || positional[1] || "admin123",
        name: flags.name || positional[2] || "Admin",
    };
}

async function main() {
    const { email, password, name } = parseArgs();

    const defaultTier = await prisma.loyaltyTier.findFirst({ orderBy: { tier_id: "asc" } });
    if (!defaultTier) {
        throw new Error("No loyalty tier exists yet — run the seed script first (npx prisma db seed).");
    }

    const password_hash = await bcrypt.hash(password, 10);

    const user = await prisma.user.upsert({
        where: { email },
        update: { role: "ADMIN", password_hash },
        create: {
            full_name: name,
            email,
            password_hash,
            role: "ADMIN",
            loyalty_tier_id: defaultTier.tier_id,
        },
    });

    console.log(`Admin ready -> email: ${user.email}  password: ${password}`);
}

main()
    .catch((err) => {
        console.error(err.message || err);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
