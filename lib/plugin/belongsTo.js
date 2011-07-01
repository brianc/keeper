var upcaseFirst = function(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
module.exports = function(modelConstructor, modelConfig) {
  //enumerate hasMany associations
  for(var key in modelConfig.belongsTo) {

    var association = modelConfig.belongsTo[key];
    association.name = key;

    var fieldName = association.name+'Id';
    modelConstructor.addField({
      name: fieldName
    })

    var upcasedName = upcaseFirst(association.name);
    modelConstructor.prototype['get'+upcasedName] = function(callback) {
      callback(null, this['_'+association.name]);
    }

    modelConstructor.prototype['set'+upcasedName] = function(owner) {
      this['_'+association.name] = owner;
      this[fieldName] = owner.id;
    }
  }
}
