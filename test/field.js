var helper = require(__dirname);

test('fields', function(t) {
  var thing = helper.keeper.define('thing', {
    fields: [{
      name: 'id',
      idenity: true
    },{
      name: 'name',
      type: 'text',
      unique: true
    },{
      name: 'created',
      type: 'date'      
    }]
  });
  
  t.test({
    'can get fields by name': function(t) {
      t.equal(thing.getField('id').name, 'id');
      t.equal(thing.getField('name').name, 'name');
      t.equal(thing.getField('created').name, 'created');
      t.done();
    },
    'getting field that does not exist returns null': function(t) {
      t.equal(thing.getField('lksjdf'), null);
      t.done();
    }
  })

  t.done();
})


