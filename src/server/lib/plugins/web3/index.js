'use strict';

const Web3 = require('web3');
const pancakeswapFactoryAbi = require('../../jobs/web3/nft/abis/pancakeswap-factory-abi.json');
const newPairABI = require('../../jobs/web3/nft/abis/new-pair.json');
const InputDataDecoder = require('ethereum-input-data-decoder');
const decoder = new InputDataDecoder([newPairABI]);
const abiDecoder = require('abi-decoder');
abiDecoder.addABI([pancakeswapFactoryAbi]);

const TOPIC = '0x0d3648bd0f6ba80134a33ba9275ac585d9d315f0ad8355cddefde31afa28d0e9';

const {
    CHAIN,
    NODE_URL,
    JOBS_TIME_FREQ_SEC,
    BLOCK_NUMBER_REDIS_KEYNAME,
    NEW_PAIR_CREATED_REDIS_KEYNAME
} = process.env;

const register = async (server, options) => {
    try {

        const web3 = new Web3(NODE_URL);;
        server.expose('client', web3);

        subscribeToNewBlockHeaders(server, web3);
        // getContractEvents(server, web3);
        getTxnDetailsByHash(server, web3, '0x67d27d02e5397c43415cc8ce02d840b0a218792d9947bb9355dc4eea256e1193')
    } catch (error) {

        console.log('provider-web3::error', error);
        throw (error);
    }
}

const subscribeToNewBlockHeaders = (server, web3) => {
    try {

        let subscription = web3.eth.subscribe('newBlockHeaders', (error, result) => {

            if (error) throw (error);

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

const getContractEvents = async (server, web3) => {
    try {

        const options = {
            //chain: CHAIN,
            //limit: 5,
            address: "0xca143ce32fe78f1f7019d7d551a6402fc5350c73", //  PancakeSwap: Factory v2 
            topics: [
                TOPIC
            ],
            abi: newPairABI
        };

        const { client } = server.plugins['hapi-redis-client'];
        let subscription = web3.eth.subscribe('logs', options, (error, newPairEvent) => {

            if (error) throw (error);
            if (!newPairEvent) return;

            console.log('**** New PAIR:', newPairEvent);
            const addedTimeScore = new Date().getTime();
            const newPairEventStr = JSON.stringify(newPairEvent);
            client.zadd(NEW_PAIR_CREATED_REDIS_KEYNAME, addedTimeScore, newPairEventStr);
        });

    } catch (error) {

    }
}

const getTxnDetailsByHash = async (server, web3, transaction_hash) => {
    try {

        const { client } = server.plugins['moralis-client'];

        const options = {
            chain: CHAIN,
            transaction_hash
        };
        
        const transaction = await client.Web3API.native.getTransaction(options);
        console.log('getTxnDetailsByHash:result', transaction);

        const { logs } = transaction;
        
        logs.map(log => { 

            const { topic0, topic1, topic2 } = log;

            // match our topics, new Pair
            if (topic0 && topic0 === TOPIC) {

                const decodedLog = abiDecoder.decodeMethod(log.data);
                console.log('decodedLog', decodedLog)
                console.log('pair', log);
            }
        })
        
        return transaction;

    } catch (error) {

        console.log('setContractTxnDetails::error', error)
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