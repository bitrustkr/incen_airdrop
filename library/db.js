var mysql = require('mysql2/promise');
var db_config = require('../config/db_config');
var pool = mysql.createPool(db_config);

exports.db_config = db_config;

/* +++++++++++++++++++++++++++++ DB Functions +++++++++++++++++++++++++++++ */

exports.transBegin = async function (connection = undefined, logFileId = '', logFileNm = '') {
    await common.logMsg('transaction begin...', logFileId, logFileNm);
    /** DB 컨넥션 시작 */
    var con;

    if (connection == undefined) {
        con = await pool.getConnection(async conn => conn);
    } else {
        con = connection;
    }

    // await con.beginTransaction();
    con.connection.beginTransaction();

    return con;
};

exports.dbQuery = async function (qry, params, connection = undefined) {
    var con;

    if (connection == undefined) {
        con = await pool.getConnection(async conn => conn);
    } else {
        con = connection;
    }

    /** callback 으로 받은 쿼리 실행 및 에러 처리 */
    var result = await con.query(qry, params);

    if (connection == undefined) {
        // await con.release();
        await con.connection.release();
    }

    return result[0];
};

exports.transRollback = async function (con = undefined, logFileId = '', logFileNm = '') {
    await common.logMsg('transaction rollback...', logFileId, logFileNm);

    if (con == undefined) {
        throw new Error('trans rollback function error :: connection undefined');
    }

    /** DB rollback */
    await con.rollback();

    /** DB connection close */
    // await con.release();
    await con.connection.release();
};

exports.transEnd = async function (con = undefined, logFileId = '', logFileNm = '') {
    await common.logMsg('transaction end...', logFileId, logFileNm);

    if (con == undefined) {
        throw new Error('trans end function error :: connection undefined');
    }

    /** DB commit */
    await con.commit();

    /** DB connection close */
    // await con.release();
    await con.connection.release();
};

// 쿼리 where 절 추가 공통화
exports.makeWhereState = async function (params, logFileId = '', logFileNm = '') {
    var where = '';
    var operator = ' WHERE ';
    var values = [];

    for (key in params) {
        where += operator;
        if (Array.isArray(params[key])) {
            var paramVal = params[key];
            var comma = '';
            where += key + ' IN ( ';
            for (key2 in paramVal) {
                where += comma + ' ? ';
                values.push(paramVal[key2]);
                comma = ', ';
            }
            where += ' ) ';
        } else {
            where += key + ' = ?';
            values.push(params[key]);
        }
        operator = ' AND ';
    }

    return [where, values];
};

/* +++++++++++++++++++++++++++++ DB Functions +++++++++++++++++++++++++++++ */
