import express from "express";
import session from "express-session";
import mongoose from "mongoose";
import router from "./routes/skin.routes.js"
import cors from "cors";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "./models/user.model.js";
import generateJWT from "./jwtGenerator.js";

import dotenv from "dotenv";
dotenv.config();

const app = express();
const port = process.env.PORT;

//console.log(process.env.MONGO_URI)

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

app.use(
    session({
        secret: process.env.TOKEN_SECRET || "your-secret-key",
        resave: false,
        saveUninitialized: true,
    })
);

const corsOptions = {
    origin: 'http://localhost:3000',
    optionsSuccessStatus: 200
}

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: "http://localhost:8080/auth/google/callback",
        },
        (accessToken, refreshToken, profile, done) => {
            return done(null, profile);
        }
    )
);

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    done(null, user);
});

app.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));

app.get(
    "/auth/google/callback",
    passport.authenticate("google", { failureRedirect: "/failed" }),
    async (req, res) => {
        const { id, displayName, emails } = req.user;

        try {
            let existingUser = await User.findOne({ googleId: id });

            if (existingUser) {
                const token = generateJWT(existingUser);
                return res.redirect(`http://localhost:3000/profile?token=${token}`);
            }

            const newUser = new User({
                googleId: id,
                displayName,
                email: emails[0].value,
            });

            await newUser.save();

            const token = generateJWT(newUser);

            res.redirect(`http://localhost:3000/profile?token=${token}`);
        } catch (error) {
            console.error("Error during user creation: ", error);
            res.redirect("/failed");
        }
    }
);

app.get("/logout", (req, res) => {
    req.logout();
    res.redirect("http://localhost:3000");
});

app.use(cors(corsOptions));
app.use(express.json({ extended: true }));
app.use(express.urlencoded({ extended: true }));

app.use("/", router)

app.listen(port, () => {
    console.log("Listening on port: " + port)
})