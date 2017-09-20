import Loki from 'lokijs';
import LokiReactNativeAdapter from 'loki-react-native-adapter'

let instance = null;
let databaseConnection = null;

class Datastore {
  constructor(opts) {
    if (!instance) {
      instance = this;
      if (opts) {
        this.opts = {}
        this.opts.native = opts.native;
        this.opts.testing = opts.testing;
      }
    }

    return instance;
  }

  /** Returns a a Promise with the database connection when resolved
   *  @returns {Promise<Object>} 
   */
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
        if (this.opts.native == true) {
          dbAdapter = new LokiReactNativeAdapter();
        } else if (this.opts.testing) {
          dbAdapter = new Loki.LokiMemoryAdapter();
        } else {
          //Instantiating the new database - NB, autoload is important for anytime you are going to use persistent storage
          //Keep a close watch to see what overhead is presented when throttledSaves is set to false and see how we can solve this problem
          var adapterRef = new Loki().getIndexedAdapter();
          dbAdapter = new adapterRef('caboodle'); //initialize a new indexDB adapter
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


  /** Persistenly saves the state of the database.
   *  @returns {Promise<Object>} 
   */
  _saveDatabase() {
    return new Promise((resolve) => {
      this._getDBConnection().then((connection) => {
        connection.saveDatabase(() => { resolve(); });
      });
    });
  }

  /** Create a new table in the data
   *  @param {string} collection 
   *  @returns {promise} 
   */
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

  /** Puts in a single object into a datastore table.
   *  @param {String} collection - The name you want to insert the data into
   *  @param {Object} item - The data you want to insert into the database
   *  @returns {Promise<Object>} 
   */
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

  /** Puts in multiple objects into a datastore table.
   *  @param {String} collection - The name you want to insert the data into
   *  @param {Object[]} items - The data you want to insert into the database
   *  @returns {Promise<Object>} 
   */
  putItems(collection, items) {
    return this.putItem(collection, items);
  }

  /** update an object in a datastore table.
   *  @param {String} collection - The name you want to insert the data into
   *  @param {Object} item - The data you want to update
   *  @returns {Promise<Object>} 
   */
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

  /** Removes an item from a datastore table.
   *  @param {String} collection - The name you want to insert the data into
   *  @param {Object} item - The data you want to delete
   *  @returns {Promise<Object>} 
   */
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

  /** Removes an item from a datastore table.
   *  @param {String} collection - The name of the table you want to clear/delete
   *  @returns {Promise<Boolean>} 
   */
  clearCollection(collection) {
    return new Promise((resolve, reject) => {
      this._getDBConnection().then((connection) => {
        try {
          let _collection = connection.addCollection(collection);
          _collection.clear();
          this._saveDatabase().then(() => { resolve(true); });
        } catch (error) {
          reject(error);
        }
      });
    });
  }
}

export default Datastore;