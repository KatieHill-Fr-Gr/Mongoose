import mongoose from "mongoose";

// * Define my schema

const recipeSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true 
    },
    contributor: { 
        type: mongoose.Schema.Types.ObjectId,
        required: true, 
        ref: "User"
    },
    cookingTime: { 
        type: String, 
        required: true 
    },
    ingredients: { 
        type: [String], 
        required: true 
    },
    method: { 
        type: String, 
        required: true  
    }
})

// * Define my model

const Recipe = mongoose.model('Recipe', recipeSchema)

// * Export it so that the controllers file can access it

export default Recipe