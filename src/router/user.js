const express = require('express')
const auth = require('../middleware/auth')
const User = require('../models/user')
const {sendWelcomeEmail, sendCancellationEmail} = require('../email/account')


const router = new express.Router()
const multer = require('multer')
const sharp =require('sharp')



router.post('/users',async (req, res)=>{
    const user =  new User(req.body)
        try{
            await user.save()
            const token = await user.generateToken()
            sendWelcomeEmail(user.email, user.name)
            res.status(201).send({user,token})
        }
        catch(e){
           res.status(400).send(e)    

        }
})


router.post('/users/login', async(req,res)=>{
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateToken()
        res.send({user,token} )
        
    } catch (error) {
        res.status(400).send()
    }
}) 


router.get('/users/me', auth, async(req, res)=>{
        res.send(req.user)
})


router.post('/users/logout',auth, async(req,res)=>{

    try {
        req.user.tokens = req.user.tokens.filter((token)=>{
            return token.token !==req.token
        })

        await req.user.save()
        res.send("User logged out")


    } catch (error) {
        console.log(error);
        
        res.status(500).send("Can't log out ")

    }


})

router.post('/users/logoutAll',auth, async(req,res)=>{

    try {
        req.user.tokens = []

        await req.user.save()
        res.send("All Users have been logged out")


    } catch (error) {
        console.log(error);
        
        res.status(500).send("Can't log out ")

    }


})

router.patch('/users/me',auth, async(req,res)=>{
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name','age','email','password']
    const isValidOp = updates.every((update)=> allowedUpdates.includes(update))

    if(!isValidOp){
        return res.status(400).send({error:'Invalid Updates!'})
    }

    try{
        updates.forEach(update => req.user[update] = req.body[update])
        await req.user.save()
        
        res.send(req.user) 
    }
    catch(error){
        res.status(400).send(error)

    }
})


router.delete('/users/me',auth, async (req,res)=>{
    try {
        await req.user.remove()
        res.send(req.user)
        sendCancellationEmail(req.user.email, req.user.name)

    } catch (error) {
        res.status(500).send()
    }
})


avatar = multer({
    limits:{
        fileSize:1000000
    },
    fileFilter(req, file, cb){
        if(!file.originalname.match(/\.(png|jpeg|jpg)$/)){
            return cb(new Error('Error: Please upload an image'))
        }
        cb(undefined, true)
    }
})

router.post('/users/me/avatar',auth, avatar.single('avatar'), async(req, res)=>{

    const buffer = await sharp(req.file.buffer).resize({width: 250 , height:250}).png().toBuffer()
    req.user.avatar = buffer
    // req.user.avatar = req.file.buffer
    await req.user.save()
    res.sendStatus(200)


}, (error, req, res, next)=>{
    res.status(400).send({error: error.message})
})

router.delete('/users/me/avatar', auth, async(req, res)=>{
    req.user.avatar= undefined

    await req.user.save()
    res.sendStatus(200)
})

router.get('/users/:id/avatar', async(req, res)=>{
    try{
        const user = await User.findById(req.params.id)
        if(!user || !user.avatar){
             throw new Error()
        }
        res.set('Content-type', 'image/png')
        res.send(user.avatar)

    }
    catch(e){
        res.sendStatus(400)
    }
})



module.exports = router