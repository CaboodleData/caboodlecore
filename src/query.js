import { getCollection, putItems, collectionExists, createCollection,clearCollection } from './db';
import { getAuthToken } from './token';
import axios from 'axios';
import { APP_EGINE_API_URL } from './constants';

export function runQuery(query, cleared, params, values) {
    return new Promise((resolve, reject) => {
        collectionExists(query).then((_exists) => {
            if (_exists && !cleared) {
                getCollection(query).then((data) => {
                    resolve(data);
                });
            } else {
                getAuthToken().then((token) => {
                    //Clean this up asap
                    const creds = token.token;
                    //Revert back to this when CAPI matches the application, and also use to constants URL
                    //Send in the url as a parameter
                    axios.get(`${APP_EGINE_API_URL}/query/run?name=${query}`, { headers: { "Authorization": `Bearer ${creds}` } })
                        .then((response) => {
                            var headings = response.data.headings;
                            var data = response.data.data;
                            var types = response.data.types;
                            let transformedData = data.map((el) => {
                                var ob = {};
                                el.forEach((o, idx) => {
                                    if (types[idx].toLowerCase().indexOf("float") > -1) {
                                        ob[headings[idx]] = parseFloat(o);
                                    } else if (types[idx].toLowerCase().indexOf("int") > -1) {
                                        ob[headings[idx]] = parseInt(o);
                                    } else {
                                        ob[headings[idx]] = o;
                                    }
                                });
                                return ob;
                            });
                            if (!_exists) { //You can really clean this part up
                                createCollection(query).then(() => {
                                    putItems(query, transformedData).then(() => {
                                        getCollection(query, params, values).then((data) => {
                                            resolve(data);
                                        });
                                    });
                                }).catch((e) => {
                                    reject(e);
                                });
                            } else {
                                putItems(query, transformedData).then(() => {
                                    getCollection(query, params, values).then((data) => {
                                        resolve(data);
                                    });
                                });
                            }
                            //saveLastRefreshedDate(connection, queryid);
                        }).catch(function (error) {
                            reject(error.stack);
                        });
                });
            }
        });
    });
}

//TODO Need to cater for multiple parameters
export function refreshQuery(query,params,values){
    return new Promise((resolve,reject) => {
        clearCollection(query).then(() => {
            runQuery(query, true,params,values);
        }).catch((e) => {
            reject(e);
        });
    });
}
