const router = require('express').Router()
const {User, UserCategory} = require('../db/models')
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
