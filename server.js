/*------------------------------- SetUp -------------------------------*/

import express from 'express'
const app = express()
import mongoose from 'mongoose'
import morgan from 'morgan'
import 'dotenv/config'
import methodOverride from 'method-override'
import session from "express-session"
import MongoStore from "connect-mongo"

const port = process.env.PORT

import { defaultRouter } from "./controllers/default.js"
import { recipesRouter } from "./controllers/recipes.js"
import { authRouter } from "./controllers/auth.js"
import { usersRouter } from "./controllers/users.js"

import passUserToView from "./middleware/pass-user-to-view.js"
import userMessage from "./middleware/user-message.js"


/*------------------------------- Queries -------------------------------*/

// * Connect to my database

const getConnected = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI)
        console.log('Connection established')
        app.listen(port, () => console.log(`Ready to go on port ${port}`))
    } catch (error) {
        console.log(error)
    }
}

getConnected()


// * Middleware

app.use(express.urlencoded()) // Remember to call the middleware otherwise the program is left hanging
app.use(morgan('dev'))
app.use(methodOverride('_method'))
app.use(express.static("public")) // serves the static stylesheets
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI,
    })
  })
)
app.use(passUserToView);
app.use(userMessage);

// * Routes

app.use("/", defaultRouter);
app.use("/recipes", recipesRouter);
app.use("/auth", authRouter);
app.use('/users', usersRouter);


// * Error handlers


// 404 Not Found
app.use((req, res) => {
    res.status(404).render('404.ejs')
})

// 500 Error

app.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(500).send('An error occurred')
})