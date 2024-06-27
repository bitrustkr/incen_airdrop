var express = require('express');
var router = express.Router();
var axios = require('axios');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('discord');
});

router.get(
  "/oauth",
  async function(req, res, next){
    var url = "/";
    if (!req.isAuthenticated()) {
      return res.redirect('/?modal=error&message=' + encodeURIComponent('Please LogIn'));
    }

    console.log('session id : ' + req.user.id);

    try{
        var qry = `
          SELECT
              provider, point, address, discord_id
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

        if(userRst[0].discord_id != null){
            console.log('Your discord id has already been registered.');
            console.log(req.user.id);
            console.log(userRst[0].discord_id);

            return res.redirect('/?modal=error&message=' + encodeURIComponent('Your discord id has already been registered.'));
        }
        url = 'https://discord.com/oauth2/authorize?';
        url += 'client_id=' + process.env.DISCORD_CLIENT_ID;
        url += '&response_type=code';
        url += '&redirect_uri=' + encodeURIComponent(process.env.DISCORD_SIGNUP_CALLBACK_URL);
        url += '&scope=identify';
    } catch(error){
        console.log(error);
    }
    res.redirect(url);
  }
);

router.get(
  "/join",
  async function(req, res, next){
    var url = "/";
    if (!req.isAuthenticated()) {
      return res.redirect('/?modal=error&message=' + encodeURIComponent('Please LogIn'));
    }

    if(!await common.validateNum(req.query.missionNum)) {
        console.log('validate error : missionNum');
        console.log(req.query.missionNum);

        return res.redirect('/?modal=error&message=' + encodeURIComponent('validate error : missionNum.'));
    }

    console.log('session id : ' + req.user.id);

    try{
        var qry = `
          SELECT
              provider, point, address, discord_id
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

        if(userRst[0].discord_id == null){
            console.log('Your discord id has been not registered.<br/>Please connect to Discord first.');
            console.log(req.user.id);
            console.log(userRst[0].discord_id);

            return res.redirect('/?modal=error&message=' + encodeURIComponent('Your discord id has been not registered.<br/>Please connect to Discord first.'));
        }

        qry = `
            SELECT
                *
            FROM mission
            WHERE
                id = ?
                AND type = 'discord'
                AND link = '/discord/join'
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
        
        url = 'https://discord.com/oauth2/authorize?';
        url += 'client_id=' + process.env.DISCORD_CLIENT_ID;
        url += '&response_type=code';
        url += '&redirect_uri=' + encodeURIComponent(process.env.DISCORD_JOIN_CALLBACK_URL + missionRst[0].id + "/" + missionRst[0].value);
        url += '&scope=guilds.join+identify';

    } catch(error){
        console.log(error);
    }
    res.redirect(url);
  }
);

router.get(
  "/rank/:rank",
  async function(req, res, next){
    var rank = req.params.rank
    var url = "/";
    if (!req.isAuthenticated()) {
      return res.redirect('/?modal=error&message=' + encodeURIComponent('Please LogIn'));
    }

    if(!await common.validateNum(req.params.rank)) {
        console.log('validate error : rank');
        console.log(req.params.rank);

        return res.redirect('/?modal=error&message=' + encodeURIComponent('validate error : rank.'));
    }

    console.log('session id : ' + req.user.id);

    try{
        var qry = `
          SELECT
              provider, point, address, discord_id
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

        if(userRst[0].discord_id == null){
            console.log('Your discord id has been not registered.<br/>Please connect to Discord first.');
            console.log(req.user.id);
            console.log(userRst[0].discord_id);

            return res.redirect('/?modal=error&message=' + encodeURIComponent('Your discord id has been not registered.<br/>Please connect to Discord first.'));
        }

        qry = `
            SELECT
                *
            FROM mission
            WHERE
                type = 'discord'
                AND link = '/discord/rank/` + rank + `'
        `;
        var params = [];
      
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

        url = 'https://discord.com/oauth2/authorize?';
        url += 'client_id=' + process.env.DISCORD_CLIENT_ID;
        url += '&response_type=code';
        url += '&redirect_uri=' + encodeURIComponent(process.env.DISCORD_RANK_CALLBACK_URL) + rank;
        url += '&scope=guilds.members.read+identify';

    } catch(error){
        console.log(error);
    }
    res.redirect(url);
  }
);

router.get(
  "/signUp/redirect",
  async function(req, res, next){
    var code = req.query.code;
    var con = undefined;
    var url = '/';

    try{
        if (!req.isAuthenticated()) {
          return res.redirect('/?modal=error&message=' + encodeURIComponent('Please LogIn'));
        }
    
        console.log('session : ' + req.user);
        
        con = await db.transBegin();

        var qry = `
            SELECT
                provider, point, address, discord_id
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

        if(userRst[0].discord_id != null){
            console.log('Your discord id has already been registered.');
            console.log(req.user.id);
            console.log(userRst[0].discord_id);

            await db.transRollback(con);

            return res.redirect('/?modal=error&message=' + encodeURIComponent('Your discord id has already been registered.'));
        }

        qry = `
            SELECT
                *
            FROM mission
            WHERE
                type = 'discord'
                AND link = '/discord/oauth'
        `;
        var params = [];
      
        var missionRst = await db.dbQuery(qry, params, con);

        if(missionRst.length == 0){
            console.log('not found mission.');

            await db.transRollback(con);

            return res.redirect('/?modal=error&message=' + encodeURIComponent('not found mission.'));
        }
  
        var tokenResp = await axios.post('https://discord.com/api/oauth2/token', {
          code: code,
          grant_type: 'authorization_code',
          client_id: process.env.DISCORD_CLIENT_ID,
          client_secret: process.env.DISCORD_CLIENT_SECRET,
          redirect_uri: process.env.DISCORD_SIGNUP_CALLBACK_URL,
          scope: 'identify',
        }, {
          headers: { 
              'Content-Type': 'application/x-www-form-urlencoded', 
            }
        });
      
        console.log('/discord/signUp/redirect ::: tokenResp');
        console.log(tokenResp.data);
  
        var resp = await axios.get('https://discordapp.com/api/users/@me', {
          headers: { 
              authorization: `Bearer ${tokenResp.data.access_token}`,
            }
        });
      
        console.log(resp.data);

        qry = `
            SELECT
                provider, point, address, discord_id
            FROM users
            WHERE
                discord_id = ?
        `;
        params = [resp.data.id];
      
        var discordRst = await db.dbQuery(qry, params, con);

        if(discordRst.length > 0){
            console.log('already registrated discord id.');
            console.log(req.user.id);

            await db.transRollback(con);

            return res.redirect('/?modal=error&message=' + encodeURIComponent('already registrated discord id.'));
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
            INSERT INTO
                users_discord
            (
                id, user_id, \`name\`, user_name
            )
            VALUES
            (
                ?, ?, ?, ?
            )
        `;
        params = [resp.data.id, req.user.id, resp.data.global_name, resp.data.username];

        var insertRst = await db.dbQuery(qry, params, con);

        if(insertRst.affectedRows != 1) {
            console.log('insert users_discord complete error');

            await db.transRollback(con);

            return res.redirect('/?modal=error&message=' + encodeURIComponent('insert users_discord complete error.'));
        }

        qry = `
            UPDATE
                users
            SET
                discord_id = ?,
                point = point + ?
            WHERE
                id = ?
        `;
        params = [resp.data.id, missionRst[0].point, req.user.id];

        var updateRst = await db.dbQuery(qry, params, con);

        if(updateRst.affectedRows != 1) {
            console.log('update user.discord_id error');

            await db.transRollback(con);

            return res.redirect('/?modal=error&message=' + encodeURIComponent('update error.'));
        }

        await db.transEnd(con);

        req.session.passport.user.point = req.session.passport.user.point + missionRst[0].point;
        req.session.passport.user.discord_id = resp.data.id;

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

router.get(
  "/join/redirect/:missionNum/:value",
  async function(req, res, next){
    var code = req.query.code;
    var missionNum = req.params.missionNum;
    var category = req.params.value;
    var con = undefined;
    var url = '/';

    try{
        if (!req.isAuthenticated()) {
          return res.redirect('/?modal=error&message=' + encodeURIComponent('Please LogIn'));
        }

        if(!await common.validateCategory(req.params.value)) {
            console.log('validate error : category');
            console.log(req.params.value);
            result.message = 'validate error : category';
    
            return res.json(result);
        }

        if(!await common.validateNum(req.params.missionNum)) {
            console.log('validate error : missionNum');
            console.log(req.params.missionNum);
    
            return res.redirect('/?modal=error&message=' + encodeURIComponent('validate error : missionNum.'));
        }
    
        console.log('session : ' + req.user);
        
        con = await db.transBegin();

        var qry = `
            SELECT
                *
            FROM mission
            WHERE
                id = ?
                AND \`value\` = ?
                AND type = 'discord'
                AND link = '/discord/join'
        `;
        var params = [missionNum, category];
      
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
        var params = [req.user.id, missionRst[0].id];
      
        var completeRst = await db.dbQuery(qry, params, con);

        if(completeRst.length > 0){
            console.log('already complete mission.');

            await db.transRollback(con);

            return res.redirect('/?modal=error&message=' + encodeURIComponent('already complete mission.'));
        }

        var mission_id = missionRst[0].id;
        console.log('mission_id : ' + mission_id);

        var qry = `
            SELECT
                provider, point, address, discord_id
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

        if(userRst[0].discord_id == null){
            console.log('Your discord id has been not registered.<br/>Please connect to Discord first.');
            console.log(req.user.id);

            await db.transRollback(con);

            return res.redirect('/?modal=error&message=' + encodeURIComponent('Your discord id has been not registered.<br/>Please connect to Discord first.'));
        }
  
        var tokenResp = await axios.post('https://discord.com/api/oauth2/token', {
          code: code,
          grant_type: 'authorization_code',
          client_id: process.env.DISCORD_CLIENT_ID,
          client_secret: process.env.DISCORD_CLIENT_SECRET,
          redirect_uri: process.env.DISCORD_JOIN_CALLBACK_URL + missionNum + "/" + category,
          scope: 'guilds.join, identify',
        }, {
          headers: { 
              'Content-Type': 'application/x-www-form-urlencoded', 
            }
        });
      
        console.log('/discord/join/redirect ::: tokenResp');
        console.log(tokenResp.data);
  
        var resp = await axios.get('https://discordapp.com/api/users/@me', {
          headers: { 
              authorization: `Bearer ${tokenResp.data.access_token}`,
            }
        });

        if(userRst[0].discord_id != resp.data.id){
            console.log('It is different from the registered Discord ID.');
            console.log(req.user.id);

            await db.transRollback(con);

            return res.redirect('/?modal=error&message=' + encodeURIComponent('It is different from the registered Discord ID.'));
        }
      
        console.log('/discord/join/redirect ::: user resp');
        console.log(resp.data);
      
        var joinResp = await axios.put('https://discordapp.com/api/guilds/' + process.env[category + "_DISCORD_GUILD_ID"] + '/members/' + resp.data.id, {
            access_token: tokenResp.data.access_token
        }, {
            headers: { 
                authorization: `Bot ` + process.env.DISCORD_BOT_TOKEN,
                }
        });
      
        // 이미 들어가 있는경우 응답 "" status code 204
        // 최초 들어갈 경우 응답있음 status code 201
        console.log('/discord/join/redirect ::: join resp');
        console.log('status' + joinResp.status);
        console.log(joinResp.data);

        if(joinResp.status != 201 && joinResp.status != 204){
            console.log('guild join failed.');
            console.log(req.user.id);

            await db.transRollback(con);

            return res.redirect('/?modal=error&message=' + encodeURIComponent('guild join failed.<br/>Please try again.'));
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

router.get(
  "/rank/redirect/:rank",
  async function(req, res, next){
    var code = req.query.code;
    var rank = req.params.rank;
    var con = undefined;
    var url = '/';

    try{
        if (!req.isAuthenticated()) {
          return res.redirect('/?modal=error&message=' + encodeURIComponent('Please LogIn'));
        }

        if(!await common.validateNum(req.params.rank)) {
            console.log('validate error : rank');
            console.log(req.params.rank);
    
            return res.redirect('/?modal=error&message=' + encodeURIComponent('validate error : rank.'));
        }
    
        console.log('session : ' + req.user);
        
        con = await db.transBegin();

        var qry = `
            SELECT
                *
            FROM mission
            WHERE
                type = 'discord'
                AND link = '/discord/rank/` + rank + `'
        `;
        var params = [];
      
        var missionRst = await db.dbQuery(qry, params, con);

        if(missionRst.length == 0){
            console.log('not found mission.');

            await db.transRollback(con);

            return res.redirect('/?modal=error&message=' + encodeURIComponent('not found mission.'));
        }

        var category = missionRst[0].value;

        qry = `
            SELECT
                *
            FROM mission_complete
            WHERE
                user_id = ?
                AND mission_id = ?
        `;
        var params = [req.user.id, missionRst[0].id];
      
        var completeRst = await db.dbQuery(qry, params, con);

        if(completeRst.length > 0){
            console.log('already complete mission.');

            await db.transRollback(con);

            return res.redirect('/?modal=error&message=' + encodeURIComponent('already complete mission.'));
        }

        var mission_id = missionRst[0].id;
        console.log('mission_id : ' + mission_id);

        var qry = `
            SELECT
                provider, point, address, discord_id
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

        if(userRst[0].discord_id == null){
            console.log('Your discord id has been not registered.<br/>Please connect to Discord first.');
            console.log(req.user.id);

            await db.transRollback(con);

            return res.redirect('/?modal=error&message=' + encodeURIComponent('Your discord id has been not registered.<br/>Please connect to Discord first.'));
        }

        var tokenResp = await axios.post('https://discord.com/api/oauth2/token', {
          code: code,
          grant_type: 'authorization_code',
          client_id: process.env.DISCORD_CLIENT_ID,
          client_secret: process.env.DISCORD_CLIENT_SECRET,
          redirect_uri: process.env.DISCORD_RANK_CALLBACK_URL + req.params.rank,
          scope: 'guilds.members.read, identify',
        }, {
          headers: { 
              'Content-Type': 'application/x-www-form-urlencoded', 
            }
        });
      
        console.log('/discord/join/redirect ::: tokenResp');
        console.log(tokenResp.data);
  
        var resp = await axios.get('https://discordapp.com/api/users/@me', {
          headers: { 
              authorization: `Bearer ${tokenResp.data.access_token}`,
            }
        });
      
        console.log('/discord/join/redirect ::: user resp');
        console.log(resp.data);

        if(userRst[0].discord_id != resp.data.id){
            console.log('It is different from the registered Discord ID.');
            console.log(req.user.id);

            await db.transRollback(con);

            return res.redirect('/?modal=error&message=' + encodeURIComponent('It is different from the registered Discord ID.'));
        }

        var rankResp = await axios.get('https://discordapp.com/api/users/@me/guilds/' + process.env[category + "_DISCORD_GUILD_ID"] + '/member', {
          headers: { 
              authorization: `Bearer ${tokenResp.data.access_token}`,
            }
        });
      
        console.log(rankResp.data.roles);
      
        var isRole = false;
      
        for(var i = 0; i < rankResp.data.roles.length; i++){
          if(rankResp.data.roles[i] == req.params.rank) {
              isRole = true;
              break;
          }
        }

        if(!isRole){
            console.log('It does not have a matching role.<br/>Please check Discord.');
            console.log(req.user.id);

            await db.transRollback(con);

            return res.redirect('/?modal=error&message=' + encodeURIComponent('It does not have a matching role.<br/>Please check Discord.'));
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

module.exports = router;