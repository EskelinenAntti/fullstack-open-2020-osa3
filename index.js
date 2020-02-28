const express = require('express')
const morgan = require('morgan')
const app = express()


app.use(express.json())

morgan.token('body', (req) => {
  return JSON.stringify(req.body)
})

const isPostMethod = (req, res) => req.method === 'POST'
const postFormat = ':method :url :status :res[content-length] - :response-time ms :body'

// log only 4xx and 5xx responses to console
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

app.post('/api/persons', (request, response) => {
  const body = request.body

  if (!body.name || !body.number) {
    return response.status(400).json({
      error: 'Both name and number must be defined.'
    })
  } else if (persons.map(person => person.name).find(name => name === body.name)) {
    return response.status(400).json({
      error: 'name must be unique'
    })
  }

  const person = {
    name: body.name,
    number: body.number,
    id: generateId(),
  }

  persons = persons.concat(person)

  response.json(person)
})

app.delete('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  persons = persons.filter(person => person.id !== id)

  response.status(204).end()
})

app.get('/info', (req, res) => {
  const info = `<p>Phonebook has info for ${persons.length}</p>
   <p>${(new Date()).toString()}
  `
  res.send(info)
})

const PORT = 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})