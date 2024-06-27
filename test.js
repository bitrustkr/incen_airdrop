const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
var {Web3} = require('web3');

var web3 = new Web3('https://opbnb-testnet-rpc.bnbchain.org');

dayjs.extend(utc);
const d = dayjs();

console.info(d.locale());

console.info(d.format('YYYY-MM-DD HH:mm:ss'));

console.info(d.utc().format('YYYY-MM-DD HH:mm:ss'));

console.info(d.utc().add(-1, 'day').format('YYYY-MM-DD HH:mm:ss'));

async function test(){
    var transaction = await web3.eth.getTransactionReceipt('0xd1757be6ab7c6bfb6973d92790eb039c0ad0e5ac16d22c629797da77803cddc6');
    var logData = transaction.logs[0].data;
    logData = logData.substring(2);
    var logDatas = [];

    while(logData != ''){
        logDatas.push(logData.substring(0,64));
        logData = logData.substring(64);
    }
    
    logDatas[1] = await web3.utils.hexToNumberString('0x' + logDatas[1]);
    logDatas[2] = await web3.utils.hexToNumberString('0x' + logDatas[2]);
    console.log(logDatas);

    var t = dayjs.unix(logDatas[2]);
    console.log(d.format('YYYY-MM-DD HH:mm:ss'));
    console.log(t.utc().format('YYYY-MM-DD HH:mm:ss'));
}

test();