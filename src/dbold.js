import Loki from 'lokijs';

let databaseConnection = null;

//Add db name to make it more generic
function getDBConnection() {
    return new Promise((resolve) => {
        if (databaseConnection) {
            resolve(databaseConnection);
        } else {
            //for persistency we use the indexedDB persistent adapter
            //Get a Reference to the require of the adapter since we can not get via an import
            var adapterRef = new Loki().getIndexedAdapter();
            var idbAdapter = new adapterRef('caboodle'); //initialize a new indexDB adapter
            //Instantiating the new database - NB, autoload is important for anytime you are going to use persistent storage
            //Keep a close watch to see what overhead is presented when throttledSaves is set to false and see how we can solve this problem
            let opt = { adapter: idbAdapter, throttledSaves: false, autosave: true, autosaveInterval: 1000, autoload: true };
            var db = new Loki('caboodle.db', opt);
            db.loadDatabase({}, () => {
                databaseConnection = db;
                resolve(databaseConnection);
            });
        }
    });
}

//Check if the collection sent in exists
export function collectionExists(collection) {
    return new Promise((resolve, reject) => {
        getDBConnection().then((connection) => {
            try {
                let _col = connection.getCollection(collection);
                resolve(_col ? true : false);
            } catch (e) {
                reject(e);
            }
        });
    });
}

//Get all the from a collection
export function getCollection(collection,params,values) {
    return new Promise((resolve, reject) => {
        getDBConnection().then((connection) => {
            try {
                let _col = connection.getCollection(collection);
                if (!_col) {
                    resolve(null); //assume that null is no table found but don't want to throw an exception
                } else {
                    if(params && values) {
                        resolve(_col.find());
                    } else {
                        resolve(_col.where((o) => {
                            return o[params].toLowerCase() === values.toLowerCase();  
                        }));
                    } 
                }
            } catch (e) {
                reject(e);
            }
        });
    });
}


//Get a single item from a collection. 
export function getItem(collection, field, value) {
    return new Promise((resolve, reject) => {
        getDBConnection().then((connection) => {
            try {
                var _collection = connection.getCollection(collection);
                var result = _collection.findOne({ field: value });
                resolve(result);
            } catch (error) {
                reject(error);
            }
        });
    });
}

/* * Puts in a single object into a collection. */
export function putItem(collection, item) {
    return new Promise((resolve, reject) => {
        getDBConnection().then((connection) => {
            try {
                var _collection = connection.getCollection(collection);
                if (!_collection) {
                    _collection = connection.addCollection(collection);
                    saveDatabase().then(() => {
                        _collection = connection.getCollection(collection);
                        var result = _collection.insert(item);
                        saveDatabase().then(() => { resolve(result); });
                    });
                } else {
                    var result = _collection.insert(item);
                    saveDatabase().then(() => { resolve(result); });
                }
            } catch (error) {
                reject(error);
            }
        });
    });
}

/* * Puts in a single object into a collection. */
export function updateItem(collection, item) {
    return new Promise((resolve, reject) => {
        getDBConnection().then((connection) => {
            try {
                var _collection = connection.getCollection(collection);
                var result = _collection.update(item);
                saveDatabase().then(() => { resolve(result); });
            } catch (error) {
                reject(error);
            }
        });
    });
}

//Collection inserts handle array of data as well, I just separated the functions to keep the naming clean
export function putItems(collection, items) {
    return putItem(collection, items);
}

//Get a single item from a collection. 
export function removeItem(collection, item) {
    return new Promise((resolve, reject) => {
        getDBConnection().then((connection) => {
            try {
                var _collection = connection.getCollection(collection);
                var result = _collection.remove(item);
                saveDatabase().then(() => { resolve(result); });
            } catch (error) {
                reject(error);
            }
        });
    });
}

//Get a single item from a collection. 
export function removeItemWhere(collection, clause) {
    return new Promise((resolve, reject) => {
        getDBConnection().then((connection) => {
            try {
                var _collection = connection.getCollection(collection);
                var result = _collection.removeWhere(clause);
                saveDatabase().then(() => { resolve(result); });
            } catch (error) {
                reject(error);
            }
        });
    });
}

//Get Items via where clause
//You can move this to a single get and just pass in the where fields as an optional parameters
//And the Method figures out whether to Run the where clause or Not
export function getItemsViaConditions(collection, params, values) {
    return new Promise((resolve, reject) => {
        getDBConnection().then((connection) => {
            try {
                let _collection = connection.getCollection(collection);
                var result = _collection.where((o) => {
                    return o[params] === values;
                });
                resolve(result);
            } catch (error) {
                reject(error);
            }
        });
    });
}

export function createCollection(collection) {
    return new Promise((resolve, reject) => {
        getDBConnection().then((connection) => {
            try {
                let _collection = connection.addCollection(collection);
                saveDatabase().then(() => { resolve(_collection); });
            } catch (error) {
                reject(error);
            }
        });
    });
}

export function clearCollection(collection) {
    return new Promise((resolve, reject) => {
        getDBConnection().then((connection) => {
            try {
                let _collection = connection.addCollection(collection);
                _collection.clear();
                saveDatabase().then(() => { resolve(); });
            } catch (error) {
                reject(error);
            }
        });
    });
}

export function deleteCollection(collection) {
    return new Promise((resolve, reject) => {
        getDBConnection().then((connection) => {
            try {
                let _collection = connection.addCollection(collection);
                _collection.clear();
                saveDatabase().then(() => { resolve(); });
            } catch (error) {
                reject(error);
            }
        });
    });
}

//Save the Database Transaction after insertion, deletion, or update
export function saveDatabase() {
    return new Promise((resolve) => {
        getDBConnection().then((connection) => {
            connection.saveDatabase(() => {
                resolve();
            });
        });
    });
}