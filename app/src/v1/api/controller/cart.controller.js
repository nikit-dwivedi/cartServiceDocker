const { getProductDetail } = require("../helpers/product.helper")
const { initiateCart, addToSmallCart, checkProductForAdding, getMainCartData, changeQuantity, getAllGroupOfProduct, getSmallCartData, changeDropLocation, changeDeliveryTip, changeDiscount, addSmallCartToMainCart, updateCartPrice, removeSmallCartToMainCart } = require("../helpers/cart.helper")
const { badRequest, success, unknownError, unauthorized } = require("../helpers/response.helper")
const { parseJwt } = require("../middleware.js/jwt.middleware")

exports.initCart = async (req, res) => {
    try {
        const { productId, addOnIdList, lng, lat } = req.body
        if (!productId || !addOnIdList || !lng || !lat) {
            return badRequest(res, "please provide productId addOnIdList lng lat")
        }
        const token = parseJwt(req.headers.authorization)
        if (!token || !token.userId) {
            return unauthorized(res, "unauthorized")
            
        }
        const productData = await getProductDetail(productId, addOnIdList)
        if (!productData.status) {
            return badRequest(res, productData.message)
        }
        const cartData = await initiateCart(token.userId, productData.items, lng, lat);
        if (!cartData.status) {
            return badRequest(res, cartData.message)
        }
        let cartItemData = { cartId: cartData.data, addOnIdList }
        const addCartItem = await addToSmallCart(cartItemData, productData.items)
        if (!addCartItem.status) {
            return badRequest(res, addCartItem.message)
        }
        await addSmallCartToMainCart(addCartItem.data)
        await updateCartPrice(addCartItem.data, true)
        const cartProductDetail = await getAllGroupOfProduct(cartData.data, productData.items.productId)
        return success(res, "cart created", { cartId: cartData.data, ...cartProductDetail })
    } catch (error) {
        console.log(error.message);
        return unknownError(res, error.message)
    }
}

exports.addItemToCart = async (req, res) => {
    try {
        const { productId, addOnIdList, cartId } = req.body
        const { status, message, items: productData } = await getProductDetail(productId, addOnIdList)
        if (!status) {
            return res.send({ status, message })
        }
        let cartItemData = { cartId, addOnIdList }
        const checkData = await checkProductForAdding(cartItemData, productData)
        if (!checkData.status) {
            return badRequest(res, checkData.message)
        }
        if (checkData.data) {
            const { status, message, data } = await changeQuantity(cartId, checkData.data.groupId, true)
            await updateCartPrice(data, true)
            const cartProductDetail = await getAllGroupOfProduct(cartId, productData.productId)
            return status ? success(res, message, cartProductDetail) : badRequest(res, message)
        }
        const addedData = await addToSmallCart(cartItemData, productData)
        await addSmallCartToMainCart(addedData.data)
        await updateCartPrice(addedData.data, true)
        const cartProductDetail = await getAllGroupOfProduct(cartId, productData.productId)
        return addedData.status ? success(res, addedData.message, cartProductDetail) : badRequest(res, addedData.message)
    } catch (error) {
        console.log(error);
        return unknownError(res, error.message)
    }
}

exports.changeQuantityOfProduct = async (req, res) => {
    try {
        const { cartId, groupId, operation } = req.body
        const { status, message, data } = await changeQuantity(cartId, groupId, operation)
        if (!status) {
            return badRequest(res, message)
        }
        if (!operation && data.quantity == 1) {
            await removeSmallCartToMainCart(data)
        }
        await updateCartPrice(data, operation)
        const cartProductDetail = await getAllGroupOfProduct(cartId, data.productId)
        return success(res, message, cartProductDetail)
    } catch (error) {
        console.log(error);
        return unknownError(res, error.message)
    }
}

exports.changeCartOptions = async (req, res) => {
    try {
        const { cartId, lng, lat, deliveryTip, discount } = req.body
        let message = "cart updated"
        if (lng && lat) {
            let status = await changeDropLocation(cartId, lng, lat)
            if (!status) {
                return badRequest(res, "not serving in your area")
            }
        }
        if (deliveryTip != undefined) {
            let status = await changeDeliveryTip(cartId, deliveryTip)
            if (!status) {
                return badRequest(res, "Tip not valid")
            }

        }
        if (discount != undefined) {
            let status = await changeDiscount(cartId, discount)
            if (!status) {
                return badRequest(res, "discount not valid")
            }

        }
        return success(res, "cart updated")
    } catch (error) {
        console.log(error);
        return unknownError(res, error.message)
    }
}

exports.getMainCart = async (req, res) => {
    try {
        const { cartId } = req.params
        const { status, message, data } = await getMainCartData(cartId)
        return status ? success(res, message, data) : badRequest(res, message)
    } catch (error) {
        return unknownError(res, error.message)
    }
}


exports.getSmallCart = async (req, res) => {
    try {
        const { cartId } = req.params
        const { status, message, data } = await getSmallCartData(cartId)
        return status ? success(res, message, data) : badRequest(res, message)
    } catch (error) {
        return unknownError(res, error.message)
    }
}