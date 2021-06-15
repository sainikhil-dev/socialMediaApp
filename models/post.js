const mongoose=require('mongoose');
const schema=mongoose.Schema;
const postSchema=new mongoose.Schema({
    title:{
        type:String
    },
    body:{
        type:String
    },
    user:{
        type:schema.Types.ObjectId,
        ref:'user'
    },
    status:{
        type:String,
        default:'public'
    },
    date:{
        type:Date,
        default:Date.now
    },
    allowComments:{
        type:Boolean,
        default:true
    },
    comments:[{
        commentBody:{
            type:String
        },
        commentUser:{
            type:schema.Types.ObjectId,
            ref:'user'
        },
        commentDate:{
            type:Date,
            default:Date.now
        }
    }]
});
module.exports=mongoose.model('post',postSchema)