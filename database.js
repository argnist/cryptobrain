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
            new Promise((resolve, reject) => {
                db.find(query).sort(sort).exec((err, data) => {
                    if (err !== null) return reject(err);
                    resolve(data);
                });
            }),
        remove: (query = {}, options = {}) =>
            new Promise((resolve, reject) => {
                db.remove(query, options, (err, numRemoved) => {
                    if (err !== null) return reject(err);
                    resolve(numRemoved);
                });
            })
    }
};

module.exports = Db;