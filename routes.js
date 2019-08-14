const LoginModel = require('./model/login')
const DepartmentModel = require('./model/department')
const { raw } = require('objection');
const Joi = require('@hapi/joi')
const commonfunction = require('./commonfunctions')
const underscore = require('underscore')
var AES = require("crypto-js/aes");
var SHA256 = require("crypto-js/sha256");
var CryptoJS = require("crypto-js");

const configRoutes = [

    // get method for username
    {
        method: 'POST',
        path: '/api/login/items',
        // config: {
        //     validate: {
        //         payload: {
        //             Username: Joi.string().required(),
        //             password: Joi.string().min(7).required(),
        //         }
        //     }
        // },
        handler: async (request) => {
            let items = request.payload.edc;
            console.log(items, request.payload, "Request .payload");
            let data;
          
            let decrypt = await commonfunction.objectdecrypt(items)
            request.payload = items = decrypt;

            const schema = Joi.object().keys({
                Username: Joi.string().required(),
                password: Joi.string().min(7).required(),
            });
            await Joi.validate(request.payload, schema, async (err) => {
                if (err && err.details.length) {
                    console.log(err.message)
                };
                
                try {
                    console.log(LoginModel.query().
                        select('login.id', 'role').where({ Username: items.Username, password: raw(`md5('${items.password}')`) }).toString());

                    data = await LoginModel.query().
                        select('login.id', 'role').where({ Username: items.Username, password: raw(`md5('${items.password}')`) })
                } catch (error) {
                    console.log(error, "error");
                }
            });
            return data;
        }
    },
    // post method for dept table for delete func
    {
        method: 'POST',
        path: '/api/dept/del',
        // config: {
        //     validate: {
        //         payload: {
        //             departmentid: Joi.number().required()
        //         }
        //     }
        // },
        handler: async (req) => {
            var id = req.payload.edc;
            console.log(id, req.payload, "Request .payload")
            let data;

            let decrypt = await commonfunction.objectdecrypt(req.payload)
            req.payload=id=decrypt

            console.log(id)

            const schema = Joi.object().keys({
                departmentid: Joi.number().required()
            });
            await Joi.validate(req.payload, schema, async (err) => {
                if (err && err.details.length) {
                    console.log(err.message)
                };
                try {
                    console.log(DepartmentModel.query().findById(id).patch({ del: 0 }).toString());

                    data = await commonfunction.updateForDel(DepartmentModel, id)
                }
                catch (error) {
                    console.log(error, "error");
                }
            });
            return data;
        }
    },


    // post method for login table for delete func
    {
        method: 'POST',
        path: '/login/del',
        // config: {
        //     validate: {
        //         payload: {
        //             loginid: Joi.number().required()
        //         }
        //     }
        // },
        handler: async (req, reply) => {
            var id = req.payload.edc;
            console.log(id,req.payload, "Request .payload")
           
            let decrypt = await commonfunction.objectdecrypt(req.payload)
            req.payload=id=decrypt
            console.log(id)

            let data;
            const schema = Joi.object().keys({

                id: Joi.number().required()
            });
            await Joi.validate(req.payload, schema, async (err) => {
                if (err && err.details.length) {
                    console.log(err.message)
                };

                try {
                    console.log(LoginModel.query().findById(id).patch({ del: 0 }).toString());

                    data = await commonfunction.updateForDel(LoginModel, id)
                } catch (error) {
                    console.log(error, "error");
                }
            });
            return data;
        }
    },
    // get method for deptartment list
    {
        method: 'GET',
        path: '/api/dept',
        handler: async (req) => {
            console.log("payload", req.payload);
            let data;
            try {
                console.log(DepartmentModel.query()
                    .select('departments.dept_id', 'departments.dept_name', 'departments.status', raw('GROUP_CONCAT(emp_list.emp_id ) as employee'))
                    .leftJoinRelation('emp_list')
                    .where('departments.del', '=', 1)
                    .groupBy('departments.dept_id')
                    .orderBy('departments.dept_id').toString());

                data = await DepartmentModel.query()
                    .select('departments.dept_id', 'departments.dept_name', 'departments.status', raw('GROUP_CONCAT(emp_list.emp_id ) as employee'))
                    .leftJoinRelation('emp_list')
                    .where('departments.del', '=', 1)
                    .groupBy('departments.dept_id')
                    .orderBy('departments.dept_id')
            } catch (error) {
                console.log(error, "error");
            }
            return data;
        }
    },

    // get method for deptartment list
    {
        method: 'GET',
        path: '/ex/obj/list',
        handler: async (req) => {
            console.log("payload", req.payload);
            let data;
            try {
                console.log(LoginModel.query()
                    .select('username', 'dept_list.dept_id', 'login.dept_name')
                    .innerJoinRelation('dept_list')
                    .groupBy('dept_list.dept_name').toString());

                data = await LoginModel.query()
                    .select('username', 'dept_list.dept_id', 'login.dept_name')
                    .innerJoinRelation('dept_list')
                    .groupBy('dept_list.dept_name')
            } catch (error) {
                console.log(error, "error");
            }
            return data;
        }
    },

    //get method for login table
    {
        method: 'GET',
        path: '/logintabl',
        handler: async () => {
            // var i = req.payload;
            // console.log(i)
            let data;
            try {
                console.log(LoginModel.query()
                    .select('login.*', raw('date_format(DOB, "%Y-%m-%d") as dob')).where('del', 1).toString());
                data = await LoginModel.query()
                    .select('login.*', raw('date_format(DOB, "%Y-%m-%d") as dob')).where('del', '=', 1)
            } catch (error) {
                console.log(error, "error");
            }
            return data;
        }
    },

    // get method for login table for edit and view function
    {
        method: 'GET',
        path: '/login/{id}',
        handler: async (req) => {
            let loginid = req.params.id;
            let data;
            console.log(loginid)
            try {
                console.log(LoginModel.query()
                    .select('login.*', raw('date_format(DOB, "%Y-%m-%d") as dob')).where('id', '=', loginid).toString());

                data = await LoginModel.query()
                    .select('login.*', raw('date_format(DOB, "%Y-%m-%d") as dob')).where('id', '=', loginid)

            } catch (error) {
                console.log(error, "error");
            }
            return data;
        }
    },
    // get method for dept table for edit  func
    {
        method: 'GET',
        path: '/api/depts/{id}',
        handler: async (req) => {
            var departmentid = req.params.id;
            console.log(id)
            let data;
            try {
                console.log(DepartmentModel.query().where('dept_id', departmentid).toString());

                data = await DepartmentModel.query().where('dept_id', departmentid)

            } catch (error) {
                console.log(error, "error");
            }
            return data;
        }
    },
    // post method for dept table for update func
    {
        method: 'POST',
        path: '/api/dept/{id}',
        config: {
            validate: {
                payload: {
                    dept_name: Joi.string().uppercase().required(),
                    status: Joi.number().integer().max(1).required(),
                }
            }
        },
        handler: async (req) => {
            let id = req.params.id;
            let dept = req.payload;
            console.log(id)
            let data;
            const schema = Joi.object().keys({
                dept_name: Joi.string().uppercase().required(),
                status: Joi.number().max(1).required(),
            });
            await Joi.validate(req.payload, schema, async (err) => {
                if (err && err.details.length) {
                    console.log(err.message)
                };
                try {
                    console.log(DepartmentModel.query().
                        update({ dept_name: dept.dept_name, status: dept.status }).where('dept_id', id).toString());
                    data = await DepartmentModel.query().
                        update({ dept_name: dept.dept_name, status: dept.status }).where('dept_id', id)
                } catch (error) {
                    console.log(error, "error");
                }
            });
            return data;
        }
    },
    // post method for login table for update func
    {
        method: 'POST',
        path: '/api/login/upd/{id}',
        config: {
            validate: {
                payload: {
                    Username: Joi.string().min(4).required(),
                    First_name: Joi.string().min(4).required(),
                    Last_name: Joi.string().min(4).required(),
                    DOB: Joi.date().iso().required(),
                    phone_no: Joi.number().integer().required(),
                    dept_id: Joi.number().integer().required(),
                    status: Joi.number().integer().required(),
                }
            }
        },
        handler: async (req) => {
            let login = req.payload
            let loginid = req.params.id;
            console.log(i);
            let data;
            const schema = Joi.object().keys({
                Username: Joi.string().min(4).required(),
                First_name: Joi.string().min(4).required(),
                Last_name: Joi.string().min(4).required(),
                DOB: Joi.date().iso().required(),
                phone_no: Joi.number().integer().required(),
                dept_id: Joi.number().integer().required(),
                status: Joi.number().integer().required(),
            });
            await Joi.validate(req.payload, schema, async (err) => {
                if (err && err.details.length) {
                    console.log(err.message)
                };
                try {
                    console.log(LoginModel.query().
                        update({
                            Username: login.Username, First_name: login.First_name, Last_name: login.Last_name,
                            DOB: login.myDate.formatted, phone_no: login.phone_no, dept_id: login.dept_id, status: login.status
                        }).
                        where('id', loginid).toString());
                    data = await LoginModel.query().
                        update({
                            Username: login.Username, First_name: login.First_name, Last_name: login.Last_name,
                            DOB: login.myDate.formatted, phone_no: login.phone_no, dept_id: login.dept_id, status: login.status
                        }).
                        where('id', loginid)
                } catch (error) {
                    console.log(error, "error");
                }
            });
            return data
        }
    },
    // post method for login table for insert func
    {
        method: 'POST',
        path: '/api/login',
        // config: {
        //     validate: {
        //         payload: {
        //             Username: Joi.string().min(4).required(),
        //             First_name: Joi.string().min(4).required(),
        //             Last_name: Joi.string().min(4).required(),
        //             DOB: Joi.date().iso().required(),
        //             password: Joi.string().required(),
        //             phone_no: Joi.number().integer().required(),
        //             dept_id: Joi.number().integer().required(),
        //             joining_date: Joi.date().iso().required(),
        //         }
        //     }
        // },
        handler: async (req) => {
            var logindata = req.payload.edc
            console.log(logindata,req.payload,":edc")
            let data;

            let decrypt = await commonfunction.objectdecrypt(req.payload)
            req.payload = logindata = decrypt;
            console.log(logindata)

            const schema = Joi.object().keys({
                Username: Joi.string().min(4).required(),
                First_name: Joi.string().min(4).required(),
                Last_name: Joi.string().min(4).required(),
                // myDate: Joi.date().format('YYYY-MM-DD'),
                password: Joi.string().required(),
            //    confirm_password: Joi.string().required(),
                phone_no: Joi.string().required(),
                dept_id: Joi.string().required(),
                // joining_date: Joi.date().format('YYYY-MM-DD').utc(),
            });
            await Joi.validate(req.payload, schema, async (err) => {
                if (err && err.details.length) {
                    console.log(err.message)
                };
                try {
                    console.log(LoginModel.query().
                        insert({
                            Username: logindata.Username, First_name: logindata.First_name, Last_name:logindata.Last_name,
                            DOB: logindata.myDate.formatted, phone_no: logindata.phone_no, password: raw(`md5(${logindata.password})`),dept_id: logindata.dept_id, joining_date: logindata.joinDate.formatted
                        }).toString());
                    data = await LoginModel.query().
                        insert({
                            Username: logindata.Username, First_name: logindata.First_name, Last_name:logindata.Last_name,
                            DOB: logindata.myDate.formatted, phone_no: logindata.phone_no, password: raw(`md5(${logindata.password})`),dept_id: logindata.dept_id, joining_date: logindata.joinDate.formatted
                        })
                } catch (error) {
                    console.log(error, "error");
                }
            });
            return data;
        }
    },
    // post method for dept table for insert func
    {
        method: 'POST',
        path: '/dept/insert',
        // config: {
        //     validate: {
        //         payload: {
        //             dept_name: Joi.string().min(2).uppercase().required(),
        //             status: Joi.string().max(1).required(),
        //         }
        //     }
        // },
        handler: async (req) => {
            let department = req.payload.edc
            console.log(req.payload,":edc")
            let data;

            let decrypt = await commonfunction.objectdecrypt(req.payload)
            req.payload = department = decrypt;
            console.log(department)


            const schema = Joi.object().keys({
                dept_name: Joi.string().min(2).uppercase().required(),
                status: Joi.string().max(1).required(),
            });
            await Joi.validate(req.payload, schema, async (err) => {
                if (err && err.details.length) {
                    console.log(err.message)
                };
                try {
                    console.log(DepartmentModel.query().insert({ dept_name: department.dept_name, status: department.status }).toString());
                    data = await DepartmentModel.query().insert({ dept_name: department.dept_name, status: department.status })
                } catch (error) {
                    console.log(error, "error");
                }
            });
            return data;
        }
    },

    //postmethod for role update method
    {
        method: 'POST',
        path: '/api/role/update',
        // config: {
        //     validate: {
        //         payload: {
        //             id: Joi.number().required(),
        //             role: Joi.string().min(2).required(),
        //         }
        //     }
        // },
        handler: async (req, res) => {
            let roleupdateorinsertdata = req.payload;
            console.log(req.payload,":edc")

            let decrypt = await commonfunction.objectdecrypt(req.payload)
            req.payload = roleupdateorinsertdata = decrypt;
            console.log(roleupdateorinsertdata)
            
            const schema = Joi.object().keys({
                emp_id: Joi.string().required(),
                role: Joi.string().min(2).required()
            });
            await Joi.validate(req.payload, schema, async (err) => {
                if (err && err.details) {
                    console.log(err.message)
                };
                try {
                    data = await commonfunction.insertOrUpdate(LoginModel, roleupdateorinsertdata)
                } catch (error) {
                    console.log(error, 'error')
                }
            });
            return 'success'
        }
    },
    // get method for roles for multiselect
    {
        method: 'GET',
        path: '/role/{data}',
        handler: async (req) => {
            var data = req.params.data;
            console.log(data)
            try {
                console.log(LoginModel.query().select('emp_id', 'Username', 'role').where(raw(`FIND_IN_SET('${data}',role)`)).toString())

                var data = await LoginModel.query().select('emp_id', 'Username', 'role').where(raw(`FIND_IN_SET('${data}',role)`))
                // var data = await knex.raw(`SELECT emp_id , Username, role FROM login where FIND_IN_SET('${data}',role) `)
            } catch (error) {
                console.log(error, 'error')
            }
            return data
        }
    },

    // get method for roles for rm
    {
        method: 'GET',
        path: '/login/rm',
        handler: async (req, h) => {

            try {
                console.log(LoginModel.query().select('emp_id', 'Username').where(raw(`FIND_IN_SET("rm",role)`)).toString());

                var data = await LoginModel.query().select('emp_id', 'Username').where(raw(`FIND_IN_SET("rm",role)`))

            } catch (error) {
                console.log(error, 'error')
            }
            return data
        }
    },

    // get method for roles for hr
    {
        method: 'GET',
        path: '/login/hr',
        handler: async (req, h) => {
            try {
                console.log(LoginModel.query().select('emp_id', 'Username').where(raw(`FIND_IN_SET("hr",role)`)).toString());

                var data = await LoginModel.query().select('emp_id', 'Username').where(raw(`FIND_IN_SET("hr",role)`))

            } catch (error) {
                console.log(error, 'error')
            }
            return data
        }
    },
];
module.exports = configRoutes