var express = require('express');
var {Web3} = require('web3');
var Web3EthAbi = require('web3-eth-abi');
var Web3Utils = require('web3-utils');
var {nftAbi} = require('../library/nftAbi');
var dayjs = require('dayjs');
var utc = require('dayjs/plugin/utc');

dayjs.extend(utc);

var web3 = new Web3(process.env.OPBNB_NODE);

var router = express.Router();

// connect
router.post("/connect", async (req, res, next) => {
  var result = {
    result: false,
    message: ""
  };

  if (!req.isAuthenticated()) {
    result.message = "Please LogIn."
    return res.json(result);
  }

  if(!await common.validateAddr(req.body.address)) {
      console.log('validate error : address');
      console.log(req.body.address);
      result.message = 'validate error : address';

      return res.json(result);
  }

  if(!await common.validateHex(req.body.hash)) {
      console.log('validate error : hash');
      console.log(req.body.hash);
      result.message = 'validate error : hash';

      return res.json(result);
  }

  console.log('validation check success');

  var con = undefined;

  try{
                
    var address = req.body.address.toLowerCase();
    var bodyHash = req.body.hash.toLowerCase();
    var key = process.env.METAMASK_SIGH_KEY;
  
    var c = Web3EthAbi.encodeParameters(['bytes32', 'address', 'string'], 
    [Web3Utils.keccak256("Content(address account,string key)"), 
    address, key]);
  
    var d = Web3Utils.keccak256(c);
    d = d.toLowerCase();
  
    console.log('Make Hash');
  
    if(d !== bodyHash) {
      console.log('diffrent hash');
      console.log(d);
      console.log(bodyHash);
  
      done(null, false, { message: 'login failed.' });
    }
  
    console.log('hash check success');

      con = await db.transBegin();

      var qry = `
          SELECT
              id, address, point
          FROM
              users 
          WHERE
              id = ?
          FOR UPDATE
      `;
      var params = [req.user.id];
      var userRst = await db.dbQuery(qry, params, con);

      if(userRst.length == 0){
          console.log('not found user.');
          console.log(req.user.id);
          result.message = 'not found user.';

          await db.transRollback(con);

          return res.json(result);
      }

    if(userRst[0].address != null){
        console.log('Your Metamask address has already been registered.');
        console.log(req.user.id);
        console.log(userRst[0].address);

        return res.redirect('/?modal=error&message=' + encodeURIComponent('Your Metamask address has already been registered.'));
    }

      qry = `
          SELECT
              *
          FROM
              mission 
          WHERE
              category = 'connect'
              AND type = 'metamask'
              AND \`repeat\` = 'N'
      `;
      params = [];
      var missionRst = await db.dbQuery(qry, params, con);

      if(missionRst.length == 0){
          console.log('incorrect mission number.');
          result.message = 'incorrect mission number.';

          await db.transRollback(con);

          return res.json(result);
      }
      
      qry = `
          SELECT
              *
          FROM
              mission_complete
          WHERE
              user_id = ?
              AND mission_id = ?
      `;
      params = [req.user.id, missionRst[0].id];
      var completeRst = await db.dbQuery(qry, params);

      if(completeRst.length > 0){
          result.message = 'You have already cleared it.';

          return res.json(result);
      }

      qry = `
          INSERT INTO
              mission_complete
          (
              user_id, mission_id
          )
          VALUES
          (
              ?, ?
          )
      `;
      params = [req.user.id, missionRst[0].id];

      var insertRst = await db.dbQuery(qry, params, con);

      if(insertRst.affectedRows != 1 || insertRst.insertId < 1) {
          result.message = 'insert mission complete error';
          throw new Error("insert mission complete error");
      }

      qry = `
          UPDATE
              users
          SET
              point = point + ?,
              address = ?
          WHERE
              id = ?
      `;
      params = [missionRst[0].point, address, req.user.id];

      var updateRst = await db.dbQuery(qry, params, con);

      if(updateRst.affectedRows != 1) {
          result.message = 'update point error';
          throw new Error("update point error");
      }

      await db.transEnd(con);

      req.session.passport.user.point = req.session.passport.user.point + missionRst[0].point;
      req.session.passport.user.address = address;

      result = {
          result : true
      }

  } catch(error) {
      console.log(error);
      if(con != undefined){
          await db.transRollback(con);
      }
  }

  res.json(result);
});

// attendance
router.post("/attendance", async (req, res, next) => {
  var result = {
    result: false,
    message: ""
  };

  if (!req.isAuthenticated()) {
    result.message = "Please LogIn."
    return res.json(result);
  }

  if(!await common.validateHex(req.body.txid)) {
      console.log('validate error : txid');
      console.log(req.body.txid);
      result.message = 'validate error : txid';

      return res.json(result);
  }

  console.log('validation check success');

  var con = undefined;

  try{
    var transaction = await web3.eth.getTransactionReceipt(req.body.txid);

    if(!transaction.status){
        console.log('transaction status false');
        console.log(transaction);
        result.message = 'transaction status false';
  
        return res.json(result);
    }

    if(transaction.from != req.user.address || transaction.to != process.env.ATTENDANCE_CONTRACT){
        console.log('transaction validation false');
        console.log(req.user.address);
        console.log(process.env.ATTENDANCE_CONTRACT);
        console.log(transaction);
        result.message = 'transaction validation false';
  
        return res.json(result);
    }

    var topics = transaction.logs[0].topics;
    var logData = transaction.logs[0].data;
    logData = logData.substring(2);
    var logDatas = [];

    while(logData != ''){
        logDatas.push(logData.substring(0,64));
        logData = logData.substring(64);
    }

    if(logDatas.length < 2 || topics[0] != process.env.ATTENDANCE_LOG_TOPIC) {
        console.log('transaction validation false.');
        console.log(req.user.address);
        console.log(process.env.ATTENDANCE_CONTRACT);
        console.log(transaction);
        result.message = 'transaction validation false.';
  
        return res.json(result);
    }
    
    logDatas[0] = '0x' + logDatas[0].substring(24);
    logDatas[1] = await web3.utils.hexToNumberString('0x' + logDatas[1]);
    logDatas[2] = await web3.utils.hexToNumberString('0x' + logDatas[2]);

    var blockTime = dayjs.unix(logDatas[2]);
    var blockDate = blockTime.utc().format('YYYY-MM-DD');

    var currentTime = dayjs();
    var currentDate = currentTime.utc().format('YYYY-MM-DD');

    if(logDatas[0].toLowerCase() != req.user.address.toLowerCase() || logDatas[1] < process.env.ATTENDANCE_MINIMUM_VALUE ) {
        console.log('transaction validation false..');
        console.log(req.user.address);
        console.log(logDatas);
        result.message = 'transaction validation false..';
  
        return res.json(result);
    }

    if(blockDate != currentDate ) {
        console.log('transaction validation false...');
        console.log(req.user.address);
        console.log(blockDate);
        console.log(currentDate);
        result.message = 'transaction validation false...';
  
        return res.json(result);
    }

      con = await db.transBegin();

      var qry = `
          SELECT
              id, address, point
          FROM
              users 
          WHERE
              id = ?
          FOR UPDATE
      `;
      var params = [req.user.id];
      var userRst = await db.dbQuery(qry, params, con);

      if(userRst.length == 0){
          console.log('not found user.');
          console.log(req.user.id);
          result.message = 'not found user.';

          await db.transRollback(con);

          return res.json(result);
      }

    if(userRst[0].address == null){
        console.log('Your Metamask address has been not registered.<br/>Please connect to Metamask address first.');
        console.log(req.user.id);
        console.log(userRst[0].address);

        return res.redirect('/?modal=error&message=' + encodeURIComponent('Your Metamask address has been not registered.<br/>Please connect to Metamask address first.'));
    }

      qry = `
          SELECT
              *
          FROM
              mission 
          WHERE
              category = 'attendance'
              AND type = 'metamask'
              AND \`repeat\` = 'day'
      `;
      params = [];
      var missionRst = await db.dbQuery(qry, params, con);

      if(missionRst.length == 0){
          console.log('incorrect mission number.');
          result.message = 'incorrect mission number.';

          await db.transRollback(con);

          return res.json(result);
      }
      
      qry = `
          SELECT
              *
          FROM
              mission_complete
          WHERE
              user_id = ?
              AND mission_id = ?
              AND complete_dt > CURRENT_DATE
      `;
      params = [req.user.id, missionRst[0].id];
      var completeRst = await db.dbQuery(qry, params);

      if(completeRst.length > 0){
          result.message = 'You have already cleared it.';

          return res.json(result);
      }
      
      qry = `
          SELECT
              *
          FROM
              attendance
          WHERE
              user_id = ?
              AND attendance_date = CURRENT_DATE
      `;
      params = [req.user.id, missionRst[0].id];
      var completeRst = await db.dbQuery(qry, params);

      if(completeRst.length > 0){
          result.message = 'You have already cleared it.';

          return res.json(result);
      }

      // 연속 출석 확인
      qry = `
        SELECT 
            attendance_date, point 
        FROM attendance
        WHERE user_id = ?
        AND attendance_date = current_date() - INTERVAL 1 DAY
      `;
      params = [req.user.id];
      var attdClrRst = await db.dbQuery(qry, params);

      var lastPoint = 0;

      if(attdClrRst.length > 0 && attdClrRst[0].point != 7){
        lastPoint = attdClrRst[0].point;
      }

      qry = `
          INSERT INTO
              mission_complete
          (
              user_id, mission_id
          )
          VALUES
          (
              ?, ?
          )
      `;
      params = [req.user.id, missionRst[0].id];

      var insertRst = await db.dbQuery(qry, params, con);

      if(insertRst.affectedRows != 1 || insertRst.insertId < 1) {
          result.message = 'insert mission complete error';
          throw new Error("insert mission complete error");
      }

      qry = `
          INSERT INTO
              attendance
          (
              user_id, attendance_date, txid, point
          )
          VALUES
          (
              ?, ?, ?, ?
          )
      `;
      params = [req.user.id, currentDate, req.body.txid, lastPoint + 1];

      insertRst = await db.dbQuery(qry, params, con);

      if(insertRst.affectedRows != 1) {
          result.message = 'insert mission complete error';
          throw new Error("insert mission complete error");
      }

      qry = `
          UPDATE
              users
          SET
              point = point + ?
          WHERE
              id = ?
      `;
      params = [lastPoint + 1, req.user.id];

      var updateRst = await db.dbQuery(qry, params, con);

      if(updateRst.affectedRows != 1) {
          result.message = 'update point error';
          throw new Error("update point error");
      }

      await db.transEnd(con);

      console.log('last point ::: ' + lastPoint);

      req.session.passport.user.point = req.session.passport.user.point + lastPoint + 1;

      result = {
          result : true
      }

  } catch(error) {
      console.log(error);
      if(con != undefined){
          await db.transRollback(con);
      }
  }

  res.json(result);
});

module.exports = router;
