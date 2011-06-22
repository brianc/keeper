test = require('unit');

if(!module.parent) {
  require('fs').readdir(__dirname, function(err, files) {
    if(err) throw err;
    files.forEach(function(f) {
      require(__dirname + '/' + f.replace('.js',''))
    })
  })
}

var keeper = require(__dirname + '/../lib');
keeper.logger = {
  debug: function() {
    
  }
}
var pg = require('pg');
pg.defaults.password = process.ARGV[2];
pg.defaults.user = 'postgres';
pg.defaults.database = 'keep';

keeper.addPlugin('pg', require(__dirname + '/../lib/plugin/storage/pg'))

module.exports = {
  db: pg,
  keeper: keeper,
  user: {
    clearAll: function(cb) {
      var client = new pg.Client();
      client.connect();
      client.query("DELETE FROM users", cb);
      client.on('drain', client.end.bind(client));
    }
  }
}
