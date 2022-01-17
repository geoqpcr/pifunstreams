'use strict';

const { CHAIN, PROCESSED_TRANSFERS_SETNAME } = process.env;

const storeNFTTrade = async (server, nftTrade) => {
    try {
        
        const { client } = server.plugins['hapi-redis-client'];

        // append the env chain related
        nftTrade.chain = CHAIN;
        nftTrade = JSON.stringify(nftTrade);

        // 1. score to this particular nftTradeObject 
        const addedTimeScore = new Date().getTime();

        // 2. add new member=nftTrade to the sorted set
        client.zadd(PROCESSED_TRANSFERS_SETNAME, addedTimeScore, nftTrade);

    } catch (error) {
        
        console.log('storeNFTTrade::error', error);
    }
}

const getNFTTrades = async (server) => {
    try {
        
        console.log('...gettingNFTTrades', new Date().toLocaleDateString());
        const { client } = server.plugins['hapi-redis-client'];
        const result = await client.zrevrangebyscore(PROCESSED_TRANSFERS_SETNAME, '+inf', '-inf');
        console.log('NFT trades result: ', result, new Date().toLocaleDateString());
        return result;
    } catch (error) {
        
        console.log('getNFTTrades::error', error)
    }
}

const models = {
    storeNFTTrade,
    getNFTTrades
}

module.exports = models;