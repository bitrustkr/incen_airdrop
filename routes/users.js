var express = require('express');
var router = express.Router();

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
    var referral = 0;

    if(req.query.referral) {

      if(!await common.validateNum(req.query.referral)) {
          console.log('validate error : referral');
          console.log(req.query.referral);
  
          return res.redirect('/?modal=error&message=' + encodeURIComponent('validate error : referral.'));
      }

      referral = req.query.referral;
    }

      url = 'https://twitter.com/i/oauth2/authorize';
      url += '?client_id=' + process.env.TWITTER_CLIENT_ID
      url += '&redirect_uri=' + encodeURIComponent(process.env.TWITTER_SIGNUP_CALLBACK_URL)
      url += '&response_type=code'
      url += '&scope=' + encodeURIComponent("users.read tweet.read tweet.write follows.write like.write")
      url += `&state=referral_` + referral + `&code_challenge=${process.env.TWITTER_CODE_CHALLENGER}&code_challenge_method=plain`
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
