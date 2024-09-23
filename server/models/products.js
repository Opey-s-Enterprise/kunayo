const db = require('../routes/db');

class Product{
    static getAll(callback){
        db.query('select * from products', (err, results) => {
            if (err) throw err;
            callback (results);
        });
    };
};

module.exports = Product;