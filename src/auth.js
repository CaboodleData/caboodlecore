// NB - JWT REQUIRED THIS WILL BE USED ACROSS PLATFORM SO STANDIZE IT
// When this site is being used across many places we just need

// Clean this up for better use in the core
import axios from 'axios';
import { deleteDB } from './dataHandler';
import { getAuthToken } from './token';
// 1. Login with proper credentials (Login as a Post)
// 2. Check that user is logged in and Token is still valid
export function isLoggedIn() {
    // This will Probably do a quick http request to check if the session is still valid.
    // In theory if there is no token then should get a 401
    // Also if the cookie is present but expired the server will return a 401 and also unset the cookie to ensure that all clean up.
    // One thing to be careful is the expiration time so that it doesn't expire during transactions - Single signon kind of Idea
    // We are Probably going to have a blacklist database with all signed out tokens so our is logged in check must also check if this exist on that table.
    // return localStorage.getItem('userLoggedIn') ? true : false;
    return new Promise((resolve) => {
        getAuthToken().then((token) => {
            resolve(token ? true : false);
        }).catch(() => {
            resolve(false);
        });
    });
}

//New Signout
export function signOut() {
    return new Promise((resolve, reject) => {
        getAuthToken().then((token) => {
            axios({
                url: `http://localhost:8080/logout`,
                method: 'post',
                headers: { "Authorization": `Bearer ${token.token}` }
            }).then(() => {
                deleteDB().then(() => {
                    sessionStorage.clear();
                    localStorage.clear();
                    resolve();
                }).catch((err) => {
                    reject(err);
                });
            }).catch(() => {
                //console.log('error logging out');      
            });
        });
    });
}

/* Called when the user is unauthorized and we need to log them out */
export function unAuthLogOut() {
    return signOut();
}