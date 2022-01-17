'use strict';

const Redis = require('ioredis');

const register = async(server, options) => {

    const { 
        REDIS_PORT, 
        REDIS_HOST,
        EXPOSED_NAME
    } = options;

    const redisClient = new Redis(REDIS_PORT, REDIS_HOST);
    server.expose(EXPOSED_NAME, redisClient);
    
    const message = `** Redis ::${EXPOSED_NAME}:: connected to ${REDIS_HOST}:${REDIS_PORT}`;
    console.log(message);

    return true;
}

// public
const plugin = {
    register,
    name: 'hapi-redis-client',
    multiple: true, // allow to instantiate the plugin several times 
    version: '0.0.1'
}

/*
* use case example
* server.plugins[<<plugin-name>>].exposedName
* server.plugins['hapi-redis-client'].client -> now we have all redis methods available
*/
module.exports = plugin;