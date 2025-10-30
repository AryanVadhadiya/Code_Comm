const mongoose = require("mongoose");



//Schema
const roomdata=mongoose.Schema({
    roomid:{
        type:String
    },
    code:{
        type:String,
        default:""
    },
    username:[{
        type:String
    }]
})


//Collection
const rdata=mongoose.model("rdata",roomdata);

module.exports =  rdata;