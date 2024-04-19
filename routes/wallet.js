var express = require('express');
var {Web3} = require('web3');
var {nftAbi} = require('../library/nftAbi');

var web3 = new Web3(process.env.BSC_NODE);

var router = express.Router();

router.post('/nftHolder', async function(req, res, next) {
    var result = {
        result : false
    }

    if (!req.isAuthenticated()) {
      result.message = "Not logged in."
      return res.json(result);
    }

    if(!await common.validateNum(req.body.missionNum)) {
        console.log('validate error : missionNum');
        console.log(req.body.missionNum);
        result.message = 'validate error : missionNum';

        return res.json(result);
    }

    if(!await common.validateCategory(req.body.category)) {
        console.log('validate error : category');
        console.log(req.body.category);
        result.message = 'validate error : category';

        return res.json(result);
    }

    var con = undefined;

    try{
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

        qry = `
            SELECT
                *
            FROM
                mission 
            WHERE
                id = ?
                AND category = ?
                AND type = 'holder'
                AND \`repeat\` = 'N'
        `;
        params = [req.body.missionNum, req.body.category];
        var missionRst = await db.dbQuery(qry, params, con);

        if(missionRst.length == 0){
            console.log('incorrect mission number.');
            console.log(req.body.missionNum);
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
        params = [req.user.id, req.body.missionNum];
        var completeRst = await db.dbQuery(qry, params);

        if(completeRst.length > 0){
            result.message = 'You have already cleared it.';

            return res.json(result);
        }

        //mission check
        var contract = new web3.eth.Contract(nftAbi, missionRst[0].value);
        console.log(missionRst[0].value);

        var callRst = await contract.methods.balanceOf(req.user.address).call();
        console.log(req.user.address);

        var nftCnt = Number(callRst);
        console.log(nftCnt);

        if(nftCnt < 1){
            console.log('do not have ' + missionRst[0].category + ' NFT. count : ' + nftCnt);
            console.log('address : ' + req.user.address);
            result.message = missionRst[0] + ' NFT : ' + nftCnt;

            await db.transRollback(con);

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
        params = [req.user.id, req.body.missionNum];

        var insertRst = await db.dbQuery(qry, params, con);

        if(insertRst.affectedRows != 1 || insertRst.insertId < 1) {
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
        params = [missionRst[0].point, req.user.id];

        var updateRst = await db.dbQuery(qry, params, con);

        if(updateRst.affectedRows != 1) {
            result.message = 'update point error';
            throw new Error("update point error");
        }

        await db.transEnd(con);

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
