'use strict';



const Moralis  = require('moralis/node');


const register = async(server, options) => {

    const { 
        MORALIS_APP_ID: appId,
        MORALIS_SERVER: serverUrl
    } = process.env;

    Moralis.start({ serverUrl, appId });
    server.expose('client', Moralis);
}

// public
const plugin = {
    register,
    name: 'moralis-client',
    multiple: true,
    version: '0.0.1'
}

/*
* use case example
* server.plugins['moralis-client'].client
*/
module.exports = plugin;