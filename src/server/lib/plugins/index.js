// inhouse custom plugins
const hapiRedisPlugin = require('./hapi-redis-client');
const gotExtendedPlugin = require('./got-extended');
const web3Plugin = require('./web3');
const moralis = require('./moralis');

// third party plugins
//const hapiAuthJWTPlugin = require('hapi-auth-jwt2/lib');

// api doc/view
const Inert = require('@hapi/inert');
const Vision = require('@hapi/vision');
const HapiSwagger = require('hapi-swagger');

// env vars
const { 
    REDIS_PORT, 
    REDIS_HOST
} = process.env;

module.exports = [ 
    {
        plugin: hapiRedisPlugin,
        options: {
            REDIS_PORT, 
            REDIS_HOST,
            EXPOSED_NAME: 'client'
        }
    },
    {
        plugin: gotExtendedPlugin,
        options: {}
    },
    {
        plugin: moralis,
        options: {}
    },
    {
        plugin: web3Plugin,
        options: {}
    },
    // {
    //     plugin: hapiAuthJWTPlugin,
    //     options: { }
    // },
    Inert,
    Vision,
    {
        plugin: HapiSwagger,
        options: {
            info: {
                title: '@txnservice importer microservice',
                version: HapiSwagger.version
            },
            routeTag: 'importer-ms'
        }
    }
];