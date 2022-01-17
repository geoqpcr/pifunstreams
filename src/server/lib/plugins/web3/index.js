'use strict';

const Web3 = require('web3');

const { 
    NODE_URL, 
    JOBS_TIME_FREQ_SEC, 
    BLOCK_NUMBER_REDIS_KEYNAME 
} = process.env;

const register = async (server, options) => {
    try {

        const web3 = new Web3(NODE_URL);;
        server.expose('client', web3);

        subscribeToNewBlockHeaders(server, web3);
    } catch (error) {

        console.log('provider-web3::error', error);
        throw (error);
    }
}

const subscribeToNewBlockHeaders = (server, web3) => {
    try {
        
       let subscription = web3.eth.subscribe('newBlockHeaders', (error, result) => {

            if (error) throw(error);

            const { client } = server.plugins['hapi-redis-client'];
            console.log('Block #', result.number);
            const blockNumber = result.number;
            client.set(BLOCK_NUMBER_REDIS_KEYNAME, blockNumber);
            
            // remove the subscription
            subscription = subscription.unsubscribe();
        });

        setInterval(() => {

            // renew the subscription
            if (!subscription) {
                return subscribeToNewBlockHeaders(server, web3);
            }

        }, 1000 * Number(JOBS_TIME_FREQ_SEC));// every JOBS_TIME_FREQ_SEC seconds

    } catch (error) {
        console.log('provider-web3::error', error);
    }
}
// public
const plugin = {
    register,
    name: 'provider-web3',
    multiple: true, // allow to instantiate the plugin several times 
    version: '0.0.1'
}

/*
* use case example
* server.plugins['provider-web3']['client']
*/
module.exports = plugin;