import express from "express"
const router = express.Router()

import User from "../models/user.js"

// Home page
router.get('/', async (req, res, next) => {
    try {
        return res.render('home.ejs')
    } catch (error) {
        console.log(error)
        next(error)
    }
})

export { router as defaultRouter }