const Sequelize = require('sequelize');
const MYSQL_CONF = require('./config.js');
console.log('init sequelize...');
console.log('host is ' + MYSQL_CONF.host)
console.log('database is ' + MYSQL_CONF.database)
console.log('username is ' + MYSQL_CONF.username)
console.log('password is ' + MYSQL_CONF.password)


var sequelize = new Sequelize(MYSQL_CONF.database, MYSQL_CONF.username, MYSQL_CONF.password, {
    host: MYSQL_CONF.host,
    dialect: 'mysql',
    pool: {
        max: 5,
        min: 0,
        idle: 10000
    }
});

// const ID_TYPE = Sequelize.STRING(50);

Sequelize.defineModel = function (name, attributes) {
    var attrs = {};
    for (let key in attributes) {
        let value = attributes[key];
        if (typeof value === 'object' && value['type']) {
            value.allowNull = value.allowNull || false;
            attrs[key] = value;
        } else {
            attrs[key] = {
                type: value,
                allowNull: false
            };
        }
    }

    // attrs.id = {
    //     type: ID_TYPE,
    //     primaryKey: true
    // };
    // attrs.createdAt = {
    //     type: Sequelize.BIGINT,
    //     allowNull: false
    // };
    // attrs.updatedAt = {
    //     type: Sequelize.BIGINT,
    //     allowNull: false
    // };
    // attrs.version = {
    //     type: Sequelize.BIGINT,
    //     allowNull: false
    // };
    return sequelize.define(name, attrs, {
        tableName: name,
        timestamps: false,
        hooks: {
            beforeValidate: function (obj) {
                let now = Date.now();
                if (obj.isNewRecord) {
                    if (!obj.id) {
                        obj.id = generateId();
                    }
                    obj.createdAt = now;
                    obj.updatedAt = now;
                    obj.version = 0;
                } else {
                    obj.updatedAt = Date.now();
                    obj.version++;
                }
            }
        }
    });
}
module.exports = Sequelize;