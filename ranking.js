const db     = require('./library/db');
global.common = require('./library/common');
const schedule = require('node-schedule');

const job = schedule.scheduleJob('*/5 * * * *', function(){
  ranking();
});
async function ranking(){
        
    var con;
    try{
        console.log('ranking system start');

        con = await db.transBegin();
        qry = `
        SELECT 
            *
        FROM users
        ORDER BY point DESC
        LIMIT 100
        `;
        params = [];
        userRst = await db.dbQuery(qry, params, con);

        qry = `
        TRUNCATE point_rank
        `;
        params = [];
        await db.dbQuery(qry, params, con);

        qry = `
            INSERT INTO
                \`point_rank\`
            (\`user_id\`, \`name\`, \`point\`, \`rank\`)
            VALUES
        `;

        var beforePoint = 0;
        var comma = '';
        var rank = 0;
        for(var i = 0; i < userRst.length && i < 100; i++){
            if (i == 0 || beforePoint > userRst[i].point){
                beforePoint = userRst[i].point;
                rank = i + 1;
            }
            
            qry += comma + `
                (\'${userRst[i].id}\', \'${userRst[i].name}\', ${userRst[i].point}, ${rank})
            `;

            comma = ',';
        }

        qry += ';';

        params = [];
        await db.dbQuery(qry, params, con);

        await db.transEnd(con);

        console.log('ranking system end');

    }catch (error){
        if(con != undefined){
            await db.transRollback(con);
        }
    }

	return 0;
}