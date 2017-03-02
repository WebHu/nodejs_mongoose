#mongoose

##一、快速通道

###1.1 名词解释

    Schema  ：  一种以文件形式存储的数据库模型骨架，不具备数据库的操作能力

    Model   ：  由Schema发布生成的模型，具有抽象属性和行为的数据库操作对

    Entity  ：  由Model创建的实体，他的操作也会影响数据库


注意：

1.  本学习文档采用严格命名方式来区别不同对象，例如：

    var PersonSchema;   //Person的文本属性
    var PersonModel;    //Person的数据库模型
    var PersonEntity;   //Person实体

2.  Schema、Model、Entity的关系请牢记，Schema生成Model，Model创造Entity，Model和Entity都可对数据库操作造成影响，但Model比Entity更具操作性。

###1.Schema——纯洁的数据库原型

####1.1 什么是Schema

    我理解Schema仅仅只是一断代码，他书写完成后程序依然无法使用，更无法通往数据库端
    他仅仅只是数据库模型在程序片段中的一种表现，或者是数据属性模型

####1.2 如何定义Schema
```
    var BlogSchema = new Schema({
      title:String,
      author:String
      //new Schema()中传入一个JSON对象，该对象形如 xxx:yyyy ,
      /xxx是一个字符串，定义了属性，yyy是一个Schema.Type，定义了属性类型
    });
```
###2. Schema的扩展
####虚拟属性
```
    //虚拟属性，该属性不会写入数据库
    UserSchema.virtual('full').get(function(){
        return "name:"+this.name+",age:"+this.age+",createDate:"+this.createDate;
    });
```

####添加schema的方法
```
//实例方法（model实例化为entity之后才能调用）
UserSchema.methods.introduce = function() {
    return "my Name is" +this.name;
};
```
//添加静态方法，model能直接调用
```
UserSchema.statics.delete_by_name = function(name, cb_succ, cb_fail) {};
//将该Schema发布为Model  ,user的数据库模型,model具有数据库的操作行为
var UserModel = mongoose.model('UserModel', UserSchema);
```
###Middleware中间件

一旦定义了中间件，就会在全部中间件执行完后执行其他操作，使用中间件可以雾化模型，避免异步操作的层层迭代嵌套
####8.4 使用范畴
*    复杂的验证
*  删除有主外关联的doc
*  异步默认
*  某个特定动作触发异步任务，例如触发自定义事件和通知

```
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
});
```
```
/*
 Parallel并行

并行提供更细粒度的操作

var schema = new Schema(...);
schema.pre('save',function(next,done){
    //下一个要执行的中间件并行执行
    next();
    doAsync(done);
});*/
```
```
//model实例化为entity
//var u=new  UserModel({name:"zhangsan",age:4,info:"kk"});
```
//console.log(u.introduce());调用实例化方法
//console.log(UserModel.delete_by_name);调用静态方法

```
###Model

#### 什么是Model

Model模型，是经过Schema构造来的，除了Schema定义的数据库骨架以外，还具有数据库行为模型，他相当于管理数据库属性、行为的类

#### 如何创建Model

你必须通过Schema来创建，如下：
```
    //先创建Schema
    var TankSchema = new Schema({
      name:'String',
      size:'String'
    });
    //通过Schema创建Model
    var TankModel = mongoose.model('Tank',TankSchema);
```
#### 操作Model

该模型就能直接拿来操作，具体查看API，例如：
```
    var tank = {'something',size:'small'};
    TankModel.create(tank);
```
注意：

你可以使用Model来创建Entity，Entity实体是一个特有Model具体对象，但是他并不具备Model的方法，只能用自己的方法。

//通过Model创建Entity
  var tankEntity = new TankModel('someother','size:big');
  tankEntity.save();

###6.Query

查询是数据库中运用最多也是最麻烦的地方，这里对Query解读的并不完善，仅仅是自己的一点领悟而已。

####6.1 查询的方式

通常有2种查询方式，一种是直接查询，一种是链式查询（2种查询都是自己命名的）

#####6.1.1 直接查询

在查询时带有回调函数的，称之为直接查询，查询的条件往往通过API来设定，例如：

    PersonModel.findOne({'name.last':'dragon'},'some select',function(err,person){
      //如果err==null，则person就能取到数据
    });

具体的查询参数，请查询API

#####6.1.2 链式查询

在查询时候，不带回调，而查询条件通过API函数来制定，例如：

    var query = PersonModel.findOne({'name.last':'dragon'});
    query.select('some select');
    query.exec(function(err,pserson){
    //如果err==null，则person就能取到数据
  });

这种方式相对直接查询，分的比较明细，如果不带callback，则返回query，query没有执行的预编译查询语句，该query对象执行的方法都将返回自己，只有在执行exec方法时才执行查询，而且必须有回调。

因为query的操作始终返回自身，我们可以采用更形象的链式写法

    Person
      .find({ occupation: /host/ })
      .where('name.last').equals('Ghost')
      .where('age').gt(17).lt(66)
      .where('likes').in(['vaporizing', 'talking'])
      .limit(10)
      .sort('-occupation')
      .select('name occupation')
      .exec(callback);


###7.Validation

数据的存储是需要验证的，不是什么数据都能往数据库里丢或者显示到客户端的，数据的验证需要记住以下规则：

    验证始终定义在SchemaType中
    验证是一个内部中间件
    验证是在一个Document被保存时默认启用的，除非你关闭验证
    验证是异步递归的，如果你的SubDoc验证失败，Document也将无法保存
    验证并不关心错误类型，而通过ValidationError这个对象可以访问

####7.1 验证器

    required 非空验证
    min/max 范围验证（边值验证）
    enum/match 枚举验证/匹配验证
    validate 自定义验证规则

以下是综合案例：

    var PersonSchema = new Schema({
      name:{
        type:'String',
        required:true //姓名非空
      },
      age:{
        type:'Nunmer',
        min:18,       //年龄最小18
        max:120     //年龄最大120
      },
      city:{
        type:'String',
        enum:['北京','上海']  //只能是北京、上海人
      },
      other:{
        type:'String',
        validate:[validator,err]  //validator是一个验证函数，err是验证失败的错误信息
      }
    });

####7.2 验证失败

如果验证失败，则会返回err信息，err是一个对象该对象属性如下

    err.errors                //错误集合（对象）
    err.errors.color          //错误属性(Schema的color属性)
    err.errors.color.message  //错误属性信息
    err.errors.path             //错误属性路径
    err.errors.type             //错误类型
    err.name                //错误名称
    err.message                 //错误消息

一旦验证失败，Model和Entity都将具有和err一样的errors属性

