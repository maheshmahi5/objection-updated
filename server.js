const hapi = require('@hapi/hapi');
const configRoutes = require('./routes');

const server = hapi.server({
    port: 3000,
    host: '0.0.0.0',
    routes: {
        cors: true,
    }
});

const Knexx = require('./knex');
//  now model is required
const { Model } = require('objection');
//  now map both.
Model.knex(Knexx);

// const allRoutes = [...configRoutes, ...configRoutes2];
const allRoutes = [...configRoutes];
// route
for (const routes of allRoutes) {    
    server.route(routes);
}

const bootUpServer = async () => {
    await server.start();
    console.log(`Server is running at ${server.info.uri}`)

    process.on('unhandledRejection', (err) => {
        console.log(err);
        process.exit(1);
    })
}

bootUpServer();