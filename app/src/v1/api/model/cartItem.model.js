const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const cartItemSchema = new Schema({
    cartId: {
        type: String,
        required: true,
    },
    groupId: {
        type: String,
        required: true,
        unique: true
    },
    productId: {
        type: String,
        required: true,
    },
    lastVariationId: {
        type: String
    },
    productName: {
        type: String,
    },
    variationName: {
        type: String
    },
    productPrice: {
        type: Number
    },
    isVeg: {
        type: Boolean
    },
    quantityPrice: {
        type: Number,
    },
    quantity: {
        type: Number,
        default: 1
    },
    addOnName: {
        type: String
    },
    addOnIdList: [{
        type: String
    }]
}, {
    timestamps: true
})

const cartItemModel = mongoose.model("cartItem", cartItemSchema);
module.exports = cartItemModel