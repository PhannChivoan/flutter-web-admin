// Routes specific to the Flutter mobile app, all mounted under /mobile/*.
// Kept separate from src/routes (the generic CRUD used by the web-admin)
// because these endpoints encode mobile-specific business logic:
// server-computed checkout pricing, seat-collision-safe seat maps, QR
// tickets, and response shapes tailored to the app's screens.
//
// Shared/generic endpoints the mobile app also uses directly (unchanged):
//   /auth/*, /genres, /amenities, /loyalty-tiers, /watchlist, /settings,
//   /user-settings, /search-history, /payment-methods
module.exports = (app) => {
    require("./home")(app);
    require("./search")(app);
    require("./theaters")(app);
    require("./showtimes")(app);
    require("./checkout")(app);
    require("./tickets")(app);
    require("./profile")(app);
    require("./watchlist")(app);
    require("./notifications")(app);
};
