const express = require("express");
const { incrementAll, getStats } = require("./counter.controller");

const router = express.Router();

// POST /api/counter/increment
// Called each time the AI is queried — bumps all usage counters atomically
router.post("/increment", async (req, res) => {
    try {
        await incrementAll();
        res.status(200).json({ message: "Counters incremented." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// GET /api/counter/stats
// Returns current usage counts for all time windows
router.get("/stats", async (req, res) => {
    try {
        const stats = await getStats();
        res.status(200).json(stats);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

module.exports = router;