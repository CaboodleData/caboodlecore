import { getCollection, putItems, updateItem, getItem, clearCollection } from './db';
import { getAuthToken } from './token';
import axios from 'axios';
import { APP_EGINE_API_URL } from './constants';

/* Fetches Reports - First Checks if the Collection Exists if not then it does an http to fetch all Reports then it save it local and send the result out*/
export function fetchReports(cleared, formatFieldNamesInDef) {
    return new Promise((resolve, reject) => {
        getCollection('reports').then((reports) => {
            if (reports && !cleared) {
                resolve(reports);
            } else {
                getAuthToken().then((token) => {
                    axios({
                        url: `${APP_EGINE_API_URL}/reports/get`, method: 'GET', headers: { "authorization": `Bearer ${token.token}` }
                    }).then(function (response) {
                        if (formatFieldNamesInDef) formatFieldNamesInDef(response.data);
                        putItems('reports', response.data).then((res) => {
                            resolve(res);
                        }).catch((err) => {
                            reject(err);
                        });
                    });
                });
            }
        });
    });
}

export function updateReport(report) {
    return new Promise((resolve, reject) => {
        getAuthToken().then((token) => {
            updateItem('reports', report).then(() => {
                const creds = token.token;
                axios({ url: `${APP_EGINE_API_URL}/report/put`, method: 'POST', headers: { "Authorization": `Bearer ${creds}` }, data: report })
                    .then(() => { resolve(); })
                    .catch(() => { reject(); });
            });
        });
    });
}

export function fetchReport(id) {
    return new Promise((resolve, reject) => {
        getItem('reports', 'reportid', id).then((report) => {
            resolve(report);
        }).catch((e) => {
            reject(e);
        });
    });
}

export function refreshReport() {
    return new Promise((resolve, reject) => {
        clearCollection('reports').then(() => {
            fetchReports(true).then((data) => {
                resolve(data);
            }).catch((error) => {
                reject(error);
            });
        });
    });
}