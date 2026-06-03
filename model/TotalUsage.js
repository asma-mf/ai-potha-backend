

const mongoose = require("mongoose");

const totalSchema = new mongoose.Schema({
    count: {
        type: Number,
        required: true,
        default: 0
    }
}, { timestamps: true });

module.exports = mongoose.model("TotalUsage", totalSchema);
