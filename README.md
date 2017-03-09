# supertest-test2doc

A [supertest](https://github.com/visionmedia/supertest) extension to make life easier with [test2doc.js](https://github.com/stackia/test2doc.js).

## Usage

```
npm install --save-dev supertest test2doc supertest-test2doc
```

Simple use `require('supertest-test2doc')(require('supertest'))` and `require(app).with(doc)` and then you no longer need to write `doc.get/post/put/delete/query/resBody...`.

E.g.

```javascript
const doc = require('test2doc')
const request = require('supertest-test2doc')(require('supertest'))
require('should')

// For Koa, you should exports app.listen() or app.callback() in your app entry
const app = require('./my-express-app.js')

after(function () {
  doc.emit('api-documentation.apib') // Or doc.emit('api-documentation.yaml', 'swagger') if you like Swagger
})

doc.group('Products').is(doc => {
  describe('#Products', function () {
    doc.action('Get all products').is(doc => {
      it('should get all products', function () {
        return request(app).with(doc)
          .get('/products')
          .query({
            minPrice: doc.val(10, 'Only products of which price >= this value should be returned').required()
          })
          .expect(200)
          .then(res => {
            res.body.desc('List of all products')
              .should.not.be.empty()
            res.body[0].should.have.properties('id', 'name', 'price')
            res.body[0].price.desc('Price of this product').should.be.a.Number()
          })
      })
    })
  })
})
```

You can find more examples [here](https://github.com/stackia/supertest-test2doc/blob/master/example/v2ex/v2ex.js).

## License

The project is released under [MIT License](https://github.com/stackia/test2doc.js/blob/master/LICENSE).
