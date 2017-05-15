/**
 * Created by dosborne on 14/05/17.
 */
"use strict";
const huejay = require('huejay');

class HueBridge {
    constructor() {
        this.ip = null;
        this.username = null;
        this.client = null;
        this.ready = false;
    }

    setup() {
        return findBridges()
            .then(bridges => {
                console.log('Got bridges:');
                console.dir(bridges);
                return createUser(bridges[0])
            })
            .then(result => {
                this.client = getClient(...result);
                this.ready = true;
            })
    }

    getDevices(){
        return this.client.lights.getAll()
            .then(lights => {
                console.log('Got lights');
                console.dir(lights);
                return lights;
            })
    }
}

function findBridges() {
    return huejay.discover()
}

function createUser(bridge) {
    const client = new huejay.Client({
        host: bridge.ip
    });
    const user = new client.users.User({});
    user.deviceType = 'mote';

    const timeout = new Promise((resolve, reject) => {
        setTimeout(reject.bind(null, 'Link button not pressed!'), 30000);
    });
    const createUser = new Promise((resolve) => {
        tryCreateUser();
        function tryCreateUser(){
            console.log('Checking if we can create a user...');
            if(bridge.linkButtonEnabled){ // FIXME: We never seem to get in here :-/
                console.log('Yep! Link button was pressed');
                client.users.create(user).then(resolve);
            }
            else{
                console.log('Nope. Trying again in 2s');
                setTimeout(tryCreateUser, 2000);
            }
        }
    });
    return Promise.race([timeout, createUser]);

}
function getClient(bridge, user) {
    return new huejay.Client({
        host: bridge.ip,
        username: user.username
    })
}

module.exports = HueBridge;