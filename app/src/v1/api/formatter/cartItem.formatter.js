const { randomBytes } = require('node:crypto')

exports.formattedCartItem = (cartItemData, productData) => {
    const { productId, productName, productPrice, isVeg, lastVariationId, variationName, addOnName } = productData
    const quantityPrice = productPrice
    const { cartId, addOnIdList } = cartItemData
    const groupId = randomBytes(6).toString('hex');
    const quantity = 1
    const formattedData = { cartId, groupId, productId, lastVariationId, productName, variationName, productPrice, isVeg, addOnIdList, quantity, quantityPrice, addOnName }
    return formattedData
}

