const { Model } = require('objection');

class login extends Model {
     
    static get tableName() {
        return 'login';
    }

    static get idColumn() {
        return 'id';
    }

    static get relationMappings() {
        // Importing models here is a one way to avoid require loops.
        const depttabl= require('./department');
        // const Movie = require('./Movie');
    
        return {
          dept_list: {
            relation: Model.HasManyRelation,
            // The related model. This can be either a Model
            // subclass constructor or an absolute file path
            // to a module that exports one. We use a model
            // subclass constructor `Animal` here.
            modelClass: depttabl,
            join: {
              from: 'login.dept_id',
              to: 'departments.dept_id'
            }
          },
        }
    }

    
  static get jsonSchema() {
    return {
        type: 'object',
        required: [],

        properties: {

            First_name: {type:'string'},
            Last_name: {type:'string'},
            DOB:{type:'date'},
            password:{type:'string'},
            phone_no: { type: 'string' },
            dept_id: {type:'string'},
            Username: {type:'string'},
            joining_date:{type:'string'}


            // Properties defined as objects or arrays are
            // automatically converted to JSON strings when
            // writing to database and back to objects and arrays
            // when reading from database. To override this
            // behaviour, you can override the
            // Model.jsonAttributes property.
        }
    };
}

}
module.exports=login