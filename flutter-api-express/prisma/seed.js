require("dotenv").config();
const bcrypt = require("bcrypt");
const prisma = require("../src/db");

async function main() {
    // Loyalty tiers
    await prisma.loyaltyTier.upsert({
        where: { tier_id: 1 },
        update: { tier_name: "Silver", min_points: 0 },
        create: { tier_id: 1, tier_name: "Silver", min_points: 0 },
    });
    const gold = await prisma.loyaltyTier.upsert({
        where: { tier_id: 2 },
        update: { tier_name: "Gold", min_points: 5000 },
        create: { tier_id: 2, tier_name: "Gold", min_points: 5000 },
    });
    await prisma.loyaltyTier.upsert({
        where: { tier_id: 3 },
        update: { tier_name: "Platinum", min_points: 15000 },
        create: { tier_id: 3, tier_name: "Platinum", min_points: 15000 },
    });
    await prisma.loyaltyTier.update({ where: { tier_id: 1 }, data: { next_tier_id: 2 } });
    await prisma.loyaltyTier.update({ where: { tier_id: 2 }, data: { next_tier_id: 3 } });

    // Admin account for the web-admin
    const adminPassword = await bcrypt.hash("admin12345", 10);
    await prisma.user.upsert({
        where: { email: "admin@cinepremium.com" },
        update: { role: "ADMIN" },
        create: {
            full_name: "Alex Mercer",
            email: "admin@cinepremium.com",
            password_hash: adminPassword,
            role: "ADMIN",
            loyalty_tier_id: gold.tier_id,
            loyalty_points: 1200,
        },
    });
    console.log("Admin login -> email: admin@cinepremium.com  password: admin12345");

    // Genres
    const genreNames = ["Sci-Fi", "Action", "Drama", "Thriller", "Horror"];
    const genres = {};
    for (const name of genreNames) {
        genres[name] = await prisma.genre.upsert({
            where: { genre_name: name },
            update: {},
            create: { genre_name: name },
        });
    }

    // Amenities
    const amenityNames = ["IMAX", "Dolby Atmos", "Recliner Seating"];
    let firstAmenity = null;
    for (const name of amenityNames) {
        const a = await prisma.amenity.upsert({
            where: { amenity_name: name },
            update: {},
            create: { amenity_name: name },
        });
        if (!firstAmenity) firstAmenity = a;
    }

    // Catalog (movies/theater/screen/showtime) — only seed once.
    const movieCount = await prisma.movie.count();
    if (movieCount === 0) {
        const movieSeeds = [
            { title: "Stellar Echoes", content_rating: "PG-13", duration_min: 134, star_rating: 8.4, status: "NOW_SHOWING", release_date: new Date("2023-10-12"), synopsis: "A sci-fi thriller.", genre: "Sci-Fi" },
            { title: "Neon Nights", content_rating: "R", duration_min: 118, star_rating: 7.6, status: "COMING_SOON", release_date: new Date("2023-11-05"), synopsis: "Cyberpunk action.", genre: "Action" },
            { title: "Desert Wind", content_rating: "PG", duration_min: 150, star_rating: 8.1, status: "NOW_SHOWING", release_date: new Date("2023-01-15"), synopsis: "A sweeping drama.", genre: "Drama" },
        ];

        const movies = [];
        for (const m of movieSeeds) {
            movies.push(
                await prisma.movie.create({
                    data: {
                        title: m.title,
                        content_rating: m.content_rating,
                        duration_min: m.duration_min,
                        star_rating: m.star_rating,
                        status: m.status,
                        release_date: m.release_date,
                        synopsis: m.synopsis,
                        genre_id: genres[m.genre].genre_id,
                    },
                })
            );
        }

        const theater = await prisma.theater.create({
            data: {
                theater_name: "CinePremium Downtown",
                address: "1200 Cinema Blvd",
                city: "Metro City",
                state: "NY",
                zip: "10001",
                distance_miles: 2.4,
                star_rating: 4.6,
                amenity_id: firstAmenity?.amenity_id,
            },
        });

        const screen = await prisma.screen.create({
            data: {
                theater_id: theater.theater_id,
                screen_name: "Screen 1",
                format_type: "IMAX",
                total_seats: 80,
            },
        });

        await prisma.showtime.create({
            data: {
                movie_id: movies[0].movie_id,
                screen_id: screen.screen_id,
                show_date: new Date(),
                show_time: new Date("1970-01-01T19:30:00Z"),
                availability: "AVAILABLE",
                seats_remaining: 65,
            },
        });

        console.log(`Seeded ${movies.length} movies, 1 theater, 1 screen, 1 showtime.`);
    } else {
        console.log("Movies already seeded, skipping catalog seed.");
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
