const { cartFormatter, addToCartFormatter, changeAddressFormatter, changeDeliveryTipFormatter, changeDiscountFormatter } = require("../formatter/cart.formatter");
const { formattedCartItem } = require("../formatter/cartItem.formatter");
const cartModel = require("../model/cart.model");
const cartItemModel = require("../model/cartItem.model");

// -----------------------------------------------------Cart-----------------------------------------------------

exports.initiateCart = async (userId, productData, long, lat) => {
    try {
        const formattedCart = cartFormatter(userId, productData, long, lat)
        const saveData = new cartModel(formattedCart)
        await saveData.save()
        return { status: true, message: "Cart created", data: saveData.cartId }
    } catch (error) {
        console.log("initiateCart error =>", error.message);
        return { status: false, message: error.message, data: {} }
    }
}

exports.addSmallCartToMainCart = async (smallCartData) => {
    try {
        const { cartId, _id } = smallCartData
        await cartModel.findOneAndUpdate({ cartId }, { $push: { productList: _id } }, { new: true })
        return { status: true, message: "cart Updated", data: {} }
    } catch (error) {
        console.log("addSmallCartToMainCart error =>", error.message);
        return { status: false, message: error.message, data: {} }
    }
}

exports.removeSmallCartToMainCart = async (smallCartData) => {
    try {
        const { cartId, _id } = smallCartData
        await cartModel.findOneAndUpdate({ cartId }, { $pull: { productList: _id } }, { new: true })
        return { status: true, message: "cart Updated", data: {} }
    } catch (error) {
        console.log("removeSmallCartToMainCart error =>", error.message);
        return { status: false, message: error.message, data: {} }
    }
}

exports.updateCartPrice = async (smallCartData, operation) => {
    try {
        const { cartId, productPrice, quantityPrice } = smallCartData
        let newAmount = operation?quantityPrice + productPrice: quantityPrice - productPrice
        if (operation) {
            newAmount = quantityPrice + productPrice
        } else {
            newAmount = quantityPrice - productPrice
        }
        const cartData = await cartModel.findOne({ cartId })
        let discountDetails = cartData.isDiscountActivated ? cartData.discountDetails : false
        const cartItemData = await cartItemModel.aggregate([{ $match: { cartId } }, { $group: { _id: cartId, amount: { $sum: "$quantityPrice" }, quantity: { $sum: "$quantity" } } }])
        if (!cartItemData[0]) {
            cartItemData.push({ amount: 0, quantity: 0 })
        }
        const changeableData = addToCartFormatter(cartItemData[0], cartData.deliveryFee, cartData.deliveryTip, discountDetails)
        await cartModel.findOneAndUpdate({ cartId }, changeableData)
        return true
    } catch (error) {
        console.log("updateCartPrice error =>", error.message);
        return false
    }
}

exports.changeDropLocation = async (cartId, long, lat) => {
    try {
        const cartData = await cartModel.findOne({ cartId })
        const changeableData = changeAddressFormatter(long, lat, cartData.pickLong, cartData.pickLat, cartData.deliveryFee, cartData.payableAmount)
        await cartModel.findOneAndUpdate({ cartId }, changeableData)
        return true
    } catch (error) {
        return false
    }
}

exports.changeDeliveryTip = async (cartId, deliveryTip) => {
    try {
        const cartData = await cartModel.findOne({ cartId })
        const changeableData = changeDeliveryTipFormatter(deliveryTip, cartData.deliveryTip, cartData.payableAmount)
        await cartModel.findOneAndUpdate({ cartId }, changeableData)
        return true
    } catch (error) {
        return false
    }
}

exports.changeDiscount = async (cartId, discount) => {
    try {
        const cartData = await cartModel.findOne({ cartId })
        const changeableData = changeDiscountFormatter(cartData.payableAmount, cartData.totalAmount, cartData.discountedAmount, cartData.discountDetails, discount)
        await cartModel.findOneAndUpdate({ cartId }, changeableData)
        return true
    } catch (error) {
        console.log(error);
        return false
    }
}

exports.getMainCartData = async (cartId) => {
    try {
        const cartData = await cartModel.findOne({ cartId }).populate({ path: "productList", select: "-_id -cartId -lastVariationId -createdAt -updatedAt -__v" }).select("-_id -createdAt -dropLong -dropLat -pickLong -pickLat -updatedAt -__v")
        return cartData ? { status: true, message: "Cart detail", data: cartData } : { status: false, message: "Cart not found", data: {} }
    } catch (error) {
        return { status: false, message: error.message, data: {} }
    }
}

// -------------------------------------------------Cart-Product-------------------------------------------------

exports.checkProductForAdding = async (cartItemData, productData) => {
    try {
        const { productId, lastVariationId, outletId } = productData
        const { cartId, addOnIdList } = cartItemData
        const outletCheck = await cartModel.findOne({ cartId })
        if (outletCheck.outletId !== outletId) {
            return { status: false, message: "Order from multiple outlet is not allowed", data: {} }
        }
        let query = { cartId, productId, lastVariationId, addOnIdList: { $size: addOnIdList.length } }
        if (addOnIdList[0]) {
            query = { cartId, productId, lastVariationId, $and: [{ addOnIdList: { $size: addOnIdList.length } }, { addOnIdList: { $all: addOnIdList } }] }
        }
        const productCheck = await cartItemModel.findOne(query)
        return { status: true, message: "product added", data: productCheck }
    } catch (error) {
        console.log("checkProductForAdding error =>", error.message);
        return { status: false, message: error.message, data: {} }
    }
}

exports.addToSmallCart = async (cartItemData, productData) => {
    try {
        const formattedProduct = formattedCartItem(cartItemData, productData)
        const saveData = new cartItemModel(formattedProduct)
        await saveData.save()
        return { status: true, message: "cart Updated", data: saveData }
    } catch (error) {
        console.log("addToSmallCart error =>", error.message);
        return { status: false, message: error.message, data: {} }
    }
}

exports.changeQuantity = async (cartId, groupId, process) => {
    try {
        const smallCartData = await cartItemModel.findOne({ cartId, groupId });
        if (!smallCartData) {
            return { status: false, message: "product not found", data: {} }
        }
        let quantity = process ? smallCartData.quantity + 1 : smallCartData.quantity - 1
        let quantityPrice = smallCartData.productPrice * quantity
        if (quantity == 0) {
            await cartItemModel.findOneAndDelete({ groupId })
            return { status: true, message: "product updated", data: smallCartData }
        }
        await cartItemModel.findOneAndUpdate({ groupId }, { quantity, quantityPrice })
        return { status: true, message: "product updated", data: smallCartData }
    } catch (error) {
        console.log("changeQuantity error =>", error.message);
        return { status: false, message: error.message, data: {} }
    }
}

exports.getAllGroupOfProduct = async (cartId, productId) => {
    try {
        const groupList = await cartItemModel.aggregate([
            {
                $match: {
                    productId,
                    cartId
                }
            },
            {
                $group: {
                    _id: "$productId",
                    quantity: { "$sum": "$$ROOT.quantity" },
                    productList: { "$push": "$$ROOT" }
                }
            },
            {
                $replaceRoot: {
                    newRoot: {
                        $arrayToObject: [
                            [{ k: "productId", v: "$_id" }, { k: "quantity", v: "$quantity" }, { k: "productList", v: "$productList" }]
                        ]
                    }
                }
            },
            {
                $project: {
                    productId: 1,
                    quantity: 1,
                    productList: {
                        $map: {
                            input: "$productList",
                            as: "doc",
                            in: {
                                groupId: "$$doc.groupId",
                                productName: "$$doc.productName",
                                variationName: "$$doc.variationName",
                                addOnName: "$$doc.addOnName",
                                productPrice: "$$doc.productPrice",
                                quantity: "$$doc.quantity",
                                quantityPrice: "$$doc.quantityPrice",
                            }
                        }
                    }
                }
            }
        ])
        const cartData = await cartModel.findOne({ cartId }).select("-_id cartId outletId outletName totalAmount totalQuantity")
        let productData = groupList[0]
        return groupList[0] ? { ...cartData._doc, ...productData } : { ...cartData._doc, productId, quantity: 0, productList: [] }
    } catch (error) {
        console.log(error);
        return {}
    }
}

exports.getSmallCartData = async (cartId) => {
    try {
        const groupList = await cartItemModel.aggregate([
            {
                $match: {
                    cartId
                }
            },
            {
                $group: {
                    _id: "$productId",
                    quantity: { "$sum": "$$ROOT.quantity" },
                    productList: { "$push": "$$ROOT" }
                }
            },
            {
                $replaceRoot: {
                    newRoot: {
                        $arrayToObject: [
                            [{ k: "productId", v: "$_id" }, { k: "quantity", v: "$quantity" }, { k: "productList", v: "$productList" }]
                        ]
                    }
                }
            },
            {
                $project: {
                    productId: 1,
                    quantity: 1,
                    totalQuantity: "",
                    totalQuantity: {
                        $sum: {
                            $map: {
                                input: "$productList",
                                as: "doc",
                                in: "$$doc.quantity"
                            }
                        }
                    },
                    productList: {
                        $map: {
                            input: "$productList",
                            as: "doc",
                            in: {
                                groupId: "$$doc.groupId",
                                productName: "$$doc.productName",
                                variationName: "$$doc.variationName",
                                addOnName: "$$doc.addOnName",
                                productPrice: "$$doc.productPrice",
                                quantity: "$$doc.quantity",
                                quantityPrice: "$$doc.quantityPrice",
                            }
                        },
                    }
                }
            }
        ])
        const cartData = await cartModel.findOne({ cartId }).select("-_id outletId outletName totalAmount").populate({
            path: 'productList',
            select: 'quantity',
            model: 'cartItem'
        })
        let sum = cartData.productList.reduce((acc, item) => acc + item.quantity, 0)
        cartData._doc.totalQuantity = sum
        return cartData ? { status: true, message: "Cart detail", data: { ...cartData._doc, productList: groupList } } : { status: false, message: "Cart not found", data: {} }
    } catch (error) {
        return { status: false, message: error.message, data: {} }
    }
}