/**
 * Created by dosborne on 14/05/17.
 */
"use strict";
const huejay = require('huejay');

class HueDevice {
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

    getChildDevices(){
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
    const user = new client.users.User;
    user.deviceType = 'mote';


    const timeout = new Promise((resolve, reject) => {
        setTimeout(reject, 30000);
    });
    // FIXME: Need to check bridge.linkButtonEnabled on before calling this.
    const createUser = client.users.create(user);
    return Promise.race([timeout, createUser]);

}
function getClient(bridge, user) {
    return new huejay.Client({
        host: bridge.ip,
        username: user.username
    })
}

module.exports = HueDevice;