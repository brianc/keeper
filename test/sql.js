var pg = require('pg');
var helper = require(__dirname);

test('User model', function(t) {

  var User = helper.keeper.define('user', {
    table: 'users',
    fields:[{
      name: 'email'
    },{
      name: 'firstName'
    },{
      name: 'lastName'
    }]
  })

  t.test('can override table name', function(t) {
    t.equal(User.getTableName(), 'users');
    t.done();
  })

  t.test('can CRUD', function(t) {
    t.timeout(3000); //set longer timeout
    var user = new User({
      email: 'test@example.com',
      firstName: 'brian',
      lastName: 'carlson'
    })
    helper.user.clearAll(function(err) {
      if(err) return t.done(err);
      user.create(function(err, user) {
        if(err) throw err;
        t.equal(typeof user.id, 'number')
        t.ok(user.id > 0);
        t.equal('test@example.com', user.email);
        User.get(user.id, function(err, user) {
          if(err) throw err;
          t.ok(user);
          t.equal(user.firstName, 'brian');
          t.equal(user.lastName, 'carlson');
          t.equal(user.email, 'test@example.com');
          user.firstName = 'bang';
          user.lastName = 'cobra';
          user.email = 'testing@example.com';
          user.update(function(err, updatedUser) {
            t.equal(err, null)
            t.ok(updatedUser);
            t.equal(updatedUser.firstName, 'bang');
            t.equal(updatedUser.lastName, 'cobra');
            t.equal(updatedUser.email, 'testing@example.com');
            User.all(function(err, users) {
              if(err) throw err;
              t.equal(users.length, 1);
              user.destroy(function(err) {
                t.equal(err, null);
                User.all(function(err, users) {
                  if(err) throw err;
                  t.equal(users.length, 0);
                  t.done();
                })
              })
            })
          });
        })
      });
    })
  })

  t.test('can find', function(t) {
    var user = new User({
      firstName: 'boom',
      lastName: 'example',
      email: 'boom@example.com',
    })
    helper.user.clearAll(function() {
      user.create(function(err) {
        if(err) throw err;
        User.find({email: 'boom@example.com'}, function(err, users) {
          if(err) throw err;
          t.ok(users);
          t.equal(users.length, 1);
          var user = users[0];
          t.equal(user.firstName, 'boom');
          t.equal(user.lastName, 'example');
          t.equal(user.email, 'boom@example.com')
          pg.end();
          t.done();
        })
      })
    })
  })
  t.done();
})

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
