//helper function:
//copies all items in 'souce' to 'destination'
//note: this overwrites any currently existing 
//items in destination
var apply = function(destination, source) {
  for (var key in source) {
    if (source.hasOwnProperty(key)) {
      destination[key] = source[key];
    }
  }
}

//constructor for the 'Field' object
//takes a config object containing properties
//of the field
var Field = function(config) {
  //this allows the field to be called in 
  //the node.js style of `Field(config)` instead
  //of the traditional `new Field(config)` style
  if (!(this instanceof Field)) {
    return new Field(config);
  }
  //copy all properties of config into this object
  apply(this, config);
}

//whether or not to include this field in 
//queries which insert data into the models' table
Field.prototype.allowInsert = function() {
  if (this.id) return false;
  if (this.allowInsert) return true;
  
  return false;
}

//whether or not to include this field in
//queries which update model data
Field.prototype.allowUpdate = function() {
  return !this.id;
}

//returns true if this field is an 
//indentity column, otherwise false
Field.prototype.isIdentity = function() {
  return this.id;
}

var ModelPrototype = function() {}

//generates an object which contains
//class methods common to every `Model`
//the `createClassMethods` method takes in
//the model (constructor) and the initial definition
//configuration as its two parameters
var createClassMethods = function(model, config) {
  var fields = [];
  
  return {
    //adds a field to the model definition
    addField: function(field) {
      fields.push(Field(field));
    },
    // This method is ugly and this api blows
    //it should really just return an array of all the fields
    //which the consumer can then filter as needed
    getFields: function() {
      fields.all = fields;
      fields.insertable = fields.filter(function(field) {
        return field.allowInsert();
      })
      fields.insertable.names = fields.insertable.map(function(field) {
        return field.name;
      })
      fields.updatable = fields.filter(function(field) {
        return field.allowUpdate();
      })
      fields.updatable.names = fields.updatable.map(function(field) {
        return field.name;
      })
      fields.identity = fields.filter(function(field) {
        return field.isIdentity();
      })
      fields.identity.names = fields.identity.map(function(field) {
        field.name;
      })
      
      return fields;
    },
    getField: function(name) {
      var fields = this.getFields();
      for(var i = 0, len = fields.length; i < len; i++) {
        var field = fields[i];
        if(field.name == name) {
          return field;
        }
      }
    }
  }
}


var fakeLogger = {

};
['debug', 'info', 'warn', 'error'].forEach(function(lvl) {
  fakeLogger[lvl] = console.log.bind(console);
})

var registeredModels = {};
//the main `Model` class
var Model = {
  //the logger to use
  logger: fakeLogger,
  
  // Retrieves a defined model by it's name
  get: function(name) {
    return registeredModels[name];
  },
  
  //adds a plugin to the Model system which 
  //gets called for each defined model during
  //the model's definition...
  //this allows a plugin to modifiy the definition of each model
  addPlugin: function(name, handler) {
    plugins.push({
      name: name,
      handler: handler
    })
  },
  
  //define's a new model
  define: function(name, config) {
    Model.logger.debug('[model.js] Defining model ' + name)
    
    var model = function(initialConfig) {
      if (!(this instanceof model)) {
        return new model(initialConfig);
      }
      
      var self = this;
      var fields = self.model.getFields();
      
      if (initialConfig) {
        for (var i = 0, len = fields.length; i < len; i++) {
          var field = fields[i];
          this[field.name] = initialConfig[field.name];
        }
      }
    }
    
    config.name = name;
    var p = model.prototype;
    p.model = model;
    model.logger = Model.logger;
    config.fields = config.fields || [];
    var idFields = config.fields.filter(function(field) {
      return field.id == true;
    })
    
    // If no identity field is found, default to id
    if (!idFields.length) {
      config.fields.unshift({
        name: 'id',
        id: true
      });
    }

    apply(model, createClassMethods(model, config))
    config.fields.forEach(function(field) {
      model.addField(field);
    });

    plugins.forEach(function(plugin) {
      Model.logger.debug('[model.js] Applying plugin ' + plugin.name + ' to model ' + name);
      plugin.handler(model, config);
    });
    
    registeredModels[name] = model; 
    return model;
  }
}

var plugins = [];

module.exports = Model;
