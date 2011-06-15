
var curry = require('curry')

module.exports = FSM

function first(obj){
  for(var i in obj){
    return i
  }
}
/*
TODO:

  namespaced events
  (specificially, name spaced errors)

  process sync events FIFO no LIFO.
  
  check graph is fully connected and no dead ends.

*/


function FSM (schema){
  if(!(this instanceof FSM)) return new FSM (schema)

  var state = first(schema) //name it start, OR ELSE
    , self = this
    , events = []
    , changing = false
    , callback
  
  this.transitions = []
  
  //create default states.
  if(!schema.end)
    schema.end = {
      _in: function (){
      callback.apply(null,[].slice.call(arguments))}
    }

  //create default states.
  if(!schema.fatal)
    schema.fatal = {
      _in: function (err){
        if('function' !== typeof callback)
          throw err || new Error ('FSM in fatal state')
        callback.apply(null,[].slice.call(arguments))
        }
    }

  this.local = {}
  this.save = {}
  
  this.getState = function (){
    return state
  }

  this.getStates = function (){
    var s = []
    for(var i in schema)
      if(!~s.indexOf(i))
        s.push(i)
    return s
  }

  this.sequence = function (seq){
    seq.forEach(function (e){
      self.event(e,[])
    })
    return this
  }

  //get events, and check that the transtions are valid
  function isState(e){
    return schema[e] ? e : false
  }
  var isArray = Array.isArray

  this.getEvents = function (){
    var s = []
    for(var i in schema){
      for(var j in schema[i])//events
        if(!~s.indexOf(j) && j[0] != '_')
          s.push(j)
        if(j !== '_in' && 'function' !== typeof schema[i][j]){ //repeating
          var trans = schema[i][j]
          trans = isArray(trans) ? trans[0] : trans
          if(!isState(trans))
            throw new Error(['transition:', j, ':', i, '->', trans, 'is not to a valid state'].join(' ') )
        }
    }
    return s
  }

  function applyTo(args,funx){
    args = args || []
    try {
      if('function' == typeof funx) {
        return funx.apply(self,args)
      }
      funx.forEach(function (e){
        e.apply(self,args)
      })
    } catch (err) {
      //action threw an exception, generate throw event. (will transition to fatal by default)
      //unless the FSM is complete, then throw it again and let someone else handle it.
      if(state == 'fatal' || state == 'end')
        throw err
      self.event('throw', [err].concat(args))
    }
  }

  this.callback = function (eventname){ //add options to apply timeout
    return function () {
      var args = [].slice.call(arguments)
      self.event(args[0] ? 'error' : eventname, args)
    }
  }
  /*
    rewrite this function:
    
    push event onto a list
    
    then if FSM isn't already between states 
    (because many events could be generated syncronously)
  
    start processing events, on a first come first served basis.
  */
  this.event = function (e,args){
    events.push([e,args])

    while(!changing && events.length){
      changing = true
      changeState.apply(this,events.shift())
      changing = false
    }
  }
  function changeState (e,args) {
    var oldState = state
      , trans = schema[state][e] || (e === 'error' || e === 'throw' ? 'fatal' : null)

    args = args || []

    if('string' === typeof trans && isState(trans)){
      state = trans
      self.transitions.push(e)
    } else if (isArray(trans) && isState(trans[0])){
      state = trans[0]
      self.transitions .push(e)
      applyTo(args,trans.splice(1))
    } else if('function' == typeof trans)
      throw new Error('transition cannot be function:' + trans)

    console.log(e, ':', oldState, '->', state)

    if(schema[state]._in && oldState != state){
      console.log(schema[state]._in.toString())
      applyTo(args,schema[state]._in)
    }
    return self
  }
  
  this.getEvents().forEach(function (e){
    self[e] = function (){self.event(e,[].slice.call(arguments))}
  })
  
  this.call = function () {
    args = [].slice.call(arguments)
    if('function' === typeof args[args.length - 1])
      callback = args.pop()
    applyTo(args,schema.start._in)
  }
}
