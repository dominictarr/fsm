
var FSM = require('../fsm')
  , it = require('it-is')

exports ['basic'] = function (){
  var s2e1 = false, s2 = false

  var fsm = new FSM({
    s1: {
      e1: 's2' //transition to state 2
    , e2: function (){console.log('event2')}//call func but do not change state
    }
  , s2: {
      _in: function (){ //call func when enter state
          s2 = true
          console.log('entered state2')
        }    , e1: ['s1', function (){
        s2e1 = true
        console.log('event1 in state2')
      }]
    }
  })

  it(fsm.getStates()).has(['s1','s2'])//end and fatal states will be created automaticially
  it(fsm.getEvents()).deepEqual(['e1','e2'])

  it(s2).equal(false)
  it(fsm.getState()).equal('s1')
  fsm.event('e1')
  it(fsm.getState()).equal('s2')
  it(s2).equal(true)
  it(s2e1).equal(false)
  fsm.event('e1')
  it(fsm.getState()).equal('s1')
  it(s2e1).equal(true)
  //e1 then goes back to state 1.
}

exports ['multiple function calls'] = function (){
  var s2e1_1 = false, s2e1_2 = false, s2 = false,s2_2 = false

 var fsm = new FSM({
    s1: {
      e1: 's2' //transition to state 2
    , e2: function (){console.log('event2')}//call func but do not change state
    }
  , s2: {
      _in: [function (){
          s2 = true
          console.log('entered state2')
        }, //call func when enter state
        function (){
          s2_2 = true
          console.log('entered state2, function 2')
        }]

    , e1: ['s1', function (){
        s2e1_1 = true
        console.log('event1 in state2 function1')
      },
      function (){
        s2e1_2 = true
        console.log('event1 in state2 function2')
      }]
    }
  })

  it(s2).equal(false)
  it(fsm.getState()).equal('s1')
  fsm.event('e1')
  it(fsm.getState()).equal('s2')
  it(s2).equal(true)
  it(s2_2).equal(true)
  it(s2e1_1).equal(false)
  it(s2e1_2).equal(false)
  fsm.event('e1')
  it(fsm.getState()).equal('s1')
  it(s2e1_1).equal(true)
  it(s2e1_2).equal(true)
}

//*/

exports ['sequence'] = function (){
  var fsm = new FSM({
    s1: {
      e1: 's2' //transition to state 2
    }
  , s2: {
      e1: ['s1', function (){
      }]
    }
  })
  it(fsm.sequence('e1 e2 e1 e2'.split(' ')).getState()).equal('s1')
}

exports ['create functions for each event'] = function (){

  var fsm = new FSM({
    s1: {
      e1: 's2', //transition to state 2
      e2: 's1' //stay in this state
    }
  , s2: {
      e1: ['s1', function (){}]
    }
  })
  
  it([fsm.e1,fsm.e2]).every(it.function())
}

exports ['if all fsm is sync, callback is called sync'] = function (){

  var called = false
    , fsm = new FSM({
    start: {
      _in: function (){ this.callback('next')() }
    , next: 'end'
    }
  }).call(function (){
    called = true
  })
  
  it(called).equal(true)

}

exports ['fsm should not catch errors thrown in final callback'] = function (){

  var called = 0
    , caught = false
    , err = new Error('thrown in callback')
    , fsm = new FSM({
    start: {
      _in: function (){ this.callback('next')() }
    , next: 'end'
    }
  })
  try {
  fsm.call(function (){
    called ++
    throw err
  })
  } catch (_err){
    caught = true
    it(_err).equal(err)
  }
  it(caught).ok()
  it(called).equal(1)
}