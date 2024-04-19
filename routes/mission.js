var express = require('express');
var router = express.Router();

/* GET Mission list. */
router.get('/missionList', async function(req, res, next) {
    var result = {
        result : false
    }

    var isLogin = false;

    if (!req.isAuthenticated()) {
        isLogin = false;
    }else{
        isLogin = true;
    }

    if(!await common.validateCategory(req.query.category)) {
        console.log('validate error : category');
        console.log(req.query.category);
        result.message = 'validate error : category';

        return res.json(result);
    }

    try{

        var cate = await common.getCategory(req.query.category);
        var categoryWQry = "";
        var categoryAQry = "";

        if(cate != "ALL") {
            categoryWQry = " WHERE category = '" + cate + "'";
            categoryAQry = " AND category = '" + cate + "'";
        }
        var qry = `
            SELECT
                id, title, point, category, \`type\`, \`repeat\`, link, null as rewardLink, \`order\`
            FROM mission ` + categoryWQry + `
            ORDER BY \`order\` ASC
        `;
        var params = [];
        var missionRst = await db.dbQuery(qry, params);
        var unclear = missionRst;
        var attendanceCnt = 0;

        var clearRst = [];

        if(isLogin){
            qry = `
                SELECT COUNT(*) as cnt 
                FROM mission_complete 
                WHERE 
                    mission_id = (
                        SELECT id 
                        FROM mission 
                        WHERE \`type\` = 'attendance'
                    )
                    AND user_id = ?
            `;
            params = [req.user.id];
            var cntRst = await db.dbQuery(qry, params);
            attendanceCnt = cntRst[0].cnt;

            var isMaxAttendance = false;
            if(attendanceCnt > 29) isMaxAttendance = true;

            qry = `
                SELECT
                    A.id
                FROM
                    mission A
                    JOIN
                    mission_complete B
                    ON A.id = B.mission_id
                WHERE
                    B.user_id = ?
                    AND A.\`repeat\` = 'N' ` + categoryAQry + `
                ORDER BY A.\`order\` ASC
            `;
            params = [req.user.id];
            var noRepeatClrRst = await db.dbQuery(qry, params);

            for(var i = unclear.length - 1; i >= 0; i--){
                var temp = unclear[i];
                for(var j = 0; j < noRepeatClrRst.length; j++){
                    if(temp.id == noRepeatClrRst[j].id){
                        unclear.splice(i, 1);
                    }
                }
            }

            qry = `
                SELECT
                    A.id
                FROM
                    mission A
                    JOIN
                    mission_complete B
                    ON A.id = B.mission_id
                WHERE
                    B.user_id = ?
                    AND A.\`repeat\` <> 'N'
                    AND B.complete_dt > CURRENT_DATE ` + categoryAQry + `
                ORDER BY A.\`order\` ASC
            `;
            params = [req.user.id];
            var repeatClrRst = await db.dbQuery(qry, params);

            for(var i = unclear.length - 1; i >= 0; i--){
                var temp = unclear[i];
                for(var j = 0; j < repeatClrRst.length; j++){
                    if(temp.id == repeatClrRst[j].id){
                        unclear.splice(i, 1);
                    }else if(isMaxAttendance){
                        // 출석 체크 max
                        unclear.splice(i, 1);
                    }
                }
            }

            qry = `
                SELECT
                    A.id, A.title, A.point, A.category, A.\`type\`, A.\`repeat\`, A.link, B.rewardLink as rewardLink, DATE_FORMAT(B.complete_dt, '%Y-%m-%d') as complete_date, A.\`order\`
                FROM
                    mission A
                    JOIN
                    mission_complete B
                    ON A.id = B.mission_id
                WHERE
                    B.user_id = ? ` + categoryAQry + `
                ORDER BY A.\`order\` ASC
            `;
            params = [req.user.id];
            clearRst = await db.dbQuery(qry, params);
        }

        

        result = {
            result : true,
            unclear : unclear,
            clear : clearRst,
            attendanceCnt : attendanceCnt
        }
    } catch(error){
        console.log(error);
    }

    res.json(result);
});

router.post('/repeatComplete', async function(req, res, next) {
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

    var con = undefined;

    try{
        var qry = `
            SELECT
                *
            FROM
                mission 
            WHERE
                id = ?
                AND \`type\` = 'attendance'
                AND \`repeat\` <> 'N'
        `;
        var params = [req.body.missionNum];
        var missionRst = await db.dbQuery(qry, params);

        if(missionRst.length == 0){
            console.log('incorrect mission number.');
            console.log(req.body.missionNum);
            result.message = 'incorrect mission number.';

            return res.json(result);
        }

        if(missionRst[0].type != 'attendance'){
            console.log('incorrect attendance mission.');
            console.log(req.body.missionNum);
            console.log(missionRst[0].type);
            result.message = 'incorrect attendance mission.';

            return res.json(result);
        }
        
        qry = `
            SELECT COUNT(*) as cnt 
            FROM mission_complete 
            WHERE 
                mission_id = (
                    SELECT id 
                    FROM mission 
                    WHERE \`type\` = 'attendance'
                )
                AND user_id = ?
        `;
        params = [req.user.id];
        var cntRst = await db.dbQuery(qry, params);
        var attendanceCnt = cntRst[0].cnt;

        console.log('attendanceCnt : ' + attendanceCnt);
        if(attendanceCnt > 29) {
            //출석 최대 일수 초과
            result.message = 'You have already cleared it.';

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
        params = [req.user.id, req.body.missionNum];
        var completeRst = await db.dbQuery(qry, params);

        if(completeRst.length > 0){
            result.message = 'You have already cleared it.';

            return res.json(result);
        }
        
        var missionPoint = missionRst[0].point;

        if(attendanceCnt == 26 || attendanceCnt == 29){
            // 27,30일은 점수 10점
            missionPoint = 10;
        }else if(attendanceCnt % 3 == 2){
            // 3의 배수 일때 5점 => 오늘을 제외한 클리어한 날짜라 몫이 2인것
            missionPoint = 5;
        }
        
        con = await db.transBegin();
        qry = `
            SELECT
                id, point
            FROM 
                users
            WHERE
                id = ?
            FOR UPDATE
        `;
        params = [req.user.id];
        var userRst = await db.dbQuery(qry, params, con);

        console.log('Before Point : ' + userRst[0].point);
        console.log('Mission Point : ' + missionPoint);

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
        params = [missionPoint, req.user.id];

        var updateRst = await db.dbQuery(qry, params, con);

        if(updateRst.affectedRows != 1) {
            result.message = 'update point error';
            throw new Error("update point error");
        }

        qry = `
            SELECT
                id, point
            FROM 
                users
            WHERE
                id = ?
        `;
        params = [req.user.id];
        userRst = await db.dbQuery(qry, params, con);

        console.log('After Point : ' + userRst[0].point);

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

router.post('/homepage', async function(req, res, next) {
    var result = {
        result : false
    }

    if (typeof req.user == 'undefined') {
      result.message = "Not logged in."
      return res.json(result);
    }

    if(!await common.validateNum(req.body.missionNum)) {
        console.log('validate error : missionNum');
        console.log(req.body.missionNum);
        result.message = 'validate error : missionNum';
        return res.json(result);
    }

    var con = undefined;

    try{
        var qry = `
            SELECT
                *
            FROM
                mission 
            WHERE
                id = ?
                AND \`type\` = 'homepage'
                AND \`repeat\` = 'N'
        `;
        var params = [req.body.missionNum];
        var missionRst = await db.dbQuery(qry, params);

        if(missionRst.length == 0){
            console.log('incorrect mission number.');
            console.log(req.body.missionNum);
            result.message = 'incorrect mission number.';

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
        
        
        con = await db.transBegin();
        qry = `
            SELECT
                id, point
            FROM 
                users
            WHERE
                id = ?
            FOR UPDATE
        `;
        params = [req.user.id];
        var userRst = await db.dbQuery(qry, params, con);

        console.log('Before Point : ' + userRst[0].point);
        console.log('Mission Point : ' + missionRst[0].point);

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

        qry = `
            SELECT
                id, point
            FROM 
                users
            WHERE
                id = ?
        `;
        params = [req.user.id];
        userRst = await db.dbQuery(qry, params, con);

        console.log('After Point : ' + userRst[0].point);

        await db.transEnd(con);

        result = {
            result : true,
            url : missionRst[0].value
        }

    } catch(error) {
        console.log(error);
        if(con != undefined){
            await db.transRollback(con);
        }
    }

    res.json(result);
});

router.post('/coupon', async function(req, res, next) {
    var result = {
        result : false
    }

    if (typeof req.user == 'undefined') {
      result.message = "Not logged in."
      return res.json(result);
    }

    if(!await common.validateNum(req.body.missionNum)) {
        console.log('validate error : missionNum');
        console.log(req.body.missionNum);
        result.message = 'validate error : missionNum';
        return res.json(result);
    }

    if(!await common.validateCoupon(req.body.coupon)) {
        console.log('validate error : coupon');
        console.log(req.body.coupon);
        result.message = 'validate error : coupon';
        return res.json(result);
    }

    var con = undefined;

    try{
        var qry = `
            SELECT
                *
            FROM
                mission 
            WHERE
                id = ?
                AND \`type\` = 'coupon'
                AND \`repeat\` = 'N'
        `;
        var params = [req.body.missionNum];
        var missionRst = await db.dbQuery(qry, params);

        if(missionRst.length == 0){
            console.log('incorrect mission number.');
            console.log(req.body.missionNum);
            result.message = 'incorrect mission number.';

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
        
        qry = `
            SELECT
                *
            FROM
                coupon
            WHERE
                code = ?
                AND mission_id = ?
                AND useYn = 'N'
            FOR UPDATE
        `;
        params = [req.body.coupon, req.body.missionNum];
        var couponRst = await db.dbQuery(qry, params);

        if(couponRst.length == 0){
            result.message = 'Invalid Coupon Code.';

            return res.json(result);
        }
        console.log('couponRst : ' + JSON.stringify(couponRst[0]));
        
        
        con = await db.transBegin();
        qry = `
            SELECT
                id, point
            FROM 
                users
            WHERE
                id = ?
            FOR UPDATE
        `;
        params = [req.user.id];
        var userRst = await db.dbQuery(qry, params, con);

        console.log('Before Point : ' + userRst[0].point);
        console.log('Mission Point : ' + missionRst[0].point);

        qry = `
            INSERT INTO
                mission_complete
            (
                user_id, mission_id, rewardLink
            )
            VALUES
            (
                ?, ?, ?
            )
        `;
        params = [req.user.id, req.body.missionNum, couponRst[0].rewardLink];

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

        qry = `
            UPDATE
                coupon
            SET
                useUser = ?,
                useYn = 'Y'
            WHERE
                id = ?
                AND code = ?
                AND mission_id = ?
        `;
        params = [req.user.id, couponRst[0].id, req.body.coupon, req.body.missionNum];

        updateRst = await db.dbQuery(qry, params, con);

        if(updateRst.affectedRows != 1) {
            result.message = 'update coupon error';
            throw new Error("update coupon error");
        }

        qry = `
            SELECT
                id, point
            FROM 
                users
            WHERE
                id = ?
        `;
        params = [req.user.id];
        userRst = await db.dbQuery(qry, params, con);

        console.log('After Point : ' + userRst[0].point);

        await db.transEnd(con);

        result = {
            result : true,
            link : couponRst[0].rewardLink
        }

    } catch(error) {
        console.log(error);
        if(con != undefined){
            await db.transRollback(con);
        }
    }

    res.json(result);
});

router.post('/allClear', async function(req, res, next) {
    var result = {
        result : false
    }

    if (typeof req.user == 'undefined') {
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
        var qry = `
            SELECT
                *
            FROM
                mission 
            WHERE
                id = ?
                AND \`category\` = ?
                AND \`type\` = 'clear'
                AND \`repeat\` = 'N'
        `;
        var params = [req.body.missionNum, req.body.category];
        var missionRst = await db.dbQuery(qry, params);

        if(missionRst.length == 0){
            console.log('incorrect mission number.');
            console.log(req.body.missionNum);
            result.message = 'incorrect mission number.';

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

        var checkId = missionRst[0].value;
        checkId = checkId.split(',');
        console.log('checkId : ' + JSON.stringify(checkId));
        
        qry = `
            SELECT
                mission_id
            FROM
                mission_complete
            WHERE
                user_id = ?
                AND mission_id in (?)
            GROUP BY mission_id
        `;
        params = [req.user.id, checkId];
        var clearRst = await db.dbQuery(qry, params);
        console.log('clearRst : ' + JSON.stringify(clearRst));
        
        for(var i = 0; i < clearRst.length; i++){
            for(var j = 0; j < checkId.length; j++){
                console.log('checkId[j] : ' + checkId[j]);
                console.log('clearRst[i].mission_id : ' + clearRst[i].mission_id);
                if(checkId[j] == clearRst[i].mission_id){
                    console.log('!!!!!');
                    checkId.splice(j, 1);
                    break;
                }
            }
        }
        console.log('checkId : ' + JSON.stringify(checkId));

        if(checkId.length > 0){
            result.message = "You didn't clear the mission.";

            return res.json(result);
        }
        
        con = await db.transBegin();
        qry = `
            SELECT
                id, point
            FROM 
                users
            WHERE
                id = ?
            FOR UPDATE
        `;
        params = [req.user.id];
        var userRst = await db.dbQuery(qry, params, con);

        console.log('Before Point : ' + userRst[0].point);
        console.log('Mission Point : ' + missionRst[0].point);

        qry = `
            INSERT INTO
                mission_complete
            (
                user_id, mission_id, rewardLink
            )
            VALUES
            (
                ?, ?, ?
            )
        `;
        params = [req.user.id, req.body.missionNum, missionRst[0].rewardLink];

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

        qry = `
            SELECT
                id, point
            FROM 
                users
            WHERE
                id = ?
        `;
        params = [req.user.id];
        userRst = await db.dbQuery(qry, params, con);

        console.log('After Point : ' + userRst[0].point);

        await db.transEnd(con);

        result = {
            result : true,
            link : missionRst[0].rewardLink
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
