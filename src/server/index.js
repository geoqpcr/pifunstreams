'use strict';
const Hapi = require('@hapi/hapi');
const jobs = require('./lib/jobs/index');

const { API_PORT } = process.env;

const init = async () => {

    const server = Hapi.server({
        port: API_PORT || 3001,
        host: 'localhost'
    });

    // server plugins
    await registerPlugins(server);

    // server strategies
    //await setupStrategies(server);

    // start server
    await server.start();

    // sockets connection
    await jobs.nft.initSockets(server);

    // jobs init
    await jobs.nft.initJobs(server);

    // log info
    const serverUri = server.info.uri;
    const message = `Server running on ${serverUri}, 
        to see api docs please visit ${serverUri}/documentation`;
    await console.log(message);

};

const registerPlugins = async (server) => {
    console.log('loading plugins....');
    const plugins = require('./lib/plugins');
    await server.register(plugins);
    console.log('plugins loaded!');
}

const setupStrategies = async (server) => {
    console.log('setting strategies....');
    return new Promise((resolve, reject) => {
        try {

            return resolve();

        } catch (error) {
            return reject(error);
        }
    })
}

const setupRoutes = async (server) => {
    return new Promise((resolve, reject) => {

        try {
            const { apiRoutes } = routes;
            server.route(apiRoutes);
            return resolve();
        } catch (error) {
            return reject(error);
        }
    })

}

init();