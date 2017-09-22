var chai = require('chai');
import Authenticator from './../src/authenticator.js';
var expect = chai.expect;
var chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);

describe('Authenticator Class', () => {
    let _auth = null;
    beforeEach(() => {
        _auth = new Authenticator({ testing: true });
    });

    it('Pass Authenication', () => {
        return expect(_auth.getToken('./test_data/login.json', 'a2V2aW46cGFzc3dvcmQ=')).to.eventually.eql({ error: null, token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJrZXZpbkByYXBpZHRyYWRlLmJpeiIsImV4cCI6MTUwNTkxMjA1NCwiaXNzIjoiU2VydmVyIn0.dpuUAE5wHUiO77vyZgkmryyGh153_4dIXRPdMPsw8EI" });
    });

    it('Fail Authenication', () => {
        return expect(_auth.getToken('./test_data/login.json', 'a2V2aW46cGFzc3dvcmQ=')).to.eventually.eql({ error: "Authentication Error. Could not retrieve token", token: "" });
    });

    it('Successful HTTP GET', () => {
        return expect(_auth.get('./test_data/200_get.json')).to.eventually.eql({ status : 200 , error: "", data: {} }); 
    });

    it('Successful HTTP POST', () => {
        return expect(_auth.post('./test_data/200_post.json',{})).to.eventually.eql({ status : 200 , error: "", data: {} });
    });

    it('Hanlde HTTP GET 500 Error', () => {
        return expect(_auth.get('./test_data/500_get.json')).to.eventually.eql({ status : 500 , error: "", data: {} });         
    });

    it('Hanlde HTTP POST 500 Error', () => {
        return expect(_auth.get('./test_data/500_post.json')).to.eventually.eql({ status : 500 , error: "Some Error", data: null });         
    });

    it('Invalid Token', () => {
        return expect(_auth.get('./test_data/invalid_get.json')).to.eventually.eql({ status : 401 , error: "Invalid Token", data: null });         
    });

    it('Expired Token',() => {
        return expect(_auth.get('./test_data/expired_get.json')).to.eventually.eql({ status : 401 , error: "Token Expired", data: null });         
    });
});