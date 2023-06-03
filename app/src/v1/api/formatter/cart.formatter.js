const { randomBytes } = require('node:crypto')

exports.cartFormatter = (userId, productData, long, lat) => {
    const { outletId, outletName, isDiscounted, discountDetails, outletLongitude, outletLatitude } = productData
    const cartId = randomBytes(6).toString('hex');
    const productList = []
    const totalAmount = 0
    const payableAmount = 0
    const tax = 0
    const discountedAmount = 0
    const deliveryTip = 0
    const isDiscountActivated = false
    const dropLong = long
    const dropLat = lat
    const pickLong = outletLongitude
    const pickLat = outletLatitude
    let rawDistance = distanceCalculator(dropLong, dropLat, pickLong, pickLat)
    const deliveryFee = getDeliveryCharge(rawDistance)
    let distance = `${rawDistance} Kms`
    const returnData = { userId, cartId, outletId, outletName, productList, totalAmount, payableAmount, tax, deliveryFee, dropLong, dropLat, pickLong, pickLat, isDiscountActivated, discountedAmount, deliveryTip, distance, isDiscounted, discountDetails }
    return returnData
}

exports.addToCartFormatter = (smallCartData, deliveryFee, deliveryTip, discountData) => {
    const { amount, quantity } = smallCartData
    //----------discount-charge
    let discountedAmount = getDiscountAmount(amount, discountData)
    //-----------tax-charge
    let tax = (amount * 5) / 100
    //-----------payable-amount
    const payableAmount = (amount + tax + deliveryFee + deliveryTip) - discountedAmount
    const returnData = { totalAmount: amount, payableAmount, tax, discountedAmount, totalQuantity: quantity }
    return returnData
}

exports.changeAddressFormatter = (dropLong, dropLat, pickLong, pickLat, oldFee, payableAmount) => {
    let rawDistance = distanceCalculator(dropLong, dropLat, pickLong, pickLat)
    if (rawDistance > 4.5) {
        throw new Error("not serving")
    }
    const deliveryFee = getDeliveryCharge(rawDistance)
    const distance = `${rawDistance} Kms`
    payableAmount = payableAmount - oldFee
    payableAmount = payableAmount + deliveryFee
    return { payableAmount, deliveryFee, dropLong, dropLat, distance }
}

exports.changeDeliveryTipFormatter = (deliveryTip, oldTip, payableAmount) => {
    payableAmount = payableAmount - oldTip
    payableAmount = payableAmount + deliveryTip
    return { payableAmount, deliveryTip }
}

exports.changeDiscountFormatter = (payableAmount, totalAmount, oldAmount, discountData, discount) => {
    let isDiscountActivated = discount
    if (!discount) {
        discountData = false
    }
    let discountedAmount = getDiscountAmount(totalAmount, discountData)
    payableAmount = payableAmount + oldAmount
    payableAmount = payableAmount - discountedAmount
    return { payableAmount, discountedAmount, isDiscountActivated }
}

function getDiscountAmount(totalAmount, discountData) {
    let discountedAmount = 0
    if (discountData) {
        if (totalAmount >= discountData.minAmount) {
            discountedAmount = (totalAmount * discountData.discountPercent) / 100
            if (!discountData.isFlatDiscount && discountedAmount > discountData.maxDiscount) {
                discountedAmount = discountData.maxDiscount
            }
        }
    }
    return discountedAmount
}

function getDeliveryCharge(distance) {
    let deliveryCharge = 25
    if (distance > 1.8) {
        if (distance <= 4) {
            deliveryCharge = distance * 10
        } else if (4 < distance <= 8) {
            let extraDistance = distance - 4
            deliveryCharge = (4 * 10) + (extraDistance * 11.5)
        } else {
            let extraDistance = distance - 8
            deliveryCharge = (4 * 10) + (4 * 11.5)(extraDistance * 12.5)
        }
    }
    return deliveryCharge
}

function distanceCalculator(lon1, lat1, lon2, lat2) {
    lon1 = lon1 * Math.PI / 180;
    lon2 = lon2 * Math.PI / 180;
    lat1 = lat1 * Math.PI / 180;
    lat2 = lat2 * Math.PI / 180;
    let dlon = lon2 - lon1;
    let dlat = lat2 - lat1;
    let a = Math.pow(Math.sin(dlat / 2), 2) + Math.cos(lat1) * Math.cos(lat2) * Math.pow(Math.sin(dlon / 2), 2);
    let c = 2 * Math.asin(Math.sqrt(a));
    let r = 6371;
    return parseFloat((c * r).toFixed(1));
}





