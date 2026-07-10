// Prisma `select` shape for nesting a user without leaking password_hash.
module.exports = {
    user_id: true,
    full_name: true,
    email: true,
    role: true,
    loyalty_tier_id: true,
    loyalty_points: true,
    created_at: true,
};
