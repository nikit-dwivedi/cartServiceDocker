const { randomBytes } = require('node:crypto')

exports.formattedProduct = (productData) => {
    const { outletId, outletName, productId, productName, productPrice, isVeg, hasCustomization, addOnName, addOnPrice, hasAddOn, isDiscounted, discountDetails, outletLongitude, outletLatitude } = productData
    let variationName = ""
    let lastVariationId = ""
    let returnData = { outletId, outletName, productId, productName, productPrice, isVeg, addOnName, isDiscounted, discountDetails, outletLongitude, outletLatitude, variationName, lastVariationId }
    if (hasCustomization) {
        let variationData = this.filterVariations(productData.variationDetail)
        returnData.productPrice = variationData.variantPrice
        returnData.lastVariationId = variationData.variantId
        returnData.variationName = variationData.variantName
    }
    if (hasAddOn) {
        returnData.productPrice += addOnPrice
    }
    return returnData
}

exports.filterVariations = (variationDetail, previousName) => {
    let { variantId, variantName, variantPrice, hasCustomization } = variationDetail
    if (previousName) {
        variantName = previousName + ", " + variantName
    }
    if (hasCustomization) {
        const completeData = this.filterVariations(variationDetail.variationDetail, variantName)
        variantId = completeData.variantId
        variantName = completeData.variantName
        variantPrice = completeData.variantPrice
    }
    let returnData = { variantId, variantName, variantPrice }
    console.log(returnData);
    return returnData
}

