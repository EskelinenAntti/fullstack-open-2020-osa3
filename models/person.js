require('dotenv').config

const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')

mongoose.set('useFindAndModify', false)
mongoose.set('useCreateIndex', true);

const url = process.env.MONGODB_URI

mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true})
  .catch(error => {
    console.log('error connecting to mongoDB:', error.message)
  })

const personSchema = new mongoose.Schema({
  name: {type: String, unique: true, minlength: 3, required: true},
  number: {type: String, minlength: 8, required: true}
})
personSchema.plugin(uniqueValidator)

personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = mongoose.model('Person', personSchema)
