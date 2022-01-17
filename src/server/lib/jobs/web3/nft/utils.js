'use strict';

const getByKey = (server, key) => {

    const { client } = server.plugins['hapi-redis-client'];

    return new Promise((resolve, reject) => {
        client.get(key, async (error, result) => {

            if (error) return reject(error);
            
            if (!result) return null;

            const data = JSON.parse(result);
            return resolve(data);

        });
    });
}


// public use
const handler = {
    getByKey
}

module.exports = handler;