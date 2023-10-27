const inventoryBaseUrl = 'http://139.59.60.119:9000'
const inventoryBaseUrlProd =  'https://inventory.fablocdn.com'
const inventoryBaseUrlLocal =  'http://localhost:9000'
const inventoryBaseUrlServer =  'http://172.22.0.1:8080'

exports.getProductDetailUrl = () => {
    return `${inventoryBaseUrlServer}/v1/menu/customization/reverse`
}