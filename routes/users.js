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
          provider, point, address, twitter_id, discord_id
      FROM users
      WHERE
          id = ?
          AND provider = 'metamask'
          AND address = ?
    `;
    var params = [req.user.id, req.user.address];
  
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
router.post("/login", async (req, res, next) => {
  var result = {
    result: false,
    message: ""
  };

  if (req.isAuthenticated()) {
    result.message = "Already logged in."
    return res.json(result);
  }

  if(!await common.validateAddr(req.body.address)) {
      console.log('validate error : address');
      console.log(req.body.address);
      result.message = 'validate error : address';

      return res.json(result);
  }

  if(!await common.validateNum(req.body.deadline)) {
      console.log('validate error : deadline');
      console.log(req.body.deadline);
      result.message = 'validate error : deadline';

      return res.json(result);
  }

  if(!await common.validateHex(req.body.hash)) {
      console.log('validate error : hash');
      console.log(req.body.hash);
      result.message = 'validate error : hash';

      return res.json(result);
  }

  console.log('validation check success');

  //? local로 실행이 되면 localstrategy를 찾아 실행한다.
  passport.authenticate('local', (authError, user, info) => {
    var result = {
      result: false,
      message: ""
    };

    //? (authError, user, info) => 이 콜백 미들웨어는 localstrategy에서 done()이 호출되면 실행된다.
    //? localstrategy에 done()함수에 로직 처리에 따라 1,2,3번째 인자에 넣는 순서가 달랐는데 그 이유가 바로 이것이다.

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
        return res.json({result:true});
    });
  })(req, res, next); //! 미들웨어 내의 미들웨어에는 콜백을 실행시키기위해 (req, res, next)를 붙인다.
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
