var chai = require('chai');
import Datastore from './../src/db.js';
var expect = chai.expect;
var chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);

describe('Testing Datastore', () => {
    let _datastore = null

    beforeEach(() => {
        // Create a new Rectangle object before every test.
        _datastore = new Datastore(true);
    });

    it('Create a table in the datastore', () => {
        return expect(_datastore.createCollection('tdd_collection')).to.eventually.equal(true);
        done()
    });

    it('insert single line of data into a table', () => {
        var data = {
            name: "john",
            surname: "doe",
            age: "40",
            id: "001EE"
        }
        //Get it to check the inserstion property in the meta object
        return expect(_datastore.putItem('tdd_collection', data)).to.eventually.be.an('object');
        done();
    });

    it('insert multiple lines of data into a table', () => {
        var data = [{
            name: "john",
            surname: "doe",
            age: "40",
            id: "001EE"
        }, {
            name: "Jane",
            surname: "Smith",
            age: "25",
            id: "001DD"
        }]
        return expect(_datastore.putItems('tdd_collection', data)).to.eventually.be.an('array');
        done();
    });

    it('update data in a table', () => {
        var data = {
            name: "john",
            surname: "doe",
            age: "40",
            id: "001DDNN"
        }
        //Get it to check the inserstion property in the meta object
        return expect(_datastore.putItem('tdd_collection', data)).to.eventually.be.an('object');
        done();
    })

    it('delete data from a table', () => {
        var data = {
            name: "john",
            surname: "doe",
            age: "40",
            id: "001EE"
        }
        _datastore.putItem('tdd_collection', data).then(() => {
            return expect(_datastore.removeItem('tdd_collection', data)).to.eventually.be.an(true);
            done();
        }).catch((e) => {
            expect.fail()
        });
        //Get it to check the inserstion property in the meta object    
    });
    it('clear a table')
    it('delete a table')
});