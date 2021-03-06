import React, { Component } from 'react'
import { Shape, Stage, Layer, Text, Image } from 'react-konva'
import Konva from 'konva'
import Webcam from 'react-webcam'
import Diffy from './diffy'
import { withRouter } from 'react-router-dom'
import PropTypes from 'prop-types'
import {
  PurpleRect,
  BlueRect,
  YellowRect,
  RedRect,
  ChoiceTextBox,
  QuestionText,
  QuestionBox,
  RedBorder,
  GreenBorder,
  WinnerRect,
  TieRect,
  Backdrop,
  SoloPlayerEndGame
} from './canvas-rects'
import { connect } from 'react-redux'
import { submitAnswerIndex, setQuestion } from '../store/currentQuestion'
import { updateScore, evaluateAnswer } from '../store/score'
import { noMediaStream } from '../canPlay'
import { Crown } from './index'
import soundsObject from '../sounds'
import { setTimeOver } from '../store/game'

class CameraCanvas extends Component {
  constructor() {
    super()
    this.state = {
      loaded: false
    }
    this.nextQuestion = this.nextQuestion.bind(this)
  }

  componentDidMount() {
    const { setNewQuestion, questions, submitUserGuess } = this.props
    setNewQuestion(questions[0]) // start with first question
    submitUserGuess(null) // to reset userguess to null
    this.setState({
      loaded: true
    })
  }

  componentDidUpdate(prevProps) {
    const {
      currentQuestion,
      checkAnswer,
      user,
      location,
      match,
      tutorialMode,
      score
    } = this.props
    const { text, choices, userGuessIndex } = currentQuestion

    const currentQuestionExists = text !== ''
    const notGuessedYet = prevProps.currentQuestion.userGuessIndex === null
    const newGuessSubmitted = userGuessIndex !== null

    if (currentQuestionExists && notGuessedYet && newGuessSubmitted) {
      const partnerMode = !location.pathname.includes('solo')
      const gameName = match.params.name ? match.params.name : undefined

      const gameObj = {
        tutorialMode,
        partnerMode,
        oldTotal: score,
        userId: user.id,
        username: user.userName,
        gameName
      }

      choices[userGuessIndex].isCorrect
        ? soundsObject.giggle.play()
        : soundsObject.wrongHorn.play()
      checkAnswer(choices[userGuessIndex], gameObj)
      this.nextQuestion()
    }
  }

  nextQuestion() {
    const {
      setNewQuestion,
      questions,
      currentQuestion,
      submitUserGuess,
      location
    } = this.props
    const question = questions.find((ques, index) => {
      return questions[index - 1]
        ? questions[index - 1].id === currentQuestion.id
        : false
    })
    if (!question && location.pathname.includes('solo')) {
      // we are in solo mode and we have run out of questions!
      console.log('Out of questions, so time to end solo mode game?')
      // set timeover to true?
      this.props.endGameEarly()
    }

    // if we have another question remaining and the user has made a guess
    if (question && currentQuestion.userGuess !== null) {
      setTimeout(() => {
        submitUserGuess(null) // reset userGuess for next question
        setNewQuestion(question) // increment question
      }, 1500)
    }
  }

  render() {
    const facecoords = this.props.facecoord
    const { opponent, location, currentQuestion, timeover, user } = this.props
    const opponentNames = Object.keys(opponent).sort((name1, name2) => {
      const score1 = opponent[name1]
      const score2 = opponent[name2]
      if (score1 < score2) {
        return 1
      } else if (score1 > score2) {
        return -1
      } else {
        return 0
      }
    })

    const scores = Object.values(opponent)
    const maxscore = Math.max(...scores)
    const winner = opponentNames.filter(name => opponent[name] === maxscore)
    let chkwinner = false
    if (winner.length === 1) {
      chkwinner = true
    }
    const pathname = location.pathname
    const showCrown =
      pathname.includes('solo') || winner.includes(user.userName)
    const { choices } = currentQuestion
    const xPositions = [0, 266, 533, 799]

    return (
      <div id="video-container">
        <Diffy />
        <Webcam className="video" onUserMediaError={noMediaStream} />
        <Stage
          ref={ref => {
            this.stageRef = ref
          }}
          width={1000}
          height={750}
        >
          <Layer>

            <PurpleRect />
            <BlueRect />
            <YellowRect />
            <RedRect />

            {// option text boxes
              choices.map((choice, index) => (
                <ChoiceTextBox
                  id={choice.id}
                  choiceText={choice.text}
                  xPosition={xPositions[index]}
                />
              ))}

            {// if we have options and the user has guessed, show feedback:
              currentQuestion.userGuessIndex !== null && choices.length
                ? choices.map((choice, index) => {
                  if (choice.isCorrect) {
                    if (currentQuestion.userGuessIndex === index) {
                      // soundsObject.giggle.play()
                    }
                    return <GreenBorder xPosition={xPositions[index]} />
                  } else if (currentQuestion.userGuessIndex === index) {
                    // soundsObject.wrongHorn.play()
                    return <RedBorder xPosition={xPositions[index]} />
                  } else {
                    return null
                  }
                })
                : null}

            <QuestionBox />
            <QuestionText questionText={currentQuestion.text} />
            {facecoords && timeover && showCrown ? (
              <Crown facecoords={facecoords} pathname={pathname} />
            ) : null}
            {timeover ? <Backdrop /> : null}

            {timeover && chkwinner && !pathname.includes('solo') ? (
              <WinnerRect winner={winner} />
            ) : null}

            {timeover && !chkwinner && !pathname.includes('solo') ? (
              <TieRect />
            ) : null}

            {timeover && !chkwinner && !pathname.includes('solo') ? (
              <TieRect />
            ) : null}
            {timeover && pathname.includes('solo') ? (
              <SoloPlayerEndGame />
            ) : null}
          </Layer>
        </Stage>
      </div>
    )
  }
}

const mapState = state => ({
  currentQuestion: state.currentQuestion,
  score: state.score,
  user: state.user,
  opponent: state.opponent,
  timeover: state.game.timeover,
  facecoord: state.facecoord
})

const mapDispatch = dispatch => ({
  submitUserGuess: guess => dispatch(submitAnswerIndex(guess)),
  setNewQuestion: question => dispatch(setQuestion(question)),
  checkAnswer: (choiceObj, gameObj) =>
    dispatch(evaluateAnswer(choiceObj, gameObj)),
  updateUserScore: (score, partner, username, gameName) =>
    dispatch(updateScore(score, partner, username, gameName)),
  endGameEarly: () => dispatch(setTimeOver(true))
})

export default withRouter(connect(mapState, mapDispatch)(CameraCanvas))

// PROP TYPES
CameraCanvas.propTypes = {
  currentQuestion: PropTypes.object,
  score: PropTypes.number,
  user: PropTypes.object,
  timeover: PropTypes.bool,
  questions: PropTypes.array,
  tutorialMode: PropTypes.bool
}
