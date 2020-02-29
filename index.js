const express = require('express')
const morgan = require('morgan')
const app = express()

app.use(express.json())
app.use(express.static('build'))

morgan.token('body', (req) => {
  return JSON.stringify(req.body)
})

const isPostMethod = (req, res) => req.method === 'POST'
const postFormat = ':method :url :status :res[content-length] - :response-time ms :body'

app.use(morgan('tiny', {
  skip: isPostMethod
}))

app.use(morgan(postFormat, {
  skip: (req, res) => !isPostMethod(req,res)
}))


let persons = [
        {
          "name": "Arto Hellas",
          "number": "040-123456",
          "id": 1
        },
        {
          "name": "Ada Lovelace",
          "number": "39-44-5323523",
          "id": 2
        },
        {
          "name": "Dan Abramov",
          "number": "12-43-234345",
          "id": 3
        },
        {
          "name": "Mary Poppendieck",
          "number": "39-23-6423122",
          "id": 4
        }
      ]

const isInvalidPerson = person => !person.name || !person.number

const generateId = () => {
  // Getting same id twice is as likely as guessing all 7 numbers correctly
  // in lottery.
  return Math.floor(Math.random() * 18643560)
}

app.get('/api/persons', (req, res) => {
  res.json(persons)
})

app.get('/api/persons/:id', (req, res) => {
  const id = Number(req.params.id)
  const person = persons.find(person => person.id === id)
  if (person) {
    res.json(person)
  } else {
    res.status(404).end()
  }
})

app.post('/api/persons', (req, res) => {
  const person = req.body

  if (isInvalidPerson(person)) {
    return res.status(400).json({
      error: 'Both name and number must be defined.'
    })
  } else if (persons.map(person => person.name).find(name => name === person.name)) {
    return res.status(400).json({
      error: 'name must be unique'
    })
  }

  const createdPerson = {
    name: person.name,
    number: person.number,
    id: generateId(),
  }

  persons = persons.concat(createdPerson)

  res.json(createdPerson)
})

app.put('/api/persons/:id', (req, res) => {
  const id = Number(req.params.id)
  const payloadPerson = req.body

  if (isInvalidPerson(req.body)) {
    return res.status(400).json({
      error: 'Both name and number must be defined.'
    })
  } else if (!persons.find(person => person.id === id)) {
    return res.status(404).json({
      error: 'person was not found'
    })
  }

  const updatedPerson = {...payloadPerson}

  persons = persons.map(person => person.id === id ? updatedPerson : person)
  res.json(updatedPerson)
})

app.delete('/api/persons/:id', (req, res) => {
  const id = Number(req.params.id)
  persons = persons.filter(person => person.id !== id)

  res.status(204).end()
})

app.get('/info', (req, res) => {
  const info = `<p>Phonebook has info for ${persons.length}</p>
   <p>${(new Date()).toString()}
  `
  res.send(info)
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})