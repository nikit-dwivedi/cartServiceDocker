exports.parseJwt = (data) => {
    try {
        let token = data.slice(7);
        const decode = Buffer.from(token.split(".")[1], "base64");
        const toString = decode.toString();
        return JSON.parse(toString);
    } catch (e) {
        return null;
    }
}