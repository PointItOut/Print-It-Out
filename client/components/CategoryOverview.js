import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import axios from 'axios'
import { Link } from 'react-router-dom'
import {
  authorRemoveCategory,
  userUnsubscribeFromCategory
} from '../store/categories'
import { Leaderboard, PieChart } from '.'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrash, faPencilAlt } from '@fortawesome/free-solid-svg-icons'


class CategoryOverview extends Component {
  constructor() {
    super()
    this.state = {
      categoryDisplayed: null,
      userData: {}
    }
    this.handleAddToAccount = this.handleAddToAccount.bind(this)
    this.handleDeleteCategory = this.handleDeleteCategory.bind(this)
    this.handleUnsubscribe = this.handleUnsubscribe.bind(this)
  }

  async componentDidMount() {
    // if we are navigating from the userhome, there is no match.params so we use the 'currentcategory'
    // if there is match.params, we know we navigated there ourselves by typing it into the url bar, so we use the id in the url
    const { match, currentCategory, user } = this.props
    const categoryId = match ? match.params.categoryId : currentCategory.id
    const userId = user.id
    if (categoryId) {
      const { data } = await axios.get(`/api/categories/${categoryId}`)
      const userInfo = await axios.get(`/api/users/${userId}/categories/${categoryId}`)
      this.setState({
        categoryDisplayed: data,
        userData: userInfo.data
      })
    }
  }

  async componentDidUpdate(prevProps) {
    const { match, currentCategory, user } = this.props
    if (prevProps.currentCategory !== currentCategory) {
      if (currentCategory.id) {
        const { data } = await axios.get(`/api/categories/${currentCategory.id}`)
        const userInfo = await axios.get(`/api/users/${user.id}/categories/${currentCategory.id}`)
        this.setState({
          categoryDisplayed: data,
          userData: userInfo.data
        })
      } else {
        // currentCategory must be {} because we reset it
        this.setState({
          categoryDisplayed: null,
          userData: {}
        })
      }
    }
  }

  async handleAddToAccount() {
    const { user, history } = this.props
    const { categoryDisplayed } = this.state
    // update user categories subscription by creating a UserCategory instance
    const { data } = await axios.put(`/api/users/${user.id}/categories`, {
      categoryId: categoryDisplayed.id
    })
    history.push('/home')
  }

  handleDeleteCategory() {
    const { removeUsersCategory, resetCategory } = this.props
    const { categoryDisplayed } = this.state
    removeUsersCategory(categoryDisplayed)
    resetCategory()
  }

  handleUnsubscribe() {
    const { unsubscribe, resetCategory, user } = this.props
    const { categoryDisplayed } = this.state
    unsubscribe(categoryDisplayed, user.id)
    resetCategory()
  }

  render() {
    const { categoryDisplayed, userData } = this.state
    const { currentCategory, user, match } = this.props

    if (categoryDisplayed) {
      return (
        <div className="main-container">
          <div className="text-center">
            <h2 className="text-center">Category: {categoryDisplayed.name}</h2>{' '}
            &nbsp;<span className="badge badge-info text-center">
              {categoryDisplayed.questionTotal} questions
            </span>&nbsp;
            <p className="text-center">
              {!categoryDisplayed.public && match ? (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={this.handleAddToAccount}
                >
                  Add to my account
                </button>
              ) : null}&nbsp;
              {// if you are looking at a category you made, you can delete the category from the database
                !categoryDisplayed.public &&
                  categoryDisplayed.authorId === user.id ? (
                    <FontAwesomeIcon
                      className="blueIconLink"
                      icon={faTrash}
                      onClick={this.handleDeleteCategory}
                    />
                  ) : null}&nbsp;

              { // if you are the author of the category, share the url with your friends:
                categoryDisplayed.authorId === user.id ? (
                  <div>
                    <h6>Share this URL with friends to let them play with your category:</h6>
                    <h6>{`http://point-it-out.herokuapp.com/categories/${categoryDisplayed.id}`}</h6>
                  </div>
                ) : null
              }&nbsp;

              {// if you are looking at a private category you are subscribed to (i.e. no match.params) and it is NOT a category you made, you can unsubscribe from the category
                !categoryDisplayed.public &&
                  !match &&
                  categoryDisplayed.authorId !== user.id ? (
                    <button
                      className="btn btn-info"
                      onClick={this.handleUnsubscribe}
                    >
                      Unsubscribe from Category
                </button>
                  ) : null}&nbsp;
              {user.id === categoryDisplayed.authorId ? (
                <Link to={`/categories/${categoryDisplayed.id}/edit`}>
                  <FontAwesomeIcon
                    className="blueIconLink"
                    icon={faPencilAlt}
                  />
                </Link>
              ) : null}
            </p>
          </div>
          <PieChart totalCorrect={userData ? userData.correctGuesses : 0} totalIncorrect={userData ? userData.incorrectGuesses : 0} categoryName={categoryDisplayed.name} userChart={true} />
          <Leaderboard categoryDisplayed={categoryDisplayed} />
        </div>
      )
    } else {
      return null
    }
  }
}

const mapState = state => ({
  currentCategory: state.categories.current,
  user: state.user
})

const mapDispatch = dispatch => ({
  removeUsersCategory: category => dispatch(authorRemoveCategory(category)),
  unsubscribe: (category, userId) =>
    dispatch(userUnsubscribeFromCategory(category, userId))
})

export default connect(mapState, mapDispatch)(CategoryOverview)

CategoryOverview.propTypes = {
  currentCategory: PropTypes.object,
  user: PropTypes.object,
  removeUsersCategory: PropTypes.func,
  unsubscribe: PropTypes.func
}
