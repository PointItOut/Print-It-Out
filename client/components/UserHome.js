import React from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import {setCategory} from '../store/category'
import {getQuestions} from '../store/questions'
import { AddGame, JoinGame } from './index'

/**
 * COMPONENT
 */
export class UserHome extends React.Component {
  constructor() {
    super()
    this.state = {
      choosingMode: false,
      choosingCategory: false,
      partnerMode: false
    }
    this.handlePlay = this.handlePlay.bind(this)
    this.renderCategoryChoices = this.renderCategoryChoices.bind(this)
    this.handleChooseCategory = this.handleChooseCategory.bind(this)
    this.handleChooseMode = this.handleChooseMode.bind(this)
  }

  handlePlay() {
    this.setState({
      choosingCategory: true
    })
  }

  renderCategoryChoices() {
    const {handleChooseCategory} = this
    return (
      <div>
        <button
          id="btn-geography"
          onClick={() => handleChooseCategory('geography')}
        >
          geography
        </button>

        <button id="btn-art" onClick={() => handleChooseCategory('art')}>
          art
        </button>

        <button
          id="btn-history"
          onClick={() => handleChooseCategory('history')}
        >
          history
        </button>
      </div>
    )
  }

  handleChooseCategory(category) {
    const {chooseCategory} = this.props
    chooseCategory(category)
    this.setState({
      choosingMode: true
    })
  }

  handleChooseMode(currentMode) {
    if (currentMode === 'partner') {
      this.setState({partnerMode: true})
    }
    const {loadQuestions} = this.props
    //load questions dispatches a thunk to get the questions and  dispatch an action to put them on state and redirect the user to the play page
    loadQuestions(this.props.chosenCategory, currentMode)
    //can add more functionality here as needed
  }

  render() {
    const {username} = this.props

    return (
      <div>
        <h3>Welcome, {username}</h3>
        {!this.state.choosingCategory ? (
          <div>
            <button onClick={this.handlePlay}>Play</button>
            <JoinGame />
          </div>
        ) : null}

        {!this.state.choosingMode && this.state.choosingCategory
          ? this.renderCategoryChoices()
          : null}

        {this.state.choosingMode ? (
          <div>
            <button
              onClick={() => {
                this.handleChooseMode('partner')
              }}
            >
              Challenge a Friend
            </button>
            <button
              onClick={() => {
                this.handleChooseMode('solo')
              }}
            >
              Challenge Yourself
            </button>
          </div>
        ) : null}
        {this.state.partnerMode ? <AddGame /> : null}
      </div>
    )
  }
}

/**
 * CONTAINER
 */
const mapState = state => {
  return {
    chosenCategory: state.category,
    username: state.user.userName
  }
}

const mapDispatch = dispatch => {
  return {
    chooseCategory: category => dispatch(setCategory(category)),
    loadQuestions: (category, currentMode) =>
      dispatch(getQuestions(category, currentMode))
  }
}

export default connect(mapState, mapDispatch)(UserHome)

/**
 * PROP TYPES
 */
UserHome.propTypes = {
  username: PropTypes.string
}