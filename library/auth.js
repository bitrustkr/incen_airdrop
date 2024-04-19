
var Web3EthAbi = require('web3-eth-abi');
var Web3Utils = require('web3-utils');

// login이 최초로 성공했을 때만 호출되는 함수
// done(null, {id: user.id, point: user.point, provider: user.provider, provider_id: user.provider_id, email: user.email, name: user.given_name})로 세션을 초기화 한다.
passport.serializeUser(function (user, done) {
    done(null, {id: user.id, point: user.point, provider: user.provider, address: user.address});
});

// 사용자가 페이지를 방문할 때마다 호출되는 함수
passport.deserializeUser(function (user, done) {
    done(null, user);
});

// metamask login
passport.use(
    new LocalStrategy(
        {
            usernameField: 'address', // req.body.email
            passwordField: 'hash',
            passReqToCallback: true
        },
        async function (req, address, hash, done) {
            console.log('local storage');
            try{
                if(!await common.validateAddr(req.body.address)) {
                    console.log('validate error : address');
                    console.log(req.body.address);
              
                    done(null, false, { message: 'validate error.' });
                }
              
                if(!await common.validateNum(req.body.deadline)) {
                    console.log('validate error : deadline');
                    console.log(req.body.deadline);
              
                    done(null, false, { message: 'validate error.' });
                }
              
                if(!await common.validateHex(req.body.hash)) {
                    console.log('validate error : hash');
                    console.log(req.body.hash);
              
                    done(null, false, { message: 'validate error.' });
                }
                
                var address = req.body.address.toLowerCase();
                var deadline = req.body.deadline;
                var bodyHash = req.body.hash.toLowerCase();
                var key = process.env.METAMASK_SIGH_KEY;
              
                var c = Web3EthAbi.encodeParameters(['bytes32', 'address', 'string', 'uint', 'string'], 
                [Web3Utils.keccak256("Content(address account,string key,uint deadline,string key)"), 
                address, key, deadline, key]);
              
                var d = Web3Utils.keccak256(c);
                d = d.toLowerCase();
              
                console.log('Make Hash');
              
                if(d !== bodyHash) {
                  console.log('diffrent hash');
                  console.log(d);
                  console.log(bodyHash);
              
                  done(null, false, { message: 'login failed.' });
                }
              
                console.log('hash check success');

                var qry = `
                    SELECT
                        *
                    FROM users
                    WHERE
                        provider = 'metamask'
                        AND address = ?
                `;
                var params = [req.body.address];

                var rst = await db.dbQuery(qry, params);
              
                console.log('get Users db');

                qry = `
                    INSERT INTO 
                        login_history
                    (
                        address, hash, deadline
                    )
                    VALUES
                    (
                        ?, ?, ?
                    )
                `;

                params = [req.body.address, req.body.hash, req.body.deadline];

                await db.dbQuery(qry, params);
              
                console.log('insert history db');
                
                // 회원 등록
                if(rst.length == 0){
                    qry = `
                        INSERT INTO 
                            users
                        (
                            provider, address
                        )
                        VALUES
                        (
                            ?, ?
                        )
                    `;

                    params = ['metamask', req.body.address];

                    rst = await db.dbQuery(qry, params);
              
                    console.log('insert Users db');

                    if(rst.affectedRows != 1 || rst.insertId < 1) {
                        console.log('DB INSERT ERROR');
                        
                        done(null, false, { message: 'DB INSERT ERROR.' });
                    } else {
                        var qry = `
                        SELECT
                            *
                        FROM users
                        WHERE
                            provider = 'metamask'
                            AND address = ?
                        `;
                        params = [req.body.address];

                        rst = await db.dbQuery(qry, params);
                    }
                }

                return done(null, rst[0]);
            } catch (error) {
                console.log(error);
                req.next(error);
            }

            // return done(null, profile);
        }
    )
);