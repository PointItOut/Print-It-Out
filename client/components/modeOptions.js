import React, {Component} from 'react'
import {connect} from 'react-redux'
import PropTypes from 'prop-types'
import axios from 'axios'
import {AddGame} from '.'
import {isScreenLarge, tooSmallToast} from '../canPlay'

class ModeOptions extends Component {
  constructor() {
    super()
    this.state = {partnerMode: false}
    this.handleChooseMode = this.handleChooseMode.bind(this)
  }
  handleChooseMode(currentMode) {
    if (isScreenLarge()) {
      if (currentMode === 'partner') {
        this.setState({partnerMode: true})
      }
      const {loadQuestions} = this.props
      //load questions dispatches a thunk to get the questions and  dispatch an action to put them on state and redirect the user to the play page
      loadQuestions(this.props.chosenCategory, currentMode)
    } else tooSmallToast()
  }

  render() {
    const {chooseMode} = this.props
    return (
      <div>
        <h4>Step 2: Choose a Mode</h4>
        <button
          type="button"
          className="btn btn-main"
          onClick={() => this.handleChooseMode('solo')}
        >
          Start Solo Game
        </button>
        <button
          type="button"
          className="btn btn-main"
          onClick={() => this.handleChooseMode('partner')}
        >
          Create Multiplayer Game
        </button>
        {this.state.partnerMode ? <AddGame /> : null}
      </div>
    )
  }
}

export default ModeOptions

// PROP TYPES
ModeOptions.propTypes = {
  chooseMode: PropTypes.func,
  chosenCategory: PropTypes.object
}
