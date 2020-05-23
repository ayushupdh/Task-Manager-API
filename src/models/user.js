const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt  = require('bcrypt')
const jwt = require('jsonwebtoken')
const Task = require('../models/task')

const userSchema = new mongoose.Schema(
    {
    name: {
        type: String,
        required:true,
        trim:true
    },
    email:{
        type:String,
        required:true,
        unique:true,
        trim:true,
        lowercase:true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error('Email is invalid')
        }
        }
    },
    age: {
        type: Number,
        default:0,
        validate(value){
            if(value<0){
                    throw new Error('Age must be a positive number')
            }
        }
    },
    password:{
        type:String,
        required:true,
        trim:true,
        minlength:6,
        validate(value){
            if(value.includes('password')){
                throw new Error('Cant use password as password')
            }
        }


    },
    tokens:[{
        token:{
            type:String,
            required:true
        }
    }],
    avatar:{
        type: Buffer
    }
},{
    timestamps:true
})

userSchema.virtual('tasks',{
    ref:'Task',
    localField:'_id',
    foreignField:'author'
})

//preprocessing before this method  
userSchema.pre('save',async function (next){
    const user = this

    if(user.isModified('password')){
        user.password = await bcrypt.hash(user.password,8)
    }

    next()
})

userSchema.pre('remove', async function(next){
    const user = this
    await Task.deleteMany({author: user._id})
    next()
})

//This is for objects. Objects use this method
userSchema.methods.generateToken = async function(){
    const user = this
    const token = await jwt.sign({_id: user._id.toString()},process.env.JWT_SECRET)
    user.tokens = user.tokens.concat({token}) 
    await user.save()
    return token
}

userSchema.methods.toJSON = function(){
    const user =this
    const userObject = user.toObject()
    delete userObject.password
    delete userObject.tokens
    delete userObject.avatar

    return userObject

}





//not object depended. Use on the class
userSchema.statics.findByCredentials = async (email, password)=>{
    const user =  await User.findOne({email})

    if(!user){
        throw new Error('Unable to login')
}
    const isMatch = await bcrypt.compare(password, user.password)
    if(!isMatch){
        throw new Error('Unable to login')
    }
    return user
}

const User = mongoose.model('User',userSchema)




module.exports =User