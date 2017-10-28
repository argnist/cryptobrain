const Datastore = require('nedb');

const db1 = new Datastore({filename: 'history'});
db1.loadDatabase();
db1.ensureIndex({fieldName: 'key', unique: true});
db1.ensureIndex({fieldName: 'time'});

const db2 = new Datastore({filename: 'train'});
db2.loadDatabase();
db2.ensureIndex({fieldName: 'key', unique: true});

const databases = {
    history: db1,
    train: db2
};


const Db = (key) => {
    const db = databases[key];
    return {
        insert: (data) => db.insert(data),
        find: (query, sort = {}) =>
            new Promise(function (resolve, reject) {
                db.find(query).sort(sort).exec(function (err, data) {
                    if (err !== null) return reject(err);
                    resolve(data);
                });
            })
    };
};

module.exports = Db;