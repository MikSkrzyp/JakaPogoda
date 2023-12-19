const mongoose = require("mongoose")

//schemat miasta
const City = new  mongoose.Schema({
    name: String,
    email: String
})

module.exports = mongoose.model("City",City)