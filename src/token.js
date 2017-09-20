import { getCollection, putItem, removeItem } from './db';

export function getAuthToken() {
    return new Promise((resolve, reject) => {
        getCollection('user_rec').then((res) => {
            if (!res || !res.length) {
                resolve(null);
            } else {
                resolve(res[0]);
            }
        }).catch((err) => {
            reject(err);
        });
    });
}

export function addAuthToken(token) {
    return new Promise((resolve, reject) => {
        putItem('user_rec', { token }).then(() => {
            resolve();
        }).catch((err) => {
            reject(err);
        });
    });
}

export function clearAuthToken() {
    removeItem();
}