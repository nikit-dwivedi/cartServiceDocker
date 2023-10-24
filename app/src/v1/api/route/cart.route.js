const express = require("express");
const router = express.Router();
const { initCart, addItemToCart, changeQuantityOfProduct, getMainCart, getSmallCart, changeCartOptions, getLastCart, getProductGroup } = require("../controller/cart.controller")

router.post("/init", initCart);
router.post("/add", addItemToCart);
router.post("/quantity", changeQuantityOfProduct);
router.post("/option",changeCartOptions)
router.get("/main/:cartId", getMainCart);
router.get("/small/:cartId",getSmallCart)
router.get("/:cartId/group/:productId",getProductGroup)
router.get('/last',getLastCart)


module.exports = router


