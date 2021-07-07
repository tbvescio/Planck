function base10_to_base64(num) {
    var order = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_-";
    var base = order.length;
    var str = "", r;
    while (num) {
        r = num % base
        num -= r;
        num /= base;
        str = order.charAt(r) + str;
    }
    return str;
}


function base64_to_base10(str) {
    var order = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_-";
    var base = order.length;
    var num = 0, r;
    while (str.length) {
        r = order.indexOf(str.charAt(0));
        str = str.substr(1);
        num *= base;
        num += r;
    }
    return num;
}

module.exports = { base10_to_base64, base64_to_base10 };