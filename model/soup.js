 const db = require('../db');
 module.exports = db.defineModel('test', {
     quot: {
         type: db.STRING(500),
        //  unique: true
     }, 
     from: db.STRING(500),
 });