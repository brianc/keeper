var pg = require('pg');
var helper = require(__dirname);

test('User model', function(t) {

  var User = helper.keeper.define('user', {
    table: 'users',
    fields:[{
      name: 'email'
    },{
      name: 'firstname'
    },{
      name: 'lastname'
    }]
  })

  t.test('can override table name', function(t) {
    t.equal(User.getTableName(), 'users');
    t.done();
  })

  t.test('can CRUD', function(t) {
    var user = new User({
      email: 'test@example.com',
      firstname: 'brian',
      lastname: 'carlson'
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
          t.equal(user.firstname, 'brian');
          t.equal(user.lastname, 'carlson');
          t.equal(user.email, 'test@example.com');
          user.firstname = 'bang';
          user.lastname = 'cobra';
          user.email = 'testing@example.com';
          user.update(function(err, updatedUser) {
            t.equal(err, null)
            t.equal(updatedUser.firstname, 'bang');
            t.equal(updatedUser.lastname, 'cobra');
            t.equal(updatedUser.email, 'testing@example.com');
            user.destroy(function(err) {
              t.equal(err, null);
              t.done();
            })
          });
        })
      });
    })
  })

  t.test('can find', function(t) {
    var user = new User({
      firstname: 'boom',
      lastname: 'example',
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
          t.equal(user.firstname, 'boom');
          t.equal(user.lastname, 'example');
          t.equal(user.email, 'boom@example.com')
          pg.end();
          t.done();
        })
      })
    })
  })
  t.done();
})

