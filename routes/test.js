var express = require('express');
var router = express.Router();
var axios = require('axios');

// twitter login 화면
router.get(
  "/login",
  async function(req, res, next){
    var url = "/";
    try{
        url = 'https://twitter.com/i/oauth2/authorize';
        url += '?client_id=' + process.env.TWITTER_CLIENT_ID
        url += '&redirect_uri=' + encodeURIComponent(process.env.TWITTER_TEST_SIGNUP_CALLBACK_URL)
        url += '&response_type=code'
        url += '&scope=' + encodeURIComponent("users.read tweet.read tweet.write follows.write like.write")
        url += `&state=incn_twitter&code_challenge=${process.env.TWITTER_CODE_CHALLENGER}&code_challenge_method=plain`
    } catch(error){
        console.log(error);
    }
    res.redirect(url);
  }
);

// logout
router.get("/logout", (req, res) => {
  console.log('log out : ' + JSON.stringify(req.user));
  req.logout(function (err) {
      if (err) { return next(err); }
      req.session.destroy();
      res.redirect('/test');
  });
});

module.exports = router;
