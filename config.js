const env = process.env.NODE_ENV

let MYSQL_CONF
//sequelize数据库配置文件
if (env === 'dev') {
    MYSQL_CONF = {
        database: 'soup',
        username: 'root',
        password: '',
        host: '127.0.0.1',
        port: 3306
    }
}
if(env === 'prd'){
    MYSQL_CONF = {
        database: 'soup',
        username: 'root',
        password: '1362061587',
        host: '120.77.168.250',
        port: 3306
    }
}


module.exports = MYSQL_CONF;