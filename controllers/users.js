import express from 'express'
const router = express.Router()

import Recipe from '../models/recipe.js'
import isSignedIn from "../middleware/is-signed-in.js"

//* PROFILE ROUTE

// this is where you create a get for /users/profile

router.get('/profile', isSignedIn, async (req, res, next) => {
    try {
        console.log('user: ', req.session.user);

        const myRecipes = await Recipe.find({
            contributor: req.session.user._id,
        }).populate('contributor');

        const favouriteRecipes = await Recipe.find({
           favouritedByUsers: req.session.user._id,
        }).populate('contributor');

        res.render('users/show.ejs', {
            myRecipes,
            favouriteRecipes
        });

    } catch (error) {
        console.log(error);
        res.redirect('/');
    }
});



export { router as usersRouter }