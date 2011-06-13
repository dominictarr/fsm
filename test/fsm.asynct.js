

var FSM = require('../fsm')
  , it = require('it-is')

/*
turn fsm into a function

then, provide a mock interface

construct tests for every state and every transition, using fixtures.

run the tests,

FSM will tell you if you have coverage for every path.

all transitions defined should be tested.
must always be possible to get from start state to end states

*/

exports ['FSM.call turns fsm into a function'] = function (test){

  var fsm = new FSM({
    start: {
      _in: function (){
        it(arguments).deepEqual((function(){return arguments})(1,2,3))
        test.done()
      }
    }
  }).call(1,2,3)
}

exports ['start fsm rolling and it will callback when it gets to end'] = function (test){

  var fsm = new FSM({
    start: {
      _in: function (){
        it(arguments).deepEqual((function(){return arguments})(1,2,3))
        setTimeout(this.done,10)
      },
      done: 'end'
    }
  }).call(1,2,3, function (err){
    it(err).equal(null)
    test.done()
  })
}

exports ['if an event function throws, follow error transition'] = function (test){

  var err = new Error('a error occured in the event action')
    , fsm = 
  new FSM({
    start: {
      _in: function () {
        throw err
      },
      done: 'end'
    }
  }).call(1,2,3, function (_err){
    console.log('error', _err)
    it(_err).equal(err)
    test.done()
  })
}

exports ['callback function which auto handles errors'] = function (test){

  new FSM({
    start: {
      _in: function (){
        setTimeout(this.callback('next'),10)
      },
      next: 'middle'
    },
    middle: {
      _in: function (){
        console.log('MIDDLE')
        setTimeout(this.callback('next'),10)
      },
      next: 'end'
    }
  }).call(1,2,3, function (err){
    it(err).equal(null)
    test.done()
  })
}