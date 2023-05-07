const mongodb = require("mongodb");
const mongoose = require("mongoose");
const config = require("./config")

module.exports = connectDB = () => {

    mongoose.connect(config.databaseUrl);
    const db = mongoose.connection;
    db.on("error", error => console.log(error));
    db.on("open", () => console.log(`Database connected successfully.......!`));

}