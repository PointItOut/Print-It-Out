const router = require('express').Router()
const { Category, UserCategory, User, Question, Choice } = require('../db/models')
const { userMatchesParam, userOwnsCategory } = require('../../secureHelpers')

// GET public categories
router.get('/public', async (req, res, next) => {
  try {
    const publicCategories = await Category.findAll({
      where: {
        public: true
      }
    })
    res.json(publicCategories)
  } catch (err) { next(err) }
})

// GET user's personal categories
router.get('/private/:userId', userMatchesParam, async (req, res, next) => {
  try {
    const user = await User.findById(+req.params.userId)
    const userCategories = await user.getCategories()
    res.json(userCategories.filter(category => !category.public))
  } catch (err) { next(err) }
})

// POST new category
router.post('/', async (req, res, next) => {
  try {
    const { userId, category } = req.body

    if (req.user.id !== userId) {
      const err = new Error('Not authorized')
      next(err)
    }

    const categoryBody = {
      ...category,
      authorId: +userId
    }

    const newCategory = await Category.create(categoryBody)

    const userCategory = await UserCategory.create({
      categoryId: newCategory.id,
      userId: +userId
    })

    res.json(newCategory)
  } catch (err) { next(err) }
})

// GET category by id (along with its top scores)
router.get('/:categoryId', async (req, res, next) => {
  try {
    const category = await Category.findById(+req.params.categoryId)

    const questions = await Question.findAll({
      where: {
        categoryId: category.id
      },
      include: { model: Choice }
    })

    const scores = await UserCategory.findAll({
      where: {
        categoryId: +req.params.categoryId
      }
    })

    const scoresUsers = await Promise.all(scores.map(score => User.findById(score.userId)))

    const scoresObjects = scores.map((score, index) => {
      return {
        userHighScore: score.userHighScore,
        userId: score.userId,
        userName: scoresUsers[index].userName
      }
    })

    const topTenScores = scoresObjects.sort((a, b) => {
      if (a.userHighScore < b.userHighScore) {
        return 1
      } else if (b.userHighScore < a.userHighScore) {
        return -1
      } else { return 0 }
    }).slice(0, 10)

    const responseObject = {
      name: category.name,
      authorId: category.authorId,
      id: category.id,
      public: category.public,
      questionTotal: questions.length,
      questions,
      topScores: topTenScores
    }

    res.json(responseObject)
  } catch (err) { next(err) }
})

router.delete('/:categoryId', userOwnsCategory, async (req, res, next) => {
  try {
    // delete the category automatically deletes the UserCategory instances
    // questions associated with the category do not get deleted... and their choices do not either
    const categoryId = +req.params.categoryId
    await Promise.all([
      Category.destroy({ where: { id: categoryId } }),
      Question.destroy({ where: { categoryId } })
    ])
    // choices don't automatically delete, but their questionId will get set to null
    await Choice.destroy({
      where: { questionId: null }
    })
    res.status(204).send()
  } catch (err) { next(err) }
})

module.exports = router
