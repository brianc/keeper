var keeper = require(__dirname).keeper;

test('Foo Model', function(t) {

  var Foo = keeper.define('foo', {
    fields: [{
      name: 'name'
    },{
      name: 'age'
    }]
  });

  t.test('id is automatically added', function(t) {
    var idField = Foo.getFields()[0];
    t.equal(idField.name, 'id');
    t.equal(idField.isIdentity(), true)
    t.done();
  })

  t.test('has fields',function(t) {
    var fields = Foo.getFields();
    t.equal(fields[0].name, 'id');
    t.equal(fields[1].name, 'name');
    t.equal(fields[2].name, 'age');
    t.done();
  })

  t.test('can create new instance', function(t) {
    var foo = new Foo();
    t.ok(foo);
    t.done();
  })

  t.test('instance has properties', function(t) {
    var foo = new Foo({name: 'bar', age: 10});
    t.equal(foo.name, 'bar');
    t.equal(foo.age, 10);
    t.done();
  })
  t.test('instance does not have non-properties set from config', function(t) {
    var foo = new Foo({name: 'bang', test: 'asdf'});
    t.equal(foo.name, 'bang');
    t.equal(typeof foo.test, 'undefined');
    t.done();
  })

  t.test('instance has model property', function(t) {
    var foo = new Foo();
    t.equal(foo.model, Foo);
    t.done();
  })

  t.test('can add field', function(t) {
    Foo.addField({name: 'added', id: true});
    t.equal(Foo.getFields().filter(function(field) {
      return field.name == 'added' && field.isIdentity()
    }).length, 1, "Should have added field")
    t.done();
  })

  t.test('can find model by name', function(t) {
    t.equal(keeper.get('foo'), Foo, 'Should have found Foo model');
    t.done();
  })

  t.done();
})
