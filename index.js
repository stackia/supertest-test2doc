const methods = require('methods')

module.exports = function (supertest) {
  return function () {
    const obj = supertest(...arguments)
    const newObj = Object.create(obj)
    newObj.with = function (doc) {
      this.doc = doc
      return this
    }
    for (const method of methods) {
      newObj[method] = function (url, parameters) {
        const doc = this.doc
        if (doc) url = doc.method(method).url(url, parameters)
        const test = obj[method].call(this, url)
        const newTest = Object.create(test)
        newTest.set = function (field, val) {
          if (doc) {
            if (field !== null && typeof field === 'object') {
              for (var key in field) {
                doc.reqHeader(key, field[key])
              }
            } else {
              doc.reqHeader(field, val)
            }
          }
          return test.set.call(this, doc.uncapture(field), doc.uncapture(val))
        }
        newTest.send = function (data) {
          if (doc) doc.reqBody(data)
          return test.send.call(this, doc.uncapture(data))
        }
        newTest.query = function (val) {
          if (doc) doc.query(val)
          return test.query.call(this, doc.uncapture(val))
        }
        newTest.end = function (fn) {
          return test.end.call(this, function (err, res) {
            if (doc) {
              res.headers = doc.resHeaders(res.headers)
              doc.status(res.statusCode)
              res.body = doc.resBody(res.body)
            }
            fn.call(this, err, res)
          })
        }
        return newTest
      }
    }
    return newObj
  }
}
