const mongoose = require("mongoose")

//schemat miasta
const City = new  mongoose.Schema({
    name: String,
    mail: String
})

module.exports = mongoose.model("City",City)