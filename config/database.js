const mongoose = require("mongoose");
require("dotenv").config();

exports.connect = () => {
    mongoose.connect(process.env.MONGODB_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
        .then(console.log("DB connected Succesfully"))
        .catch((error) => {
            console.log(error);
            console.log("DB connecting Issue");
            process.exit(1);
        })
}