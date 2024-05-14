import express from "express";
import session from "express-session";
import mongoose from "mongoose";
import skinRouter from "./routes/skin.routes.js";
import userRouter from "./routes/user.routes.js";
import cors from "cors";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "./models/user.model.js";
import { generateJWT, generateRefreshToken, authenticateRefreshToken, authenticateToken } from "./jwtGenerator.js";
import cookieParser from "cookie-parser";

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
    origin: ['https://buffbrowser.com', 'https://www.buffbrowser.com'],
    credentials: true,
    optionsSuccessStatus: 200
}

app.use(cors(corsOptions));
app.use(express.json({ extended: true }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: "https://backend.buffbrowser.com:8080/auth/google/callback",
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
            let user = await User.findOne({ googleId: id });

            if (!user) {
                user = new User({
                    googleId: id,
                    displayName,
                    email: emails[0].value,
                    phone: "",
                });
            }

            const accessToken = generateJWT(user);
            const refreshToken = await generateRefreshToken();

            console.log("Access Token:", accessToken);
            console.log("Refresh Token:", refreshToken);

            user.refreshToken = refreshToken;
            user.refreshTokenExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
            await user.save();

            res.cookie("gId", user.googleId, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
            });

            res.cookie("accessToken", accessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
                expires: new Date(Date.now() + 15 * 60 * 1000) // 15 minutes
            });

            res.cookie("refreshToken", refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
                expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days 
            });

            res.redirect(`https://buffbrowser.com/profile`);
        } catch (error) {
            console.error("Error during user creation: ", error);
            res.redirect("/failed");
        }
    }
);

app.get("/auth/status", authenticateToken, (req, res) => {
    res.json({ authenticated: true, user: req.user });
});

app.post("/auth/refresh", async (req, res) => {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
        return res.status(401).json({ error: "No refresh token provided" });
    }
    
    const result = await authenticateRefreshToken(refreshToken);

    if (result.error) {
        return res.status(result.statusCode).json({ error: result.error });
    }

    res.cookie("accessToken", result.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
        maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.json({ success: true, message: "Access token refreshed." });
});

app.get("/logout", async (req, res) => {
    const googleId = req.cookies.gId;

    await User.findOneAndUpdate({ googleId: googleId }, { refreshToken: null, refreshTokenExpires: null });

    res.clearCookie("accessToken", { path: "/" });
    res.clearCookie("refreshToken", { path: "/" });
    res.clearCookie("gId", { path: "/" });

    res.status(200).json({ message: "Logged out successfully" });
});

app.use("/skin", skinRouter);
app.use("/user", userRouter);

app.listen(port, () => {
    console.log("Listening on port: " + port)
})
