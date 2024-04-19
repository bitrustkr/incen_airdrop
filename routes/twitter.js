var express = require('express');
var router = express.Router();
var axios = require('axios');

// twitter login 화면
router.get(
  "/oauth",
  async function(req, res, next){
    var url = "/";
    if (typeof req.user == 'undefined' || !req.user.id) {
      return res.redirect('/?modal=error&message=' + encodeURIComponent('Please LogIn'));
    }

    console.log('session id : ' + req.user.id);

    try{
        var qry = `
          SELECT
              provider, point, address, twitter_id
          FROM users
          WHERE
              id = ?
        `;
        var params = [req.user.id];
      
        var userRst = await db.dbQuery(qry, params);

        if(userRst.length == 0){
            console.log('not found user.');
            console.log(req.user.id);

            return res.redirect('/?modal=error&message=' + encodeURIComponent('not found user.'));
        }

        if(userRst[0].twitter_id != null){
            console.log('Your twitter id has already been registered.');
            console.log(req.user.id);
            console.log(userRst[0].twitter_id);

            return res.redirect('/?modal=error&message=' + encodeURIComponent('Your twitter id has already been registered.'));
        }

        url = 'https://twitter.com/i/oauth2/authorize';
        url += '?client_id=' + process.env.TWITTER_CLIENT_ID
        url += '&redirect_uri=' + encodeURIComponent(process.env.TWITTER_SIGNUP_CALLBACK_URL)
        url += '&response_type=code'
        url += '&scope=' + encodeURIComponent("users.read tweet.read")
        url += `&state=3kds_twitter&code_challenge=${process.env.TWITTER_CODE_CHALLENGER}&code_challenge_method=plain`
    } catch(error){
        console.log(error);
    }
    res.redirect(url);
  }
);

// twitter 좋아요 화면
router.get(
  "/like",
  async function(req, res, next){
    var url = "/";
    if (typeof req.user == 'undefined' || !req.user.id) {
      return res.redirect('/?modal=error&message=' + encodeURIComponent('Please LogIn'));
    }

    console.log('session id : ' + req.user.id);

    if(!await common.validateNum(req.query.missionNum)) {
        console.log('validate error : missionNum');
        console.log(req.query.missionNum);

        return res.redirect('/?modal=error&message=' + encodeURIComponent('validate error : missionNum.'));
    }

    try{
        var qry = `
          SELECT
              provider, point, address, twitter_id
          FROM users
          WHERE
              id = ?
        `;
        var params = [req.user.id];
      
        var userRst = await db.dbQuery(qry, params);

        if(userRst.length == 0){
            console.log('not found user.');
            console.log(req.user.id);

            return res.redirect('/?modal=error&message=' + encodeURIComponent('not found user.'));
        }

        if(userRst[0].twitter_id == null){
            console.log('Your twitter id has been not registered.<br/>Please connect to Twitter first.');
            console.log(req.user.id);
            console.log(userRst[0].twitter_id);

            return res.redirect('/?modal=error&message=' + encodeURIComponent('Your twitter id has been not registered.<br/>Please connect to Twitter first.'));
        }

        qry = `
            SELECT
                *
            FROM mission
            WHERE
                id = ?
                AND type = 'twitter'
                AND link = '/twitter/like'
        `;
        var params = [req.query.missionNum];
      
        var missionRst = await db.dbQuery(qry, params);

        if(missionRst.length == 0){
            console.log('not found mission.');

            await db.transRollback(con);

            return res.redirect('/?modal=error&message=' + encodeURIComponent('not found mission.'));
        }

        qry = `
            SELECT
                *
            FROM mission_complete
            WHERE
                user_id = ?
                AND mission_id = ?
        `;
        var params = [req.user.id, missionRst[0].id];
      
        var completeRst = await db.dbQuery(qry, params);

        if(completeRst.length > 0){
            console.log('already complete mission.');

            await db.transRollback(con);

            return res.redirect('/?modal=error&message=' + encodeURIComponent('already complete mission.'));
        }

        url = 'https://twitter.com/i/oauth2/authorize';
        url += '?client_id=' + process.env.TWITTER_CLIENT_ID
        url += '&redirect_uri=' + encodeURIComponent(process.env.TWITTER_LIKE_CALLBACK_URL)
        url += '&response_type=code'
        url += '&scope=' + encodeURIComponent("users.read tweet.read like.write")
        url += `&state=mission_${missionRst[0].id}&code_challenge=${process.env.TWITTER_CODE_CHALLENGER}&code_challenge_method=plain`
    } catch(error){
        console.log(error);
    }
    res.redirect(url);
  }
);

// twitter retweet 화면
router.get(
  "/retweet",
  async function(req, res, next){
    var url = "/";
    if (typeof req.user == 'undefined' || !req.user.id) {
      return res.redirect('/?modal=error&message=' + encodeURIComponent('Please LogIn'));
    }

    console.log('session id : ' + req.user.id);

    if(!await common.validateNum(req.query.missionNum)) {
        console.log('validate error : missionNum');
        console.log(req.query.missionNum);

        return res.redirect('/?modal=error&message=' + encodeURIComponent('validate error : missionNum.'));
    }

    try{
        var qry = `
          SELECT
              provider, point, address, twitter_id
          FROM users
          WHERE
              id = ?
        `;
        var params = [req.user.id];
      
        var userRst = await db.dbQuery(qry, params);

        if(userRst.length == 0){
            console.log('not found user.');
            console.log(req.user.id);

            return res.redirect('/?modal=error&message=' + encodeURIComponent('not found user.'));
        }

        if(userRst[0].twitter_id == null){
            console.log('Your twitter id has been not registered.<br/>Please connect to Twitter first.');
            console.log(req.user.id);
            console.log(userRst[0].twitter_id);

            return res.redirect('/?modal=error&message=' + encodeURIComponent('Your twitter id has been not registered.<br/>Please connect to Twitter first.'));
        }

        qry = `
            SELECT
                *
            FROM mission
            WHERE
                id = ?
                AND type = 'twitter'
                AND link = '/twitter/retweet'
        `;
        var params = [req.query.missionNum];
      
        var missionRst = await db.dbQuery(qry, params);

        if(missionRst.length == 0){
            console.log('not found mission.');

            await db.transRollback(con);

            return res.redirect('/?modal=error&message=' + encodeURIComponent('not found mission.'));
        }

        qry = `
            SELECT
                *
            FROM mission_complete
            WHERE
                user_id = ?
                AND mission_id = ?
        `;
        var params = [req.user.id, missionRst[0].id];
      
        var completeRst = await db.dbQuery(qry, params);

        if(completeRst.length > 0){
            console.log('already complete mission.');

            await db.transRollback(con);

            return res.redirect('/?modal=error&message=' + encodeURIComponent('already complete mission.'));
        }

        url = 'https://twitter.com/i/oauth2/authorize';
        url += '?client_id=' + process.env.TWITTER_CLIENT_ID
        url += '&redirect_uri=' + encodeURIComponent(process.env.TWITTER_RETWEET_CALLBACK_URL)
        url += '&response_type=code'
        url += '&scope=' + encodeURIComponent("users.read tweet.read tweet.write")
        url += `&state=mission_${req.query.missionNum}&code_challenge=${process.env.TWITTER_CODE_CHALLENGER}&code_challenge_method=plain`
    } catch(error){
        console.log(error);
    }
    res.redirect(url);
  }
);

// twitter follow 화면
router.get(
  "/follow",
  async function(req, res, next){
    var url = "/";
    if (typeof req.user == 'undefined' || !req.user.id) {
      return res.redirect('/?modal=error&message=' + encodeURIComponent('Please LogIn'));
    }

    console.log('session id : ' + req.user.id);

    if(!await common.validateNum(req.query.missionNum)) {
        console.log('validate error : missionNum');
        console.log(req.query.missionNum);

        return res.redirect('/?modal=error&message=' + encodeURIComponent('validate error : missionNum.'));
    }

    try{
        var qry = `
          SELECT
              provider, point, address, twitter_id
          FROM users
          WHERE
              id = ?
        `;
        var params = [req.user.id];
      
        var userRst = await db.dbQuery(qry, params);

        if(userRst.length == 0){
            console.log('not found user.');
            console.log(req.user.id);

            return res.redirect('/?modal=error&message=' + encodeURIComponent('not found user.'));
        }

        if(userRst[0].twitter_id == null){
            console.log('Your twitter id has been not registered.<br/>Please connect to Twitter first.');
            console.log(req.user.id);
            console.log(userRst[0].twitter_id);

            return res.redirect('/?modal=error&message=' + encodeURIComponent('Your twitter id has been not registered.<br/>Please connect to Twitter first.'));
        }

        qry = `
            SELECT
                *
            FROM mission
            WHERE
                id = ?
                AND type = 'twitter'
                AND link = '/twitter/follow'
        `;
        var params = [req.query.missionNum];
      
        var missionRst = await db.dbQuery(qry, params);

        if(missionRst.length == 0){
            console.log('not found mission.');

            await db.transRollback(con);

            return res.redirect('/?modal=error&message=' + encodeURIComponent('not found mission.'));
        }

        qry = `
            SELECT
                *
            FROM mission_complete
            WHERE
                user_id = ?
                AND mission_id = ?
        `;
        var params = [req.user.id, missionRst[0].id];
      
        var completeRst = await db.dbQuery(qry, params);

        if(completeRst.length > 0){
            console.log('already complete mission.');

            await db.transRollback(con);

            return res.redirect('/?modal=error&message=' + encodeURIComponent('already complete mission.'));
        }

        url = 'https://twitter.com/i/oauth2/authorize';
        url += '?client_id=' + process.env.TWITTER_CLIENT_ID
        url += '&redirect_uri=' + encodeURIComponent(process.env.TWITTER_FOLLOW_CALLBACK_URL)
        url += '&response_type=code'
        url += '&scope=' + encodeURIComponent("users.read tweet.read follows.write")
        url += `&state=mission_${req.query.missionNum}&code_challenge=${process.env.TWITTER_CODE_CHALLENGER}&code_challenge_method=plain`
    } catch(error){
        console.log(error);
    }
    res.redirect(url);
  }
);

// twitter 연동 redirect
router.get(
  "/signUp/redirect",
  async function(req, res, next){
    var code = req.query.code;
    var con = undefined;
    var url = '/';

    try{
        if (typeof req.user == 'undefined' || !req.user.id) {
          return res.redirect('/?modal=error&message=' + encodeURIComponent('Please LogIn'));
        }
    
        console.log('session : ' + req.user);
        
        con = await db.transBegin();

        var qry = `
            SELECT
                provider, point, address, twitter_id
            FROM users
            WHERE
                id = ?
            FOR UPDATE
        `;
        var params = [req.user.id];
      
        var userRst = await db.dbQuery(qry, params, con);

        if(userRst.length == 0){
            console.log('not found user.');
            console.log(req.user.id);

            await db.transRollback(con);

            return res.redirect('/?modal=error&message=' + encodeURIComponent('not found user.'));
        }

        if(userRst[0].twitter_id != null){
            console.log('Your twitter id has already been registered.');
            console.log(req.user.id);
            console.log(userRst[0].twitter_id);

            await db.transRollback(con);

            return res.redirect('/?modal=error&message=' + encodeURIComponent('Your twitter id has already been registered.'));
        }

        qry = `
            SELECT
                *
            FROM mission
            WHERE
                type = 'twitter'
                AND link = '/twitter/oauth'
        `;
        var params = [];
      
        var missionRst = await db.dbQuery(qry, params, con);

        if(missionRst.length == 0){
            console.log('not found mission.');

            await db.transRollback(con);

            return res.redirect('/?modal=error&message=' + encodeURIComponent('not found mission.'));
        }

        var tokenResp = await axios.post('https://api.twitter.com/2/oauth2/token', {
          code: code,
          grant_type: 'authorization_code',
          client_id: process.env.TWITTER_CLIENT_ID,
          redirect_uri: process.env.TWITTER_SIGNUP_CALLBACK_URL,
          code_verifier: process.env.TWITTER_CODE_CHALLENGER,
        }, {
          headers: { 
              'Content-Type': 'application/x-www-form-urlencoded', 
              'Authorization': `Basic ` + Buffer.from(`${process.env.TWITTER_CLIENT_ID}:${process.env.TWITTER_CLIENT_SECRET}`, "utf8").toString(
                  "base64"
                )
            }
        });
      
        console.log('/twitter/signUp/redirect ::: tokenResp');
        console.log(tokenResp.data);
      
        var resp = await axios.get('https://api.twitter.com/2/users/me', {
          headers: { 
              'Content-Type': 'application/x-www-form-urlencoded', 
              'Authorization': `Bearer ` + tokenResp.data.access_token
            }
        });
      
        console.log(resp.data.data);

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
            console.log('insert mission complete error');

            await db.transRollback(con);

            return res.redirect('/?modal=error&message=' + encodeURIComponent('insert mission complete error.'));
        }

        qry = `
            INSERT INTO
                users_twitter
            (
                id, user_id, \`name\`, user_name
            )
            VALUES
            (
                ?, ?, ?, ?
            )
        `;
        params = [resp.data.data.id, req.user.id, resp.data.data.name, resp.data.data.username];

        var insertRst = await db.dbQuery(qry, params, con);

        if(insertRst.affectedRows != 1) {
            console.log('insert users_twitter complete error');

            await db.transRollback(con);

            return res.redirect('/?modal=error&message=' + encodeURIComponent('insert users_twitter complete error.'));
        }

        qry = `
            UPDATE
                users
            SET
                twitter_id = ?,
                point = point + ?
            WHERE
                id = ?
        `;
        params = [resp.data.data.id, missionRst[0].point, req.user.id];

        var updateRst = await db.dbQuery(qry, params, con);

        if(updateRst.affectedRows != 1) {
            console.log('update user.twitter_id error');

            await db.transRollback(con);

            return res.redirect('/?modal=error&message=' + encodeURIComponent('update user.twitter_id error.'));
        }

        await db.transEnd(con);
        url = '/?modal=complete';
    } catch(error) {
        console.log(error);
        if(con != undefined){
            await db.transRollback(con);
        }
    }

    res.redirect(url);
  
  }
);

// twitter 좋아요 연동 redirect
router.get(
  "/like/redirect",
  async function(req, res, next){
    var state = req.query.state;
    var code = req.query.code;
    var con = undefined;
    var url = '/';

    try{
        if (typeof req.user == 'undefined' || !req.user.id) {
          return res.redirect('/?modal=error&message=' + encodeURIComponent('Please LogIn'));
        }
    
        console.log('session : ' + req.user);
        console.log('state : ' + state);

        var mission_id = state.split('_');
        mission_id = mission_id[1];
        console.log('mission_id : ' + mission_id);
        
        con = await db.transBegin();

        var qry = `
            SELECT
                provider, point, address, twitter_id
            FROM users
            WHERE
                id = ?
            FOR UPDATE
        `;
        var params = [req.user.id];
      
        var userRst = await db.dbQuery(qry, params, con);

        if(userRst.length == 0){
            console.log('not found user.');
            console.log(req.user.id);

            await db.transRollback(con);

            return res.redirect('/?modal=error&message=' + encodeURIComponent('not found user.'));
        }

        if(userRst[0].twitter_id == null){
            console.log('Your twitter id has been not registered.<br/>Please connect to Twitter first.');
            console.log(req.user.id);

            await db.transRollback(con);

            return res.redirect('/?modal=error&message=' + encodeURIComponent('Your twitter id has been not registered.<br/>Please connect to Twitter first.'));
        }

        qry = `
            SELECT
                *
            FROM mission
            WHERE
                id = ?
                AND type = 'twitter'
                AND link = '/twitter/like'
        `;
        var params = [mission_id];
      
        var missionRst = await db.dbQuery(qry, params, con);

        if(missionRst.length == 0){
            console.log('not found mission.');

            await db.transRollback(con);

            return res.redirect('/?modal=error&message=' + encodeURIComponent('not found mission.'));
        }

        qry = `
            SELECT
                *
            FROM mission_complete
            WHERE
                user_id = ?
                AND mission_id = ?
        `;
        var params = [req.user.id, mission_id];
      
        var completeRst = await db.dbQuery(qry, params);

        if(completeRst.length > 0){
            console.log('already complete mission.');

            await db.transRollback(con);

            return res.redirect('/?modal=error&message=' + encodeURIComponent('already complete mission.'));
        }

        var tokenResp = await axios.post('https://api.twitter.com/2/oauth2/token', {
          code: code,
          grant_type: 'authorization_code',
          client_id: process.env.TWITTER_CLIENT_ID,
          redirect_uri: process.env.TWITTER_LIKE_CALLBACK_URL,
          code_verifier: process.env.TWITTER_CODE_CHALLENGER,
        }, {
          headers: { 
              'Content-Type': 'application/x-www-form-urlencoded', 
              'Authorization': `Basic ` + Buffer.from(`${process.env.TWITTER_CLIENT_ID}:${process.env.TWITTER_CLIENT_SECRET}`, "utf8").toString(
                  "base64"
                )
            }
        });
      
        console.log('/twitter/signUp/redirect ::: tokenResp');
        console.log(tokenResp.data);
      
        var userResp = await axios.get('https://api.twitter.com/2/users/me', {
          headers: { 
              'Content-Type': 'application/x-www-form-urlencoded', 
              'Authorization': `Bearer ` + tokenResp.data.access_token
            }
        });
      
        console.log(userResp.data.data);

        if(userRst[0].twitter_id != userResp.data.data.id){
            console.log('This account is different from the registered Twitter account.');
            console.log(req.user.id);

            await db.transRollback(con);

            return res.redirect('/?modal=error&message=' + encodeURIComponent('This account is different from the registered Twitter account.'));
        }
      
        var resp = await axios.post('https://api.twitter.com/2/users/' + userRst[0].twitter_id + '/likes',{
            "tweet_id" : missionRst[0].value
        }, {
          headers: { 
              'Authorization': `Bearer ` + tokenResp.data.access_token
            }
        });
      
        console.log(resp.data.data);

        if(!resp.data.data.liked){
            console.log('like error');

            await db.transRollback(con);

            return res.redirect('/?modal=error&message=' + encodeURIComponent('like error.'));
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
            console.log('insert mission complete error');

            await db.transRollback(con);

            return res.redirect('/?modal=error&message=' + encodeURIComponent('insert mission complete error.'));
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
            console.log('update point error');

            await db.transRollback(con);

            return res.redirect('/?modal=error&message=' + encodeURIComponent('update point error.'));
        }

        await db.transEnd(con);
        url = 'https://twitter.com/intent/like?tweet_id=' + missionRst[0].value;
    } catch(error) {
        console.log(error);
        if(con != undefined){
            await db.transRollback(con);
        }
    }

    res.redirect(url);
  
  }
);

// twitter retweet 연동 redirect
router.get(
  "/retweet/redirect",
  async function(req, res, next){
    var state = req.query.state;
    var code = req.query.code;
    var con = undefined;
    var url = '/';

    try{
        if (typeof req.user == 'undefined' || !req.user.id) {
          return res.redirect('/?modal=error&message=' + encodeURIComponent('Please LogIn'));
        }
    
        console.log('session : ' + req.user);
        console.log('state : ' + state);

        var mission_id = state.split('_');
        mission_id = mission_id[1];
        console.log('mission_id : ' + mission_id);
        
        con = await db.transBegin();

        var qry = `
            SELECT
                provider, point, address, twitter_id
            FROM users
            WHERE
                id = ?
            FOR UPDATE
        `;
        var params = [req.user.id];
      
        var userRst = await db.dbQuery(qry, params, con);

        if(userRst.length == 0){
            console.log('not found user.');
            console.log(req.user.id);

            await db.transRollback(con);

            return res.redirect('/?modal=error&message=' + encodeURIComponent('not found user.'));
        }

        if(userRst[0].twitter_id == null){
            console.log('Your twitter id has been not registered.<br/>Please connect to Twitter first.');
            console.log(req.user.id);

            await db.transRollback(con);

            return res.redirect('/?modal=error&message=' + encodeURIComponent('Your twitter id has been not registered.<br/>Please connect to Twitter first.'));
        }

        qry = `
            SELECT
                *
            FROM mission
            WHERE
                id = ?
                AND type = 'twitter'
                AND link = '/twitter/retweet'
        `;
        var params = [mission_id];
      
        var missionRst = await db.dbQuery(qry, params, con);

        if(missionRst.length == 0){
            console.log('not found mission.');

            await db.transRollback(con);

            return res.redirect('/?modal=error&message=' + encodeURIComponent('not found mission.'));
        }

        qry = `
            SELECT
                *
            FROM mission_complete
            WHERE
                user_id = ?
                AND mission_id = ?
        `;
        var params = [req.user.id, mission_id];
      
        var completeRst = await db.dbQuery(qry, params);

        if(completeRst.length > 0){
            console.log('already complete mission.');

            await db.transRollback(con);

            return res.redirect('/?modal=error&message=' + encodeURIComponent('already complete mission.'));
        }

        var tokenResp = await axios.post('https://api.twitter.com/2/oauth2/token', {
          code: code,
          grant_type: 'authorization_code',
          client_id: process.env.TWITTER_CLIENT_ID,
          redirect_uri: process.env.TWITTER_RETWEET_CALLBACK_URL,
          code_verifier: process.env.TWITTER_CODE_CHALLENGER,
        }, {
          headers: { 
              'Content-Type': 'application/x-www-form-urlencoded', 
              'Authorization': `Basic ` + Buffer.from(`${process.env.TWITTER_CLIENT_ID}:${process.env.TWITTER_CLIENT_SECRET}`, "utf8").toString(
                  "base64"
                )
            }
        });
      
        console.log('/twitter/retweet/redirect ::: tokenResp');
        console.log(tokenResp.data);
      
        var userResp = await axios.get('https://api.twitter.com/2/users/me', {
          headers: { 
              'Content-Type': 'application/x-www-form-urlencoded', 
              'Authorization': `Bearer ` + tokenResp.data.access_token
            }
        });
      
        console.log(userResp.data.data);

        if(userRst[0].twitter_id != userResp.data.data.id){
            console.log('This account is different from the registered Twitter account.');
            console.log(req.user.id);

            await db.transRollback(con);

            return res.redirect('/?modal=error&message=' + encodeURIComponent('This account is different from the registered Twitter account.'));
        }

        try{
            // 이미 리트윗 됬을 경우 400에러가 나와서 요청 에러시 그냥 무시하도록 트라이 캐치 진행 링크로 트위터 게시글 리트윗 유도함
            var resp = await axios.post('https://api.twitter.com/2/users/' + userRst[0].twitter_id + '/retweets',{
                "tweet_id" : missionRst[0].value
            }, {
            headers: { 
                'Authorization': `Bearer ` + tokenResp.data.access_token
                }
            });
        
            console.log(resp.data.data);

            if(!resp.data.data.retweeted){
                console.log('retweet error');
            }
        } catch(error) {
            console.log('retweet error');
            console.log(error);
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
            console.log('insert mission complete error');

            await db.transRollback(con);

            return res.redirect('/?modal=error&message=' + encodeURIComponent('insert mission complete error.'));
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
            console.log('update point error');

            await db.transRollback(con);

            return res.redirect('/?modal=error&message=' + encodeURIComponent('update point error.'));
        }

        await db.transEnd(con);
        url = 'https://twitter.com/intent/retweet?tweet_id=' + missionRst[0].value;
    } catch(error) {
        console.log(error);
        if(con != undefined){
            await db.transRollback(con);
        }
    }

    res.redirect(url);
  
  }
);

// twitter follow 연동 redirect
router.get(
  "/follow/redirect",
  async function(req, res, next){
    var state = req.query.state;
    var code = req.query.code;
    var con = undefined;
    var url = '/';

    try{
        if (typeof req.user == 'undefined' || !req.user.id) {
          return res.redirect('/?modal=error&message=' + encodeURIComponent('Please LogIn'));
        }
    
        console.log('session : ' + req.user);
        console.log('state : ' + state);

        var mission_id = state.split('_');
        mission_id = mission_id[1];
        console.log('mission_id : ' + mission_id);
        
        con = await db.transBegin();

        var qry = `
            SELECT
                provider, point, address, twitter_id
            FROM users
            WHERE
                id = ?
            FOR UPDATE
        `;
        var params = [req.user.id];
      
        var userRst = await db.dbQuery(qry, params, con);

        if(userRst.length == 0){
            console.log('not found user.');
            console.log(req.user.id);

            await db.transRollback(con);

            return res.redirect('/?modal=error&message=' + encodeURIComponent('not found user.'));
        }

        if(userRst[0].twitter_id == null){
            console.log('Your twitter id has been not registered.<br/>Please connect to Twitter first.');
            console.log(req.user.id);

            await db.transRollback(con);

            return res.redirect('/?modal=error&message=' + encodeURIComponent('Your twitter id has been not registered.<br/>Please connect to Twitter first.'));
        }

        qry = `
            SELECT
                *
            FROM mission
            WHERE
                id = ?
                AND type = 'twitter'
                AND link = '/twitter/follow'
        `;
        var params = [mission_id];
      
        var missionRst = await db.dbQuery(qry, params, con);

        if(missionRst.length == 0){
            console.log('not found mission.');

            await db.transRollback(con);

            return res.redirect('/?modal=error&message=' + encodeURIComponent('not found mission.'));
        }

        qry = `
            SELECT
                *
            FROM mission_complete
            WHERE
                user_id = ?
                AND mission_id = ?
        `;
        var params = [req.user.id, mission_id];
      
        var completeRst = await db.dbQuery(qry, params);

        if(completeRst.length > 0){
            console.log('already complete mission.');

            await db.transRollback(con);

            return res.redirect('/?modal=error&message=' + encodeURIComponent('already complete mission.'));
        }

        var tokenResp = await axios.post('https://api.twitter.com/2/oauth2/token', {
          code: code,
          grant_type: 'authorization_code',
          client_id: process.env.TWITTER_CLIENT_ID,
          redirect_uri: process.env.TWITTER_FOLLOW_CALLBACK_URL,
          code_verifier: process.env.TWITTER_CODE_CHALLENGER,
        }, {
          headers: { 
              'Content-Type': 'application/x-www-form-urlencoded', 
              'Authorization': `Basic ` + Buffer.from(`${process.env.TWITTER_CLIENT_ID}:${process.env.TWITTER_CLIENT_SECRET}`, "utf8").toString(
                  "base64"
                )
            }
        });
      
        console.log('/twitter/follow/redirect ::: tokenResp');
        console.log(tokenResp.data);
      
        var resp = await axios.post('https://api.twitter.com/2/users/' + userRst[0].twitter_id + '/following',{
            "target_user_id" : missionRst[0].value
        }, {
          headers: { 
              'Authorization': `Bearer ` + tokenResp.data.access_token
            }
        });
      
        console.log(resp.data.data);

        if(!resp.data.data.following){
            console.log('follow error');

            await db.transRollback(con);

            return res.redirect('/?modal=error&message=' + encodeURIComponent('follow error.'));
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
            console.log('insert mission complete error');

            await db.transRollback(con);

            return res.redirect('/?modal=error&message=' + encodeURIComponent('insert mission complete error.'));
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
            console.log('update point error');

            await db.transRollback(con);

            return res.redirect('/?modal=error&message=' + encodeURIComponent('update point error.'));
        }

        await db.transEnd(con);
        url = 'https://twitter.com/intent/follow?user_id=' + missionRst[0].value;
    } catch(error) {
        console.log(error);
        if(con != undefined){
            await db.transRollback(con);
        }
    }

    res.redirect(url);
  
  }
);

module.exports = router;
