const LoginModel = require('./model/login')
const DepartmentModel = require('./model/department')
const CryptoJs = require('crypto-js')

// Insert or update function for any model
// eg: data => [{}] or {}
insertOrUpdate = async (Model, data) => {
  const firstData = data[1] ? data[1] : data;
  const insertQuery = await Model.query().insert(data).toString()
  const onConflict = await Object.getOwnPropertyNames(firstData).map(c => c === Model.idColumn ? ',' : `${c} = VALUES(${c})`).join(',').replace(',,', '')
  const que = await `${insertQuery} ON DUPLICATE KEY UPDATE ${onConflict}`
  console.log('que in  insertOrUpdate', que.toString())
  return Model.raw(que);
}

var key = 'example'

updateForDel = async (Model, data) => {

  return Model.query().findById(data).patch({ del: 0 })

}

encrypt = (text) => {
  // return CryptoJS.AES.encrypt(text, ENCRYPTION_KEY).toString();
  return CryptoJs.AES.encrypt(JSON.stringify(text), key).toString();
}

// this function is used to decrypt the data
objectdecrypt = (text) => {

  let bytes = CryptoJs.AES.decrypt(text.toString(), key);
  let decryptedData = JSON.parse(bytes.toString(CryptoJs.enc.Utf8));
  return decryptedData

}

textdecrypt = (text) => {

  let bytes  = CryptoJs.AES.decrypt(text.toString(), key );
  let decryptedData = bytes.toString(CryptoJs.enc.Utf8);
  return decryptedData


}


module.exports = { insertOrUpdate, updateForDel, encrypt, objectdecrypt ,textdecrypt}


// console.log("common function testing", encrypt({name: 'poorna'}));
