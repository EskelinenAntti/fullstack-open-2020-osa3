require('dotenv').config()

const express = require('express')
const morgan = require('morgan')
const Person = require('./models/person')

const app = express()


app.use(express.static('build'))
app.use(express.json())

morgan.token('body', (req) => {
  return JSON.stringify(req.body)
})

const isPostMethod = (req) => req.method === 'POST'
const postFormat = ':method :url :status :res[content-length] - :response-time ms :body'

app.use(morgan('tiny', {
  skip: isPostMethod
}))

app.use(morgan(postFormat, {
  skip: (req, res) => !isPostMethod(req,res)
}))

const isInvalid = person => !person.name || !person.number

app.get('/api/persons', (_req, res, next) => {
  Person.find({})
    .then(persons =>
      res.json(persons.map(person => person.toJSON()))
    )
    .catch(error =>
      next(error)
    )
})

app.get('/api/persons/:id', (req, res, next) => {
  Person.findById(req.params.id)
    .then(person => {
      if (person) {
        res.json(person.toJSON())
      } else {
        res.status(404).end()
      }
    })
    .catch(error => {
      next(error)
    })

})

app.post('/api/persons', (req, res, next) => {
  const body = req.body

  if (isInvalid(body)) {
    return res.status(400).json({
      error: 'Both name and number must be defined.'
    })
  }

  const person = new Person({
    name: body.name,
    number: body.number
  })

  person.save().then(savedPerson => {
    res.json(savedPerson.toJSON())
  }).catch(error => next(error))
})

app.put('/api/persons/:id', (req, res, next) => {
  const body = req.body

  if (isInvalid(req.body)) {
    return res.status(400).json({
      error: 'Both name and number must be defined.'
    })
  }

  const person = {
    name: body.name,
    number: body.number
  }

  Person.findByIdAndUpdate(req.params.id, person, { new: true, runValidators: true, context: 'query' })
    .then(updatedPerson => {
      if (updatedPerson) {
        res.json(updatedPerson.toJSON())
      } else {
        res.status(404).end()
      }
    })
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (req, res, next) => {
  Person.findByIdAndRemove(req.params.id)
    .then(() => {
      res.status(204).end()
    })
    .catch(error => next(error))
})

app.get('/info', (req, res, next) => {
  Person.count({})
    .then(count => {
      const info = `<p>Phonebook has info for ${count}</p>
                    <p>${(new Date()).toString()}
                    `
      res.send(info)
    })
    .catch(error => next(error))
})

const errorHandler = (error, req, res, next) => {
  console.log(error.message)

  if (error.name === 'CastError' && error.kind === 'ObjectId') {
    return res.status(400).send({ error: 'malformed id' })
  } else if (error.name ==='ValidationError') {
    return res.status(400).json({ error: error.message })
  }
  next(error)
}
app.use(errorHandler)


const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})