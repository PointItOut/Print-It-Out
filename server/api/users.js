const router = require('express').Router()
const { User, UserCategory, Category, Game } = require('../db/models')
const { userMatchesParam } = require('../../secureHelpers')
module.exports = router

router.get('/', async (req, res, next) => {
  try {
    const users = await User.findAll({
      // explicitly select only the id and email fields - even though
      // users' passwords are encrypted, it won't help if we just
      // send everything to anyone who asks!
      attributes: ['id', 'email', 'userName', 'highScore']
    })
    res.json(users)
  } catch (err) {
    next(err)
  }
})

// for when a user subscribes to a category
router.put('/:userId/categories', userMatchesParam, async (req, res, next) => {
  try {
    const userCategory = await UserCategory.findOrCreate({
      where: { userId: +req.params.userId, categoryId: +req.body.categoryId }
    })
    res.json(userCategory)
  } catch (err) { next(err) }
})

router.put('/score', async (req, res, next) => {
  try {
    console.log('req.user=====>', req.user)
    console.log('req.body', req.body)
    let currentscore = req.body.score
    let category = ''
    if (!req.body.category) {
      const game = await Game.findOne({ where: { id: req.user.gameId } })
      category = await Category.findOne({ where: { id: game.categoryId } })
    }
    else {
      category = req.body.category
    }
    const usercategory = await UserCategory.findOne({ where: { userId: req.user.id, categoryId: category.id } })
    if (usercategory) {
      if (currentscore > usercategory.userHighScore) {
        await UserCategory.update(
          { userHighScore: currentscore },
          { where: { userId: req.user.id, categoryId: category.id } }
        )
      }
    } else {
      await UserCategory.create({ userId: req.user.id, categoryId: category.id, userHighScore: currentscore })
    }
    res.status(204).send()
  } catch (err) { next(err) }
})


// for when a user unsubscribes from a category
router.delete('/:userId/categories/:categoryId', userMatchesParam, async (req, res, next) => {
  try {
    await UserCategory.destroy({
      where: {
        userId: +req.params.userId,
        categoryId: +req.params.categoryId
      }
    })
    res.status(204).send()
  } catch (err) { next(err) }
})
