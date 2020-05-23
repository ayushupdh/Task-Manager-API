const express = require('express')
require('./db/mongoose')
const User = require('./models/user')
const Task = require('./models/task')
const userRouter = require('./router/user')
const tasksRouter = require('./router/tasks')

const app =express()

const port = process.env.PORT

// const multer= require('multer')

// const upload = multer({
//     dest: 'images'
// })


// app.post('/upload',upload.single('upload'), (req,res)=>{
//     res.send(200)
// })





app.use(express.json())
app.use(userRouter)
app.use(tasksRouter)


app.listen(port, ()=>{
    console.log('Server is listening on port: '+ port)
    
})

