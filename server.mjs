import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import router from "./routes/skin.routes.js"
import cors from "cors";

dotenv.config();

console.log(process.env.MONGO_URI)

mongoose
    .connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    }).then(() => {
        console.log("Database connection established");
    })
    .catch((err) => {
        console.log(`ERROR: ${err}`);
    });

const app = express();
const port = process.env.PORT;

const corsOptions = {
    origin: 'http://localhost:3000',
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}

app.use(cors(corsOptions));
app.use(express.json({ extended: true }));
app.use(express.urlencoded({ extended: true }));

app.use("/", router)

app.listen(port, () => {
    console.log("Listening on port: " + port)
})