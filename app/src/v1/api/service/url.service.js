const inventoryBaseUrl = 'http://139.59.60.119:9000'
const inventoryBaseUrlProd =  'https://inventory.fablocdn.com'
exports.getProductDetailUrl = () => {
    return `${inventoryBaseUrlProd}/v1/menu/customization/reverse`
}