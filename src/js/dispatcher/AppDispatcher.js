var Dispatcher = require('./Dispatcher');
var assign = require('object-assign');

var AppDispatcher = assign({}, Dispatcher.prototype, {

});

module.exports = AppDispatcher;
