const express = require("express");
const router = express.Router();
const cartRoute = require("./route/cart.route")

router.use("/cart", cartRoute);

module.exports = router


