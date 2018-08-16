module.exports = io => {
  let list = {}
  let questions = {}
  let games = {}

  io.on('connection', socket => {
    console.log(`A socket connection to the server has been made: ${socket.id}`)
    socket.broadcast.emit('new-connection', 'a new person join the room')

    socket.on('purple', payload => {
      socket.broadcast.emit('purple', payload)
    })

    socket.on('webcam', payload => {
      socket.broadcast.emit('webcam', payload)
    })

    socket.on('questions', payload => {
      const Game = payload.gameName
      if (!questions[Game]) {
        const currentquestions = payload.questions
        questions[Game] = currentquestions
      }

      socket.emit('questions', questions[Game])
      // socket.broadcast.emit('questions', questions[Game])
    })

    socket.on('startGame', payload => {
      const game = payload.currentgame
      if (!games[game]) {
        socket.broadcast.emit('startGame', true)
        socket.emit('startGame', true)
        games[game] = true
      }
    })

    socket.on('new-score', payload => {
      const Game = payload.gameName
      socket.join(Game)
      const name = payload.username
      if (!list[Game]) {
        list[Game] = {}
      }
      list[Game][name] = payload.total
      io.in(Game).emit('new-score', list[Game])
    })

    socket.on('disconnect', () => {
      console.log(`Connection ${socket.id} has left the building`)
    })
  })
}
