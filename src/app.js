import Datastore from './db';

var d1 = new Datastore(true);
var data = {
    name : "john",
    surname : "doe",
    age : "40",
    id : "001EE"
}

d1.createCollection('test_col').then((res) => {
    d1.putItems('test_col',data).then((res) => {
        console.log(res)
        data.id = '001DE'
        d1.updateItem('test_col',data).then((d) => {
            console.log(d)
        }).catch((e) => {
            console.log(e)
        });
    })
}).catch((err) => {
    console.log(err);
});

