import dotenv from "dotenv";
dotenv.config();

import http from "http";
// import mongoose from "mongoose";

import app from "./app.js";

const PORT = process.env.PORT;
// const MONGO_URL = process.env.MONGO_URL;

const server = http.createServer(app);

// mongoose.connection.once("open", () => {
//     console.log("mongoose is connected");
// });
// mongoose.connection.on("error", (err) => {
//     console.log(err);
// });

async function startServer() {
    // await mongoose.connect(MONGO_URL);
    server.listen(PORT, () => {
        console.log(`Server is Live at Port: ${PORT}`)
    });
}

startServer();