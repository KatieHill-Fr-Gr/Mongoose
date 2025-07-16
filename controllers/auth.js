import express from "express"
const router = express.Router()
import User from "../models/user.js"

import bcrypt from "bcrypt"

// * Signup 

router.get("/sign-up", async (req, res) => {
    res.render("auth/sign-up.ejs");
});

router.post("/sign-up", async (req, res) => {
    try {
        // Render error message if username isn't filled in
        if (req.body.username.trim() === "") {
            throw new Error("Username is required.")
        }
        // Render error message if password isn't filled in
        if (req.body.password.trim() === "") {
            throw new Error("Password is required.")
        }
        // Check that the username doesn't exist already using fineOne (find() returns an array)
        const userInDatabase = await User.findOne({ username: req.body.username });
        if (userInDatabase) {
            throw new Error("Username already exists.");
        }
        // Check that passwords match
        if (req.body.password !== req.body.confirmPassword) {
            throw new Error("Passwords must match.");
        }
        const hashedPassword = bcrypt.hashSync(req.body.password, 10);
        req.body.password = hashedPassword;
        // validation logic
        const user = await User.create(req.body);
        // res.send(`Thanks for signing up ${user.username}`);
        req.session.message = "You're in!";
        // And to sign in user straight away after they've signed up:
        req.session.user = {
            username: user.username,
        };

        req.session.save(() => {
            res.redirect("/");
        });
    } catch (error) {
        req.session.message = error.message;
        res.redirect("/auth/sign-up");
    }

    // catch (error) {
    // error.renderForm(

    // )}

});

// The number 10 in the hashSync method represents the amount of salting 
// we want the hashing function to execute: the higher the number, 
// the harder it will be to decrypt the password. However, higher numbers 
// will take longer for our application when we’re checking a user’s password, 
// so we need to keep it reasonable for performance reasons.

router.get("/sign-in", async (req, res) => {
    res.render("auth/sign-in.ejs");
});

router.post("/sign-in", async (req, res) => {
    try {
        if (req.body.username.trim() === "") {
            throw new Error("Username is required")
        }
        if (req.body.password.trim() === "") {
            throw new Error("Password is required")
        }
        const userInDatabase = await User.findOne({ username: req.body.username })
        if (!userInDatabase) {
            throw new Error("Username not recognised. Please try again.")
        }
        const validPassword = bcrypt.compareSync(
            req.body.password,
            userInDatabase.password
        );
        if (!validPassword) {
            throw new Error("Password not recognised. Please try again.");
        }

        req.session.user = {
            username: userInDatabase.username,
            _id: userInDatabase._id
        };

        // req.session.user = userInDatabase would return the password too 
        // which shouldn't be in the cookie

        // Redirect back to originally requested page or a default
        const redirectTo = req.session.redirectTo || "/";
        delete req.session.redirectTo; // Clean up

        req.session.save(() => {
            res.redirect(redirectTo);
        });
    } catch (error) {
        console.log(error)
        req.session.message = error.message;
        res.redirect("/auth/sign-in");
    }
    // Adding the req.session.save() callback function makes it asynchronous
});


router.get("/sign-out", (req, res) => {
    // res.send("The user wants out!");
    // test it works before adding session removal and redirect
    req.session.destroy(() => {
        res.redirect("/");
    });
    // wrapping req.session.destroy() around the res.direct avoids the race condition too
});

export { router as authRouter }