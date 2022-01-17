'use strict';

const got = require('got');

const register = async(server, options) => {
    try {
    
        const extendedGod = await extendGotAuthHeaders();
        server.expose('client', extendedGod);

    } catch(error) {
    
        console.log('system api token error', error);
        throw(error);
    }
}

const extendGotAuthHeaders = async () => {
    const result = await got.extend();
    return result;
}   

// public
const plugin = {
    register,
    name: 'got-extended',
    multiple: true, // allow to instantiate the plugin several times 
    version: '0.0.1'
}

/*
* use case example
* server.plugins['got-extended']['client']
*/
module.exports = plugin;