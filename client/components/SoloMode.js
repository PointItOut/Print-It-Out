import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import {CameraCanvas, GameSidebar} from './index'
import Countdown from 'react-countdown-now'
import {setTimeOver} from '../store/game'
import {withRouter} from 'react-router-dom'
import soundsObject from '../sounds'

class SoloMode extends Component {
  constructor() {
    super()
    this.state = {
      restarting: false
    }
    this.handleRestart = this.handleRestart.bind(this)
  }

  componentDidMount() {
    if (!this.props.startGame) {
      this.props.history.push('/home')
    }
    // for the initial tick at 3
    soundsObject.tick.play()
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.restarting === false && this.state.restarting === true) {
      soundsObject.tick.play() // for the initial tick at 3
      this.setState({
        restarting: false
      })
    }
  }

  handleRestart() {
    this.setState({
      restarting: true
    })
  }

  render() {
    const {questions, timeover} = this.props

    const renderer = ({seconds, completed}) => {
      if (completed) {
        clearInterval(this.state.ticker)
        return (
          <div className="game-wrapper mainPage">
            <CameraCanvas questions={questions} />
            <GameSidebar
              isSolo={this.props.match.path === '/solo'}
              handleRestart={this.handleRestart}
            />
          </div>
        )
      } else {
        return <span className="clock countdown">{seconds}</span>
      }
    }

    return (
      <div>
        <Countdown
          //force componentDidmount(CDM) when this changes
          //Countdown does a setInterval only in CDM.
          key={this.props.gameCountdown}
          date={this.props.gameCountdown}
          renderer={renderer.bind(this)}
          zeroPadLength={1}
          onTick={() => soundsObject.tick.play()}
        />
      </div>
    )
  }
}

const mapState = state => {
  return {
    questions: state.questions,
    timeover: state.game.timeover,
    gameCountdown: state.game.gameCountdown,
    startGame: state.game.startGame,
    games: state.game.games
  }
}

const mapDispatchToProps = function(dispatch) {
  return {
    setTimeOver: logic => dispatch(setTimeOver(logic))
  }
}

export default withRouter(connect(mapState, mapDispatchToProps)(SoloMode))

// PROP TYPES
SoloMode.propTypes = {
  questions: PropTypes.array,
  timeover: PropTypes.bool,
  gameCountdown: PropTypes.number,
  startGame: PropTypes.bool,
  games: PropTypes.array,
  setTimeOver: PropTypes.func
}
