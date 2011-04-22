
module.exports = FSM

function first(obj){
  for(var i in obj){
    return i
  }
}

function FSM (schema){
  if(!(this instanceof FSM)) return new FSM (schema)

  var state = first(schema)

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
    var self = this
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

  function applyAll(list,self,args){
    if('function' == typeof list)
      return list.apply(self,args)
    list.forEach(function (e){
          e.apply(self,args)
    })
  }

  this.event = function (e,args){
    var oldState = state
    args = args || []
    var trans = schema[state][e]
      if('string' === typeof trans && isState(trans)){
        state = trans
      } else if (isArray(trans) && isState(trans[0])){
        console.log('**********', trans)
        state = trans[0]
        applyAll(trans.splice(1),this,args)
      }

    console.log( e,':',oldState,'->',state)

    if(schema[state]._in)
      applyAll(schema[state]._in,this,args)
    return this
  }
}
