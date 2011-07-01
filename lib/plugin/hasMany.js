module.exports = function(modelConstructor, modelConfig) {
  //enumerate hasMany associations
  for(var key in modelConfig.hasMany) {
    var association = modelConfig.hasMany[key];
    association.name = key;
  }
}
