const { formattedProduct } = require("../formatter/productFormater")
const { get, post } = require("../service/axios.service")
const { getProductDetailUrl } = require("../service/url.service")

exports.getProductDetail = async (productId, addOnList) => {
    try {
        const url = getProductDetailUrl()
        const cartProduct = { productId, addOnList }
        const data = await post(url, cartProduct)
        if (!data) {
            return { status: false, message: "axios error", items: {} }
        }
        const { status, message, items } = data
        if (!status) {
            return { status, message, items }
        }
        const productData = formattedProduct(items)
        return { status, message, items: productData }
    } catch (error) {
        return { status: false, message: error.message, items: {} }
    }
}
