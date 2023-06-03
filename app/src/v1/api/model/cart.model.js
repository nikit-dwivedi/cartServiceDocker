const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const cartSchema = new Schema({
    userId: {
        type: String,
        required: true,
    },
    cartId: {
        type: String,
        required: true,
        unique: true,
    },
    outletId: {
        type: String,
        required: true
    },
    outletName: {
        type: String,
    },
    productList: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'cartItem'
    }],
    totalAmount: {
        type: Number
    },
    payableAmount: {
        type: Number
    },
    tax: {
        type: Number
    },
    deliveryFee: {
        type: Number
    },
    deliveryTip: {
        type: Number
    },
    discountedAmount: {
        type: Number
    },
    isDiscounted: {
        type: Boolean,
        default: false
    },
    isDiscountActivated: {
        type: Boolean,
        default: false
    },
    discountDetails: {
        discountPercent: {
            type: Number,
            default: 0
        },
        isFlatDiscount: {
            type: Boolean,
            default: false
        },
        maxDiscount: {
            type: Number,
            default: 0
        },
        minAmount: {
            type: Number,
            default: 0
        }
    },
    distance: {
        type: String
    },
    pickLong: {
        type: String
    },
    pickLat: {
        type: String
    },
    dropLong: {
        type: String
    },
    dropLat: {
        type: String
    },
    totalQuantity: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
})

const cartModel = mongoose.model("cart", cartSchema);
module.exports = cartModel;