require('dotenv').config();

// 로그 작성
exports.logMsg = async function (msg, logId = '', logPath = '') {
    // logPath 는 app.js 와 같은 경로를 기준으로 잡는다
    if (logPath == '') {
        console.log(logId + msg);
    } else {
        fs.appendFileSync(logPath, logId + msg + '\r\n', 'utf8');
    }
};

// required 검증
exports.validateReq = async function (val) {
    if (val != undefined && val != '') {
        return true;
    } else {
        return false;
    }
};

// 숫자 검증
exports.validateNum = async function (num) {
    var regex = /^[0-9|]+$/;

    return regex.test(num);
};

// 16진수 검증
exports.validateHex = async function (num) {
    var regex = /^0x[0-9a-fA-F]+$/;

    return regex.test(num);
};

// 주소 검증
exports.validateAddr = async function (addr) {
    var regex = /^0x[0-9a-fA-F]{40}$/;
    if (regex.test(addr)) {
        return true;
    } else {
        return false;
    }
};

// txid 검증
exports.validateTxid = async function (txid) {
    var regex = /^0x[0-9a-fA-F]{64}$/;
    if (regex.test(txid)) {
        return true;
    } else {
        return false;
    }
};

// ino 검증
exports.validateIno = async function (ino) {
    // toDo
    // ino 형식이 나오면 추가 필요함

    var regex = /^[a-z|A-Z|0-9|_]+$/;

    return regex.test(ino);
};

// uid 검증
exports.validateUid = async function (uid) {
    // toDo
    // uid 형식이 나오면 추가 필요함
    var regex = /^[a-z|A-Z|0-9|_|-]+$/;

    return regex.test(uid);
};

// Coupon 검증
exports.validateCoupon = async function (coupon) {
    // toDo
    // Coupon 형식이 나오면 추가 필요함
    var regex = /^[a-z|A-Z|0-9|_|-]+$/;

    return regex.test(coupon);
};

// name 검증
exports.validateName = async function (name) {
    var regex = /^[ㄱ-ㅎ|가-힣|a-z|A-Z|0-9|]+$/;

    return regex.test(name);
};

// category 검증
exports.validateCategory = async function (type) {
    var types = process.env.CATEGORYS;
    types = types.split(',');

    return types.includes(type);
};

// get category
exports.getCategory = async function (type) {
    var types = process.env.CATEGORYS;
    types = types.split(',');

    if(types.indexOf(type) == -1) return "ALL";
    else return types[types.indexOf(type)];
};

exports.usecTime = async function () {
    let rgMicrotime = microtime().split(' '),
        usec = rgMicrotime[0],
        sec = rgMicrotime[1];

    usec = usec.substr(2, 3);
    return Number(String(sec) + String(usec));
};

exports.microtime = async function (get_as_float) {
    //  discuss at: http://phpjs.org/functions/microtime/
    //	original by: Paulo Freitas
    //  example 1: timeStamp = microtime(true);
    //  example 1: timeStamp > 1000000000 && timeStamp < 2000000000
    //  returns 1: true
    const now = new Date().getTime() / 1000;
    const s = parseInt(now, 10);

    return get_as_float ? now : Math.round((now - s) * 1000) / 1000 + ' ' + s;
};

exports.base64_encode = async function (data) {
    // discuss at: http://phpjs.org/functions/base64_encode/
    // original by: Tyler Akins (http://rumkin.com)
    // improved by: Bayron Guevara
    // improved by: Thunder.m
    // improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // improved by: Rafał Kukawski (http://kukawski.pl)
    // bugfixed by: Pellentesque Malesuada
    // example 1: base64_encode('Kevin van Zonneveld');
    // returns 1: 'S2V2aW4gdmFuIFpvbm5ldmVsZA=='
    // example 2: base64_encode('a');
    // returns 2: 'YQ=='

    const b64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
    let o1,
        o2,
        o3,
        h1,
        h2,
        h3,
        h4,
        bits,
        i = 0,
        ac = 0,
        enc = '',
        tmp_arr = [];

    if (!data) {
        return data;
    }

    do {
        // pack three octets into four hexets
        o1 = data.charCodeAt(i++);
        o2 = data.charCodeAt(i++);
        o3 = data.charCodeAt(i++);

        bits = (o1 << 16) | (o2 << 8) | o3;

        h1 = (bits >> 18) & 0x3f;
        h2 = (bits >> 12) & 0x3f;
        h3 = (bits >> 6) & 0x3f;
        h4 = bits & 0x3f;

        // use hexets to index into b64, and append result to encoded string
        tmp_arr[ac++] = b64.charAt(h1) + b64.charAt(h2) + b64.charAt(h3) + b64.charAt(h4);
    } while (i < data.length);

    enc = tmp_arr.join('');

    const r = data.length % 3;

    return (r ? enc.slice(0, r - 3) : enc) + '==='.slice(r || 3);
};