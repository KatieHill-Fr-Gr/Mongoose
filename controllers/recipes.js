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
        const recipe = await Recipe.findById(recipeId)
        return res.render('recipes/edit.ejs', { recipe })
    } catch (error) {
        console.log(error)
        next(error)
    }
})


// Show 

router.get('/:recipeId', async (req, res, next) => {
    try {
        const { recipeId } = req.params
        const recipe = await Recipe.findById(recipeId)
        return res.render('recipes/show.ejs', { recipe })
    } catch (error) {
        console.log(error)
        next(error)
    }
})


// Create

router.post('/', isSignedIn, async (req, res, next) => { // remember to add the middleware to the arguments
    try {
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
        await Recipe.findByIdAndUpdate(recipeId, req.body) // find all the methods in the documentation
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
    const deletedRecipe = await Recipe.findByIdAndDelete(recipeId)
    console.log(`Deleted ${deletedRecipe.title}`)
    return res.redirect('/recipes')
  } catch (error) {
    console.log(error)
  }
})


export { router as recipesRouter }