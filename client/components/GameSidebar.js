import React from 'react'
import Countdown from 'react-countdown-now'
import AddConfetti from './AddConfetti'
import { Scoreboard, Opentok } from './index'
import { connect } from 'react-redux'
import { deleteGame } from '../store/game'
import { withRouter } from 'react-router-dom'
import { setTimeOver } from '../store/game'


const GameSidebar = props => {
  console.log('=============>', props.setTimeOver)
  const dispatchsetTimeOver = props.setTimeOver
  const renderer = ({ minutes, seconds, completed }) => {
    if (completed) {
      dispatchsetTimeOver(true)
      return (
        <div>
          <AddConfetti />
        </div>
      )
    } else {
      return (
        <span className="clock">
          {minutes}:{seconds}
        </span>
      )
    }
  }
  const token = props.token
  const currentgame = props.currentgame
  const startGame = props.startGame
  const deleteGame = props.deleteGame
  const Mode = 'partner'
  return (
    <div id="game-sidebar">
      {startGame || props.isSolo ? (
        <div>
          <Countdown date={Date.now() + 10000} renderer={renderer} />
          <Scoreboard isSolo={props.isSolo} />
        </div>
      ) : null}

      {!props.isSolo ? (
        <Opentok currentgame={currentgame} token={token} />
      ) : <button type='button' onClick={() => { props.history.push('/home') }}>Exit</button>}
      {startGame && props.user.host ?
        <button type='button' onClick={() => { deleteGame(currentgame.name, Mode) }}>Exit</button>
        : null}
    </div>
  )
}

const mapDispatchToProps = function (dispatch) {
  return {
    deleteGame: (gamename, mode) => dispatch(deleteGame(gamename, mode)),
    setTimeOver: (logic) => dispatch(setTimeOver(logic))
  }
}

const mapState = state => ({
  user: state.user
})

export default withRouter(connect(mapState, mapDispatchToProps)(GameSidebar))