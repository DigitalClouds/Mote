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

    getDevices() {
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
    let cancel = false;
    const timeout = new Promise((resolve, reject) => {
        setTimeout(()=>{
            cancel = true;
            reject('Timed out: Link button not pressed!');
        }, 30000);
    });
    const createUser = new Promise((resolve) => {
        tryCreateUser();

        function tryCreateUser() {
            console.log('Checking if we can create a user...');

            client.users.create(user)
                .then(() => {
                    console.log('Yep! Link button was pressed');
                    resolve();
                }).catch(() => {
                    if(!cancel) {
                        console.log('Nope! Trying again in a second...');
                        setTimeout(tryCreateUser, 1000);
                    }
                })
        }
    });
    return Promise.race([timeout, createUser]);

}
function getClient(bridge, user) {
    console.log('Getting client...');
    return new huejay.Client({

        host: bridge.ip,
        username: user.username
    })
}

module.exports = HueBridge;