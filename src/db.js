import Loki from 'lokijs';

/* 
  * Setting up block level variable to store class state
  * , set's to null by default.
*/
let instance = null;
let databaseConnection = null;

class Datastore {
  constructor(isTest) {
    if (!instance) {
      instance = this;
    }

    if (isTest) {
      this._isTest = isTest;
    }
    return instance;
  }

  _getDBConnection() {
    return new Promise((resolve) => {
      if (databaseConnection) {
        resolve(databaseConnection);
      } else {
        //for persistency we use the indexedDB persistent adapter
        //Get a Reference to the require of the adapter since we can not get via an import
        /** TODO 
          -- Cater for ReactNative as well so thats --
          opt = {native: null, testing : null, autosaveInterval : null}
        **/
        var dbAdapter = null;
        if (!this._isTest) {
          var adapterRef = new Loki().getIndexedAdapter();
          dbAdapter = new adapterRef('caboodle'); //initialize a new indexDB adapter
          //Instantiating the new database - NB, autoload is important for anytime you are going to use persistent storage
          //Keep a close watch to see what overhead is presented when throttledSaves is set to false and see how we can solve this problem
        } else {
          dbAdapter = new Loki.LokiMemoryAdapter();
        }

        let opt = { adapter: dbAdapter, throttledSaves: false, autosave: true, autosaveInterval: 1000, autoload: true };
        var db = new Loki('caboodle.db', opt);
        db.loadDatabase({}, () => {
          databaseConnection = db;
          resolve(databaseConnection);
        });
      }
    });
  }

  _saveDatabase() {
    return new Promise((resolve) => {
      this._getDBConnection().then((connection) => {
        connection.saveDatabase(() => { resolve(); });
      });
    });
  }

  createCollection(collection) {
    return new Promise((resolve, reject) => {
      this._getDBConnection().then((connection) => {
        try {
          let _collection = connection.addCollection(collection);
          this._saveDatabase().then(() => { resolve(true); });
        } catch (error) {
          reject(error);
        }
      });
    });
  }

  /* * Puts in a single object into a collection. */
  putItem(collection, item) {
    return new Promise((resolve, reject) => {
      this._getDBConnection().then((connection) => {
        try {
          var _collection = connection.getCollection(collection);
          if (!_collection) {
            _collection = connection.addCollection(collection);
            this._saveDatabase().then(() => {
              _collection = connection.getCollection(collection);
              var result = _collection.insert(item);
              this._saveDatabase().then(() => { resolve(result); });
            });
          } else {
            var result = _collection.insert(item);
            this._saveDatabase().then(() => { resolve(result); });
          }
        } catch (error) {
          reject(error);
        }
      });
    });
  }

  //Collection inserts handle array of data as well, I just separated the functions to keep the naming clean
  putItems(collection, items) {
    return this.putItem(collection, items);
  }

  /* * Puts in a single object into a collection. */
  updateItem(collection, item) {
    return new Promise((resolve, reject) => {
      this._getDBConnection().then((connection) => {
        try {
          var _collection = connection.getCollection(collection);
          var result = _collection.update(item);
          this._saveDatabase().then(() => { resolve(result); });
        } catch (error) {
          reject(error);
        }
      });
    });
  }


removeItem(collection, item) {
  return new Promise((resolve, reject) => {
    this._getDBConnection().then((connection) => {
      try {
        var _collection = connection.getCollection(collection);
        _collection.remove(item);
        this._saveDatabase().then(() => { resolve(true); });
      } catch (error) {
        reject(error);
      }
    });
  });
}

}

export default Datastore;