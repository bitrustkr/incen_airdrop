
var Web3EthAbi = require('web3-eth-abi');
var Web3Utils = require('web3-utils');

// login이 최초로 성공했을 때만 호출되는 함수
// done(null, {id: user.id, point: user.point, provider: user.provider, provider_id: user.provider_id, email: user.email, name: user.given_name})로 세션을 초기화 한다.
passport.serializeUser(function (user, done) {
    // done(null, {id: user.id, point: user.point, provider: user.provider, address: user.address});
    done(null, {id: user.id, twitter_id: user.provider_id, name: user.name, address: user.address, discord_id: user.discord_id, point: user.point, token: user.token});
});

// 사용자가 페이지를 방문할 때마다 호출되는 함수
passport.deserializeUser(function (user, done) {
    done(null, user);
});

// metamask login
// passport.use(
//     new LocalStrategy(
//         {
//             usernameField: 'address', // req.body.email
//             passwordField: 'hash',
//             passReqToCallback: true
//         },
//         async function (req, address, hash, done) {
//             console.log('local storage');
//             try{
//                 if(!await common.validateAddr(req.body.address)) {
//                     console.log('validate error : address');
//                     console.log(req.body.address);
              
//                     done(null, false, { message: 'validate error.' });
//                 }
              
//                 if(!await common.validateNum(req.body.deadline)) {
//                     console.log('validate error : deadline');
//                     console.log(req.body.deadline);
              
//                     done(null, false, { message: 'validate error.' });
//                 }
              
//                 if(!await common.validateHex(req.body.hash)) {
//                     console.log('validate error : hash');
//                     console.log(req.body.hash);
              
//                     done(null, false, { message: 'validate error.' });
//                 }
                
//                 var address = req.body.address.toLowerCase();
//                 var deadline = req.body.deadline;
//                 var bodyHash = req.body.hash.toLowerCase();
//                 var key = process.env.METAMASK_SIGH_KEY;
              
//                 var c = Web3EthAbi.encodeParameters(['bytes32', 'address', 'string', 'uint', 'string'], 
//                 [Web3Utils.keccak256("Content(address account,string key,uint deadline,string key)"), 
//                 address, key, deadline, key]);
              
//                 var d = Web3Utils.keccak256(c);
//                 d = d.toLowerCase();
              
//                 console.log('Make Hash');
              
//                 if(d !== bodyHash) {
//                   console.log('diffrent hash');
//                   console.log(d);
//                   console.log(bodyHash);
              
//                   done(null, false, { message: 'login failed.' });
//                 }
              
//                 console.log('hash check success');

//                 var qry = `
//                     SELECT
//                         *
//                     FROM users
//                     WHERE
//                         provider = 'metamask'
//                         AND address = ?
//                 `;
//                 var params = [req.body.address];

//                 var rst = await db.dbQuery(qry, params);
              
//                 console.log('get Users db');

//                 qry = `
//                     INSERT INTO 
//                         login_history
//                     (
//                         address, hash, deadline
//                     )
//                     VALUES
//                     (
//                         ?, ?, ?
//                     )
//                 `;

//                 params = [req.body.address, req.body.hash, req.body.deadline];

//                 await db.dbQuery(qry, params);
              
//                 console.log('insert history db');
                
//                 // 회원 등록
//                 if(rst.length == 0){
//                     qry = `
//                         INSERT INTO 
//                             users
//                         (
//                             provider, address
//                         )
//                         VALUES
//                         (
//                             ?, ?
//                         )
//                     `;

//                     params = ['metamask', req.body.address];

//                     rst = await db.dbQuery(qry, params);
              
//                     console.log('insert Users db');

//                     if(rst.affectedRows != 1 || rst.insertId < 1) {
//                         console.log('DB INSERT ERROR');
                        
//                         done(null, false, { message: 'DB INSERT ERROR.' });
//                     } else {
//                         var qry = `
//                         SELECT
//                             *
//                         FROM users
//                         WHERE
//                             provider = 'metamask'
//                             AND address = ?
//                         `;
//                         params = [req.body.address];

//                         rst = await db.dbQuery(qry, params);
//                     }
//                 }

//                 return done(null, rst[0]);
//             } catch (error) {
//                 console.log(error);
//                 req.next(error);
//             }

//             // return done(null, profile);
//         }
//     )
// );

// test login
passport.use(
    'twitter', new LocalStrategy(
        {
            usernameField: 'id', // req.body.email
            passwordField: 'access_token',
            passReqToCallback: true
        },
        async function (req, id, access_token, done) {
            try{
                var qry = `
                    SELECT
                        *
                    FROM users
                    WHERE
                        provider = 'twitter'
                        AND provider_id = ?
                `;
                var params = [req.body.id];

                var rst = await db.dbQuery(qry, params);
              
                console.log('get Users db');

                qry = `
                    INSERT INTO 
                        login_history
                    (
                        provider_id
                    )
                    VALUES
                    (
                        ?
                    )
                `;

                params = [req.body.id];

                await db.dbQuery(qry, params);
              
                console.log('insert history db');
                
                // 회원 등록
                if(rst.length == 0){
                    // to-do referral
                    var referral = req.body.referral;

                    if(referral){
                    
                        qry = `
                            INSERT INTO 
                                users
                            (
                                provider, provider_id, name, referral_id
                            )
                            VALUES
                            (
                                ?, ?, ?, ?
                            )
                        `;
    
                        params = ['twitter', req.body.id, req.body.username, referral];
                    }else{
                    
                        qry = `
                            INSERT INTO 
                                users
                            (
                                provider, provider_id, name
                            )
                            VALUES
                            (
                                ?, ?, ?
                            )
                        `;
    
                        params = ['twitter', req.body.id, req.body.username];
                    }

                    rst = await db.dbQuery(qry, params);
              
                    console.log('insert Users db');

                    if(rst.affectedRows != 1 || rst.insertId < 1) {
                        console.log('DB INSERT ERROR');
                        
                        return done(null, false, { message: 'DB INSERT ERROR.' });
                    } else {

                        var qry = `
                        SELECT
                            *
                        FROM users
                        WHERE
                            provider = 'twitter'
                            AND provider_id = ?
                        `;
                        params = [req.body.id];

                        rst = await db.dbQuery(qry, params);

                        qry = `
                            INSERT INTO 
                                users_twitter
                            (
                                id, user_id, name, user_name
                            )
                            VALUES
                            (
                                ?, ?, ?, ?
                            )
                        `;
    
                        params = [req.body.id, rst[0].id, req.body.name, req.body.username];
    
                        insertRst = await db.dbQuery(qry, params);
                  
                        console.log('insert users_twitter db');
    
                        if(insertRst.affectedRows != 1) {
                            console.log('DB INSERT ERROR');
                            
                            return done(null, false, { message: 'DB INSERT ERROR.' });
                        }
                    }
                }

                console.log(req.body.id);
                console.log(req.body.access_token);
                console.log(req.body.username);

                rst[0].token = req.body.access_token

                return done(null, rst[0]);
            } catch (error) {
                console.log(error);
                req.next(error);
            }

            // return done(null, profile);
        }
    )
);