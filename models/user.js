const mongoose=require('mongoose');
const schema=mongoose.Schema;
const userschema=new schema({
    fullname:{
        type:String,
        default:''
    },
    email:{
        type:String,
        default:''
    },
    firstname:{
        type:String,
        default:''
    },
    lastname:{
        type:String,
        default:''
    },
    image:{
        type:String,
        default:''
    },
    fbTokens:Array,
    facebook:{
        type:String
    },
    google:{
        type:String
    },
    instagram:{
        type:String
    }
});
module.exports=mongoose.model('user',userschema);