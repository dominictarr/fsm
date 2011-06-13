
var curry = require('curry')

module.exports = FSM

function first(obj){
  for(var i in obj){
    return i
  }
}

function FSM (schema){
  if(!(this instanceof FSM)) return new FSM (schema)

  var state = first(schema) //name it start, OR ELSE
    , self = this
    , callback
  
  this.transitions = []
  
  if(!schema.end)
    schema.end = {
      _in: function (){callback.apply(null,[null].concat([].slice.call(arguments)))}
    }

  if(!schema.fatal)
    schema.fatal = {
      _in: function (err){
        if('function' !== typeof callback)
          throw arguments
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

  this.getEvents = function (){
    var s = []
    for(var i in schema){
      for(var j in schema[i])
        if(!~s.indexOf(j) && j[0] != '_')
          s.push(j)
    }
    return s
  }

  function isState(e){
    return schema[e] ? e : false
  }
  var isArray = Array.isArray

  function applyAll(list,ignore,args){
    args = args || []
    try {
      if('function' == typeof list) {
        console.log("ARGS",args)     
        return list.apply(self,args)
      }
      list.forEach(function (e){
            e.apply(self,args)
      })
    } catch (err) {
      //action thru an exception, generate throw event. (will transition to fatal by default)
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
  this.event = function (e,args){
    var oldState = state
      , trans = schema[state][e] || (e === 'error' || e === 'throw' ? 'fatal' : null)

    args = args || []

    if('string' === typeof trans && isState(trans)){
      state = trans
      this.transitions .push(e)
    } else if (isArray(trans) && isState(trans[0])){
      state = trans[0]
      this.transitions .push(e)
      applyAll(trans.splice(1),this,args)
    }

    console.log( e,':',oldState,'->',state)

    if(schema[state]._in && oldState != state)
      applyAll(schema[state]._in,this,args)

    return this
  }
  
  this.getEvents().forEach(function (e){
    self[e] = function (){self.event(e,[].slice.call(arguments))}
  })
  
  this.call = function () {
    args = [].slice.call(arguments)
    if('function' === typeof args[args.length - 1])
      callback = args.pop()
    applyAll(schema.start._in,self,args)
  }
}
