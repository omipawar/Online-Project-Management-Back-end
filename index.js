const express = require("express");
const bodyparser = require("body-parser");
const config = require("./config/config");
const connectToDatabase = require("./config/database");

const app = express();

app.use(express.json());
app.use(express.static("assets"));
app.use(bodyparser.json({ limit: '50mb' }));
app.use(bodyparser.urlencoded({ limit: '50mb', extended: true }));

// CORS
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "*");
    if (req.method == "OPTIONS") {
        res.header("Access-Control-Allow-Methods", "PUT,POST,GET,PATCH,DELETE");
        return res.status(200).json({});
    }
    next();
});

// Database connection
connectToDatabase();

app.get("/", (req, res) => {
    res.send("Welcome! To test server......");
});

app.use("/login", require("./routes/login"));
app.use("/project", require("./routes/project"));


app.listen(config.port, (err) => {
    if (err) throw err;
    else {
        console.log(`Website started on http://localhost:${config.port}`);
    }
});