const express = require('express')
const Task = require('../models/task')
const auth = require('../middleware/auth')

const router = new express.Router()




router.post('/tasks', auth, async (req,res)=>{
    const task = new Task({
        ...req.body,
        author: req.user._id
    })
    try{
        await task.save()
        res.status(201).send(task)
    }
    catch(e){
        res.status(400).send(e)

    }
})


router.get('/tasks',auth, async (req,res)=>{
    const match ={}
    const sort={}

    if(req.query.completed){
        match.completed=req.query.completed ==='true'
    }
    if(req.query.sortBy){
        const parts = req.query.sortBy.split(':')
        sort[parts[0]]= parts[1] === 'desc' ? -1 : 1
        console.log(sort);

    }


    //PAGINATION PARTTT
    try {
        await req.user.populate(
            {
            path:'tasks',
            match,
            options:{
                limit:parseInt(req.query.limit),
                skip:parseInt(req.query.skip),
                sort
            }  
        }
        ).execPopulate()

        const tasks = req.user.tasks;
        res.send(tasks) 
    } catch (error) {
        res.status(500).send(error)
    }
})

router.get('/tasks/:id',auth, async(req,res)=>{
    const _id = req.params.id
    try {
       const tasks = await Task.findOne({_id, author:req.user._id})
       if(!tasks){
                return res.status(404).send()
            }
            res.send(tasks)
    } catch (error) {
        res.status(500).send(error)
    }
})



router.patch('/tasks/:id',auth, async(req,res)=>{

    const updates = Object.keys(req.body)
    const allowedUpdates = ['description','completed']
    const isValidOp = updates.every((update)=> allowedUpdates.includes(update))

    if(!isValidOp){
        return res.status(400).send("Illegal Operation!")
    }
    try {
        const  task = await Task.findOne({_id:req.params.id, author:req.user._id})
        // const task = await Task.findByIdAndUpdate(req.params.id, req.body, {new:true, runValidators:true})
        if(!task){
            return res.status(404).send()
        }
        updates.forEach((update)=> task[update]=req.body[update])

        await task.save()
        return res.send(task)
        
    } catch (error) {
        res.status(400).send(error)
    }



})


router.delete('/tasks/:id',auth,async (req,res)=>{
    try {
            const task = await Task.findOneAndDelete({_id:req.params.id, author:req.user._id})
            if(!task){
                res.status(400).send()
            }
            res.send(task)
    } catch (error) {
        console.log(error);
        
            res.status(500).send()
    }
})

module.exports = router;