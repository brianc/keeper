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
    },{
      name: 'active',
      defaultValue: false
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

  t.test('update only changes 1 record', function(t) {
    t.timeout(5000)
    var user1 = new User({
      firstName: 'user',
      lastName: 'one',
      email: 'one@example.com'
    })

    var user2 = new User({
      firstName: 'user',
      lastName: 'two',
      email: 'two@example.com'
    })

    helper.user.clearAll(function() {
      user1.create(function(err) {
        if(err) throw err;
        user2.create(function(err, u) {
          if(err) throw err;
          user1.firstName = 'boom';
          user1.update(function(err, user) {
            if(err) throw err;
            User.find({id: u.id}, function(err, users) {
              if(err) throw err;
              t.equal(users[0].firstName, 'user')
              pg.end();
              t.done()
            })
          });
        })
      })
    })
  })
  t.done();
})
