var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', async function(req, res, next) {
  var result = {
    result : false
  }

  if (!req.isAuthenticated()) {
    result.message = "Not logged in."
    return res.json(result);
  }

  try{
    var qry = `
      SELECT
          provider, name, point, address, provider_id as twitter_id, discord_id
      FROM users
      WHERE
          id = ?
    `;
    var params = [req.user.id];
  
    var rst = await db.dbQuery(qry, params);
    
    result = {
      result : true,
      data : rst[0]
    }
  } catch(error) {
    console.log(error);
  }

  res.json(result);
});

// login
router.get("/login", async (req, res, next) => {
  var result = {
    result: false,
    message: ""
  };

  if (req.isAuthenticated()) {
    result.message = "Already logged in."
    return res.json(result);
  }
  var url = "/";
  try{
      url = 'https://twitter.com/i/oauth2/authorize';
      url += '?client_id=' + process.env.TWITTER_CLIENT_ID
      url += '&redirect_uri=' + encodeURIComponent(process.env.TWITTER_SIGNUP_CALLBACK_URL)
      url += '&response_type=code'
      url += '&scope=' + encodeURIComponent("users.read tweet.read tweet.write follows.write like.write")
      url += `&state=incn_twitter&code_challenge=${process.env.TWITTER_CODE_CHALLENGER}&code_challenge_method=plain`
  } catch(error){
      console.log(error);
  }
  res.redirect(url);
});

// logout
router.get("/logout", (req, res) => {
  console.log('log out : ' + JSON.stringify(req.user));
  req.logout(function (err) {
      if (err) { return next(err); }
      req.session.destroy();
      res.redirect('/');
  });
});

module.exports = router;
