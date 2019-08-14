var knex = require('knex')({
    client: 'mysql',
    connection: {
        host: '0.0.0.0',
        user: 'root',
        password: '',
        database: 'training'
    }
});

module.exports = knex;