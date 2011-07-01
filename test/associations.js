var helper = require(__dirname);

test('associations', function(t) {

  var Animal = helper.keeper.define('animal', {
    fields: [{
      name: 'name'
    }],
    belongsTo: {
      owner: {
        model: 'person'
      }
    }
  })

  var Person = helper.keeper.define('person', {
    fields: [{
      name: 'name'
    }],
    hasMany: {
      pets: {
        model: 'animal'
      }
    }
  })

  t.test('belongs to', function(t) {

    t.test('creates relationship methods', function(t) {
      var animal = new Animal();
      t.equal(typeof animal.getOwner, 'function');
      t.equal(typeof animal.setOwner, 'function');
      t.done();
    })

    t.test('adds association column', function(t) {
      var animal = new Animal();
      var associationField = animal.model.getFields().filter(function(field) {
        return field.name == 'ownerId'
      })
      t.equal(associationField.length, 1, "Should have ownerId field");
      var field = associationField[0];
      t.done();
    })

    t.test('add method works', function(t) {
      var owner = new Person({
        name: 'brian'
      })
      owner.id = 1;
      var pet = new Animal({
        name: 'spot'
      })
      pet.setOwner(owner);
      t.equal(pet.ownerId, 1);
      pet.getOwner(function(err, owner) {
        t.equal(err, null, 'should not have an error');
        t.equal(owner.name, 'brian');
        t.equal(owner.id, 1);
        t.done();
      })
    })

    t.done();
  })

  t.done();
})
