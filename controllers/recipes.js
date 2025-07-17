import express from 'express'
import Recipe from '../models/recipe.js'
import User from "../models/user.js"

import isSignedIn from "../middleware/is-signed-in.js"

const router = express.Router()

// * Routes

// Index

router.get('/', async (req, res, next) => {
    try {
        const recipes = await Recipe.find()
        return res.render('recipes/index.ejs', {
            allRecipes: recipes
        })
    } catch (error) {
        console.log(error)
        next(error)
    }
})

// New

router.get('/new', isSignedIn, (req, res) => {
    res.render('recipes/new.ejs')
})

// Edit

router.get('/:recipeId/edit', isSignedIn, async (req, res, next) => {
    try {
        const { recipeId } = req.params
        const recipe = await Recipe.findById(recipeId).populate("contributor") // Mongoose sees contributor refers to user and replaces ObjectID with the full User record

        if (!recipe.contributor.equals(req.session.user._id)) {
            return res.status(403).send("You are not authorized to edit this entry")
        }

        return res.render('recipes/edit.ejs', { recipe })
    } catch (error) {
        console.log(error)
        next(error)
    }
})


// Show 

router.get('/:recipeId', async (req, res, next) => {
    console.log("Show route")
    try {
        const { recipeId } = req.params
        const recipe = await Recipe.findById(recipeId).populate("contributor", "username") // this gets the full user document
        return res.render('recipes/show.ejs', { recipe })
    } catch (error) {
        console.log(error)
        next(error)
    }
})


// Create

router.post('/', isSignedIn, async (req, res, next) => { // remember to add the middleware to the arguments
    try {
        console.log("Session user:", req.session.user)
        req.body.contributor = req.session.user._id // This manually adds the logged-in user to the contributor field
        console.log("Contributor ID being set:", req.body.contributor)
        const newRecipe = await Recipe.create(req.body)
        return res.redirect(`/recipes/${newRecipe._id}`)
    } catch (error) {
        console.log(error)
        next(error) // this makes it look for the next middleware that handles errors
    }
})

// Update 

router.put('/:recipeId', isSignedIn, async (req, res, next) => {
    try {
        const { recipeId } = req.params
        const recipeToDelete = await Recipe.findById(recipeId)

        if (!recipeToDelete) {
            return res.status(404).send("Recipe not found");
        }

        if (!recipeToDelete.contributor.equals(req.session.user._id)) {
            return res.status(403).send('You are forbidden from accessing this resource')
        }
         await Recipe.findByIdAndUpdate(recipeId, req.body);

        return res.redirect(`/recipes/${recipeId}`)
        
    } catch (error) {
        console.log(error)
        next(error)
    }
})

// Delete
router.delete('/:recipeId', isSignedIn, async (req, res) => {
    try {
        const { recipeId } = req.params
        const deleteRecipe = await Recipe.findByIdAndDelete(recipeId)
        if (!deleteRecipe.contributor.equals(req.session.user._id)) {
            return res.status(403).send('You are forbidden from accessing this resource')
        }
        console.log(`Deleted ${deleteRecipe.title}`)
        return res.redirect('/recipes')
    } catch (error) {
        console.log(error)
    }
})

// Favourite
router.post('/:recipeId/favourited-by/:userId', isSignedIn, async (req, res, next) => {
    try {
        const { recipeId, userId } = req.params

        if (req.session.user._id !== userId) {
            return res.status(403).send('You are fobidden from accessing this resource')
        }

        await Recipe.findByIdAndUpdate(recipeId, {
            $push: { favouritedByUsers: userId }
        })

        return res.redirect(`/listings/${recipeId}`)
    } catch (error) {
        next(error)
    }
})


// Delete favourite

router.delete('/:recipeId/favourited-by/:userId', async (req, res, next) => {
    try {
        const { recipeId, userId } = req.params

        if (req.session.user._id !== userId)
            return res.status(403).send('You are forbidden from accessing this resource')

        await Recipe.findByIdAndUpdate(recipeId, {
            $pull: { favouritedByUsers: userId }
        })

        return res.redirect(`/listings/${recipeId}`)
    } catch (error) {
        next(error)
    }
})




export { router as recipesRouter }