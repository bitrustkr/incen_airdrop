var express = require('express');
var router = express.Router();
var axios = require('axios');

// twitter 연동 redirect
router.get(
  "/signUp/redirect",
  async function(req, res, next){
    var code = req.query.code;
    try{

        var state = req.query.state;
        state = state.split("_");
        console.log(state);

        var referral = false;
        if(state[1] != 0) {
            if(!await common.validateNum(state[1])) {
                console.log('validate error : referral');
                console.log(state[1]);

                return res.redirect('/?modal=error&message=' + encodeURIComponent('validate error : referral.'));
            }

            referral = state[1];
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
      
        console.log('/twitter/signUp/redirect ::: resp');
        console.log(resp.data.data);

        req.body.id = resp.data.data.id;
        req.body.access_token = tokenResp.data.access_token;
        req.body.name = resp.data.data.name;
        req.body.username = resp.data.data.username;
        req.body.referral = referral;

        //localstrategy를 찾아 실행한다.
        passport.authenticate('twitter', (authError, user, info) => {
            var result = {
                result: false,
                message: ""
            };

            // done(err)가 처리된 경우
            if (authError) {
                console.error(authError);
                return next(authError); // 에러처리 미들웨어로 보낸다.
            }

            // done(null, false, { message: 'error message' }) 가 처리된 경우
            if (!user) {
                // done()의 3번째 인자 { message: 'error message' }가 실행
                result.message = info.message;
                return res.json(result);
            }

            //? done(null, exUser)가 처리된경우, 즉 로그인이 성공(user가 false가 아닌 경우), passport/index.js로 가서 실행시킨다.
            return req.login(user, loginError => {
                //? loginError => 미들웨어는 passport/index.js의 passport.deserializeUser((id, done) => 가 done()이 되면 실행하게 된다.
                // 만일 done(err) 가 됬다면,
                if (loginError) {
                    console.error(loginError);
                    return next(loginError);
                }
                // done(null, user)로 로직이 성공적이라면, 세션에 사용자 정보를 저장해놔서 로그인 상태가 된다.
                url = '/?modal=complete';
                return res.redirect(url);
            });
        })(req, res, next); //! 미들웨어 내의 미들웨어에는 콜백을 실행시키기위해 (req, res, next)를 붙인다.
    } catch(error) {
        console.log(error);
        // if(con != undefined){
        //     await db.transRollback(con);
        // }
    }
  
  }
);

// twitter 좋아요 화면
router.get(
  "/like",
  async function(req, res, next){
    var con = undefined;
    var url = "/";

    if (!req.isAuthenticated()) {
      return res.redirect('/?modal=error&message=' + encodeURIComponent('Please LogIn'));
    }

    console.log('session id : ' + req.user.id);

    if(!await common.validateNum(req.query.missionNum)) {
        console.log('validate error : missionNum');
        console.log(req.query.missionNum);

        return res.redirect('/?modal=error&message=' + encodeURIComponent('validate error : missionNum.'));
    }

    try{
        
        con = await db.transBegin();

        var qry = `
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
      
        var resp = await axios.post('https://api.twitter.com/2/users/' + req.user.twitter_id + '/likes',{
            "tweet_id" : missionRst[0].value
        }, {
          headers: { 
              'Authorization': `Bearer ` + req.user.token
            }
        });
      
        console.log("resp.data.data");
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

        req.session.passport.user.point = req.session.passport.user.point + missionRst[0].point;

        url = '/twitterSuccess?url=' + encodeURIComponent('https://twitter.com/intent/like?tweet_id=' + missionRst[0].value);

    } catch(error){
        console.log(error);
        if(con != undefined){
            await db.transRollback(con);
        }
    }
    res.redirect(url);
  }
);

// twitter retweet 화면
router.get(
  "/retweet",
  async function(req, res, next){
    var con = undefined;
    var url = "/";

    if (!req.isAuthenticated()) {
      return res.redirect('/?modal=error&message=' + encodeURIComponent('Please LogIn'));
    }

    console.log('session id : ' + req.user.id);

    if(!await common.validateNum(req.query.missionNum)) {
        console.log('validate error : missionNum');
        console.log(req.query.missionNum);

        return res.redirect('/?modal=error&message=' + encodeURIComponent('validate error : missionNum.'));
    }

    try{
        
        con = await db.transBegin();
        
        var qry = `
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

        try{
            // 이미 리트윗 됬을 경우 400에러가 나와서 요청 에러시 그냥 무시하도록 트라이 캐치 진행 링크로 트위터 게시글 리트윗 유도함
            var resp = await axios.post('https://api.twitter.com/2/users/' + req.user.twitter_id + '/retweets',{
                "tweet_id" : missionRst[0].value
            }, {
            headers: { 
                'Authorization': `Bearer ` + req.user.token
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

        req.session.passport.user.point = req.session.passport.user.point + missionRst[0].point;

        url = '/twitterSuccess?url=' + encodeURIComponent('https://twitter.com/intent/retweet?tweet_id=' + missionRst[0].value);
    } catch(error){
        console.log(error);
        if(con != undefined){
            await db.transRollback(con);
        }
    }
    res.redirect(url);
  }
);

// twitter follow 화면
router.get(
  "/follow",
  async function(req, res, next){
    var con = undefined;
    var url = "/";
    if (!req.isAuthenticated()) {
      return res.redirect('/?modal=error&message=' + encodeURIComponent('Please LogIn'));
    }

    console.log('session id : ' + req.user.id);

    if(!await common.validateNum(req.query.missionNum)) {
        console.log('validate error : missionNum');
        console.log(req.query.missionNum);

        return res.redirect('/?modal=error&message=' + encodeURIComponent('validate error : missionNum.'));
    }

    try{
    
        con = await db.transBegin();

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
      
        var resp = await axios.post('https://api.twitter.com/2/users/' + req.user.twitter_id + '/following',{
            "target_user_id" : missionRst[0].value
        }, {
          headers: { 
              'Authorization': `Bearer ` + req.user.token
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

        req.session.passport.user.point = req.session.passport.user.point + missionRst[0].point;

        url = '/twitterSuccess?url=' + encodeURIComponent('https://twitter.com/intent/follow?user_id=' + missionRst[0].value);

    } catch(error){
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
        if (!req.isAuthenticated()) {
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

        req.session.passport.user.point = req.session.passport.user.point + missionRst[0].point;

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
