# Finite State Machine for nodejs #

the idea here is to define control flow seperately from IO.

an FSM is a set to of *States*, a set of *Events*, a set of *Transitons* 
which define state changes when events occur, and finally a set of *Actions*:

functions which are invoked when a particular transition occurs.

this is currently an experimental project, but the potential benefits include:

  * automatic checking of FSM model, for example, check there is no dead end states,
    and that is it always possible to get from start to finish.
  * easily test each Transition with fixtures, and automaticially check that all transitions have tests.
  * when an unexpected error does occur, log the sequence of events which has produced that state.
  
currently i'm trialing `fsm` in `testbedjs.org` 