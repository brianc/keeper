var util = require('util')
var pg = require('pg')
//the sql plugin allows the model to be
//persisted to and from a sql database
module.exports = function(ctor, config) {

  ctor.getTableName = function() {
    return (config.table || config.name.toLowerCase());
  }

  ctor.connect = function(callback) {
    pg.connect(pg.defaults, callback);
  }

  ctor.query = function(config) {
    ctor.logger.debug('Connecting to database.');

    this.connect(function(err, client) {
      if (err) return config.callback(err);

      ctor.logger.debug('Executing query');
      ctor.logger.debug(config.text);
      ctor.logger.debug(config.values);

      client.query(config.text, config.values, function(err, result) {
        if (err) return config.callback(err);
        config.callback(null, result.rows);
      })
    })
  }

  ctor.get = function(id, callback) {
    this.find({id: id}, function(err, res) {
      if (err) return callback(err);
      callback(null, res.map(ctor)[0])
    })
  }

  ctor.all = function(callback) {
    ctor.find(null, callback);
  }

  ctor.find = function(params, callback) {
    var names = this.getFields().map(function(field) {
      return field.name;
    })
    var sql = ['SELECT "', names.join('", "'), '" FROM "', this.getTableName()];
    if(params) {
      sql.push('" WHERE ');
      var paramql = [];
      var values = [];
      var count = 1;
      for (var key in params) {
        paramql.push(key+'='+'$'+(count++))
        values.push(params[key]||null)
      }
      sql.push(paramql.join(','))
      this.query({
        text: sql.join(''),
        values: values,
        callback: callback
      })
    } else {
      this.query({
        text: sql.join('') + '"',
        callback: callback
      })
    }
  }

  //instance method allowing a model to be created
  ctor.prototype.create = function(callback) {
    var self = this;
    var fields = ctor.getFields();
    var idFields = fields.identity;
    var insertable = fields.insertable;

    var sql = ['INSERT INTO ', this.model.getTableName(), ' ( "', insertable.names.join('", "'), '") VALUES (']
    var index = 1;
    var valuePlaceHolders = insertable.map(function() { return '$' + index++; }).join(', ');
    sql.push(valuePlaceHolders);
    sql.push(') RETURNING ');
    var idFieldNames = idFields.map(function(field) { return field.name; }).join('", "');
    sql.push(idFieldNames);
    var sequel = sql.join('');
    var values = insertable.map(function(field) { return self[field.name] || field.defaultValue; });

    self.model.query({
      text: sequel,
      values: values,
      callback: function(err, result) {
        if (err) return callback(err);
        var me = result[0];
        self.id = result[0].id;
        for(var i = 0, len = insertable.length; i < len; i++) {
          var field = insertable[i];
          field.setDefaultValue(self)
        }
        callback(null, self)
      }
    })
  }

  // TODO concurrency (update WHERE field values == old field values)
  ctor.prototype.update = function(callback) {
    var self = this;
    var fields = ctor.getFields();
    var sql = ['UPDATE ' + ctor.getTableName() + ' SET "'];
    var index = 1;
    var updateFieldValues = [];
    for(var i = 0, len = fields.updatable.length; i < len; i++) {
      var field = fields.updatable[i];
      updateFieldValues.push(self[field.name] || field.defaultValue)
    }
    var sets = fields.updatable.map(function(field) {
      return field.name + '"=$' + index++
    }).join(', "');
    sql.push(sets);
    sql.push(' WHERE ')
    var f = [];
    var idFieldValues = []
    for(var i = 0, len = fields.identity.length; i < len; i++) {
      var field = fields.identity[i];
      f.push('"' + field.name + '" = $' + index++);
      idFieldValues.push(self[field.name]||field.defaultValue)
    }
    sql.push(f.join(' AND '));
    ctor.query({
      text: sql.join(''),
      values: updateFieldValues.concat(idFieldValues),
      callback: function(err, users) {
        if (err) callback(err);
        callback(null, self);
      }
    })
  }

  ctor.prototype.destroy = function(callback) {
    ctor.query({
      text: 'DELETE FROM "' + ctor.getTableName() + '" WHERE id=$1',
      values: [this.id],
      callback: callback
    })
  }
}
