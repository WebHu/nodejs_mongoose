var mongoose = require("mongoose");
var Schema = mongoose.Schema;

//创建schema，一种以文件形式存储的数据库模型骨架，不具备数据库的操作能力
UserSchema = new Schema({
    name: String,
    age: {
        type: Number,
        required: true,//非空验证
        min: 0,
        max: 100
    },
    info: String,
    isAdmin: {
        type: Boolean,
        default: false
    },
    createDate:{
        type:Date,
        default:Date.now()
    }
});


//虚拟属性，该属性不会写入数据库
UserSchema.virtual('full').get(function(){
    return "name:"+this.name+",age:"+this.age+",createDate:"+this.createDate;
});
//添加schema的方法
//实例方法（model实例化为entity之后才能调用）
UserSchema.methods.introduce = function() {
    return "my Name is" +this.name;
};
//添加静态方法，model能直接调用
UserSchema.statics.delete_by_name = function(name, cb_succ, cb_fail) {};

/**
 * 串行使用pre方法，执行下一个方法使用next调用,如果不用next则只执行第一个中间件
 * Pre-save 中间件 save之前执行,
 */

UserSchema.pre('save', function (next) {
    /*if (!this.isNew) return next();

    if (!validatePresenceOf(this.password) && !this.skipValidation()) {
        next(new Error('Invalid password'));
    } else {
        next();
    }*/
    console.log("pre save...");
    next();
});
//将该Schema发布为Model  ,user的数据库模型,model具有数据库的操作行为，model是操作collection，users为collection的名称，相当于table

//为schema添加的扩展需要放在发布之前
var UserModel = mongoose.model('users', UserSchema);
module.exports=UserModel;
//console.log(u.introduce());调用实例化方法
//console.log(UserModel.delete_by_name);调用静态方法






