var express = require("express");
var router = express.Router();

// index
router.get("/", async (req, res) => {

  var user = {};
  var userId = 0;

  if (req.isAuthenticated()) {
    user = {
      id: req.user.id,
      name: req.user.name,
      address: req.user.address,
      twitter_id: req.user.twitter_id,
      discord_id: req.user.discord_id,
      point: req.user.point
    };

    userId = req.user.id;
  }

  var qry = `
      SELECT
          A.id, A.title, A.point, 
          A.category, A.type, A.repeat, 
          A.link, A.rewardLink, A.value, A.order, 
          case when (B.complete is null) then false else true end as complete
      FROM 
        mission as A
      LEFT JOIN
        (
          SELECT id, mission_id, true as complete 
          FROM mission_complete
          WHERE user_id = ?
        ) as B
      ON A.id = B.mission_id
      WHERE
        \`type\` <> 'attendance'
      ORDER BY category, \`order\`
  `;
  var params = [userId];

  var missionList = await db.dbQuery(qry, params);

  var categoryList = [];
  var mission = {};

  for(var i = 0; i < missionList.length; i++){
    if(categoryList.indexOf(missionList[i].category) == -1){
      categoryList.push(missionList[i].category);
      mission[missionList[i].category] = [];
    }
    mission[missionList[i].category].push(missionList[i]);
  }

  res.render("index", { isLogin: req.isAuthenticated(), user: user, mission : mission });
});

// twitterSuccess
router.get("/twitterSuccess", async (req, res) => {
  
  res.render("twitterSuccess");
});

// test
router.get("/test", async (req, res) => {

  var user = {};
  var userId = -1;
  var attd = {
    continuityAttd : 0,
    todayAttd : false
  };

  if (req.isAuthenticated()) {
    user = {
      id: req.user.id,
      name: req.user.name,
      address: req.user.address,
      twitter_id: req.user.twitter_id,
      discord_id: req.user.discord_id,
      point: req.user.point
    };

    userId = req.user.id;

    // 연속 출석
    qry = `
      SELECT 
          attendance_date, point 
      FROM attendance
      WHERE user_id = ?
      AND attendance_date = current_date() - INTERVAL 1 DAY
    `;
    params = [req.user.id];
    var attdClrRst = await db.dbQuery(qry, params);

    if(attdClrRst.length > 0 && attdClrRst[0].point != 7){
      attd.continuityAttd = attdClrRst[0].point;
    }
    
    // 오늘 출석
    qry = `
      SELECT 
          attendance_date, point 
      FROM attendance
      WHERE user_id = ?
      AND attendance_date = current_date()
    `;
    params = [req.user.id];
    attdClrRst = await db.dbQuery(qry, params);

    if(attdClrRst.length > 0){
      attd.todayAttd = true;
    }
  }

  var qry = `
      SELECT
          A.id, A.title, A.point, 
          A.category, A.type, A.repeat, 
          A.link, A.rewardLink, A.value, A.order, 
          case when (B.complete is null) then false else true end as complete
      FROM 
        mission as A
      LEFT JOIN
        (
          SELECT id, mission_id, true as complete 
          FROM mission_complete
          WHERE user_id = ?
        ) as B
      ON A.id = B.mission_id
      WHERE
        \`type\` <> 'attendance'
      ORDER BY category, \`order\`
  `;
  var params = [userId];

  var missionList = await db.dbQuery(qry, params);

  var categoryList = [];
  var mission = {};

  for(var i = 0; i < missionList.length; i++){
    if(categoryList.indexOf(missionList[i].category) == -1){
      categoryList.push(missionList[i].category);
      mission[missionList[i].category] = [];
    }
    mission[missionList[i].category].push(missionList[i]);
  }

  res.render("test", { isLogin: req.isAuthenticated(), user: user, mission : mission, attd : attd });
});

module.exports = router;
