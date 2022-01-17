'use strict';

let LNFTTRADES_TOPIC;
const { 
    CHAIN, 
    JOBS_TIME_FREQ_SEC,
    BLOCK_NUMBER_REDIS_KEYNAME
} = process.env;
const utils = require('./utils');
const models = require('./models');

const initSockets = (server) => {
    return new Promise( async (resolve, reject) => {
        try {

            const io = require('socket.io')(server.listener, { cors: { origin: '*' }});
            LNFTTRADES_TOPIC = io.of('/NFT');
            
            return resolve();
        } catch(error) {
            return reject(error);
        }
    });

}

const initJobs = async (server) => {
    try {
        
        // get some initial feed data
        await getLatestNFTTrades(server);
        await getLatestParsedNFTTrades(server);
    
    } catch (error) {
        console.log('initJobs::error', error)
    }
    
}
// 1. web3 -> headerBlockNumber -> redis {key:value} => {BLOCK_NUMBER_REDIS_KEYNAME:123455}
// 2. nftTradesByBlockNumber
// 3. stores the trades into redis(sorted set)
const getLatestNFTTrades = (server) => {
    try {
        
        setInterval(async () => {

            const { client } = server.plugins['moralis-client'];
            let latestBlockNumber = await utils.getByKey(server, BLOCK_NUMBER_REDIS_KEYNAME);

            if (!latestBlockNumber) return;
            console.log('latestBlockNumber', latestBlockNumber);

            // todo: no info in the most recent blocks, so move back to old ones
            // if (CHAIN === 'avalanche' || CHAIN === 'polygon') {
            //     latestBlockNumber = latestBlockNumber - 5;
            // }

            // NFT Transfers on that block number | 5
            const options = { chain: CHAIN, block_number_or_hash: latestBlockNumber, limit: 5 };
            let NFTTransfers = await client.Web3API.native.getNFTTransfersByBlock(options);
            NFTTransfers = NFTTransfers.result;

            NFTTransfers.map(nftTrn => {

                const {
                    log_index,
                    block_number, 
                    block_hash,

                    contract_type, 
                    transaction_hash,

                    from_address, 
                    to_address,
                    token_id,
                    amount,
                    value
                } = nftTrn;

                const newNFTTxn = {
                    log_index,
                    block_number, 
                    block_hash,

                    contract_type, 
                    transaction_hash,

                    from_address, 
                    to_address,
                    token_id,
                    amount,
                    value
                }

                models.storeNFTTrade(server, newNFTTxn)
            }); 

            console.log('Total new txns added', NFTTransfers.length)
            
            
            // NFT Token metadata
            // const nftTrade = NFTTransfers[2];
            // const { token_id, token_address: address } = nftTrade;
            // const _options = { address, token_id, chain: "bsc" };
            // const tokenIdMetadata = await client.Web3API.token.getTokenIdMetadata(_options);
            // console.log('tokenIdMetadata', tokenIdMetadata)
            // Search for details
            // const { name } = tokenIdMetadata;
            // const options_ = { q: name, chain: "bsc", filter: "global", limit: 1 };
            // let { result: NFTs } = await client.Web3API.token.searchNFTs(options_) || [];
            // NFTs.map(nft => {

            //     let { metadata, token_id, token_uri, } = nft;
            //     metadata = JSON.parse(metadata);

            //     const { owner, demands, offers, name, description, details, blockNumber, image } = metadata;
                
            //     console.log('> new nft trade')
            //     console.log(`
            //         Name: ${name},
            //         Description: ${description},
            //         #: ${blockNumber},
            //         TokenId: ${token_id},
            //         TokenUri: ${token_uri}
            //         Image: ${encodeURI(image)}
            //     `)
            //     // console.log('Deal', demands && demands.length && offers && offers.length);
        
            // })
        }, 1000 * Number(JOBS_TIME_FREQ_SEC));

    } catch (error) {

        console.log('getLatestNFTTrades::error', error)
    }
}

const getLatestParsedNFTTrades = (server) => {
    try {
        
        setInterval(async () => {

            const result = await models.getNFTTrades(server);
            LNFTTRADES_TOPIC.emit('LASTTRADES', result);
        }, 1000 * Number(JOBS_TIME_FREQ_SEC));
        

    } catch (error) {
        
        console.log('error', error)
    }
}

module.exports = {
    initJobs,
    initSockets,
    getLatestNFTTrades,
    getLatestParsedNFTTrades
}