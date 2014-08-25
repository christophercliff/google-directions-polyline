var Client = require('../')
var data = require('./fixtures/data.json')

var TIMEOUT = 20e3

describe('create()', function(){

    it('should create the client', function(){
        var client = Client.create({ key: 'ASDF' })
        client.key.should.equal('ASDF')
    })

})

describe('getRequestGroups()', function(){

    this.timeout(TIMEOUT)

    it('should get the request groups', function(){
        var requestGroups = Client.create({ key: 'ASDF' }).getRequestGroups(data.bounds)
        requestGroups.should.eql(data.request_groups)
    })

})
