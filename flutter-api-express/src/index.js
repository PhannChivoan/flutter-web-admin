module.exports = (app) => {
    require("./routes/auth")(app);
    require("./routes/loyaltyTiers")(app);
    require("./routes/genres")(app);
    require("./routes/amenities")(app);
    require("./routes/movies")(app);
    require("./routes/actors")(app);
    require("./routes/cast")(app);
    require("./routes/theaters")(app);
    require("./routes/screens")(app);
    require("./routes/showtimes")(app);
    require("./routes/users")(app);
    require("./routes/paymentMethods")(app);
    require("./routes/bookings")(app);
    require("./routes/watchlist")(app);
    require("./routes/searchHistory")(app);
    require("./routes/settings")(app);
    require("./routes/userSettings")(app);
    require("./routes/appScreens")(app);
    require("./mobile")(app);

    app.get("/", (req, res) => {
        res.send("Hello World");
    });
};