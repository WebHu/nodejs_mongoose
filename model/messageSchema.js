/**
 * fileName:messageSchema.js
 * author:gamehu
 * date:2017/3/3 14:03
 * desc:消息的schema
 * {
 *  messageId: <message UUID>,    //server generated
	clientReference: <unique client generated id from the sender tenant>
	type: <数据交换类>,
	application: < 应用>,
	priority: <优先级 1-9>,
	ttl: <time to live>,
	from: <tenantId>,
	to: <tenantId>,
	payload:  {
		<数据交互内容, json 格式>
	}
}

 */
var mongoose = require("mongoose");

var Schema = mongoose.Schema;

MessageSchema = new Schema({
    messageId: {
        type: String,
        require: false
    },
    clientReference: {//发送方的唯一标识
        type: String,
        require: true
    },
    fromTenantId: {//发送租户标识
        type: String,
        require: true
    },
    toTenantId: {//接收租户标识
        type: String,
        require: true
    }, fromPlatformId: {//平台标识
        type: String,
        require: true
    }, toPlatformId: {//平台标识
        type: String,
        require: true
    }, priority: {
        type: Number,
        default: 1//优先级别1-9，默认1
    }, ttl: {
        type: Number,
        default: 10000//默认存活时间10000毫秒？
    }, payload: {
        type: String,//交互内容
        require: true
    }
});

/**
 * Validations
 */


/*MessageSchema.path('clientReference').validate(function (clientReference) {
    if (this.clientReference.trim().length === 0) {
        return false
    } else {
        return true;
    }
}, 'clientReference cannot be blank');

MessageSchema.path('clientReference').validate(function (clientReference) {

    console.log("path('clientReference')")
    //验证是否重复提交
    const Message = mongoose.model('messageQueue');
    Message.find({clientReference: clientReference}).exec(function (err, messages) {
        if (!err && messages.length === 0) {
            return true;
        } else {
            return false;
        }
    });
}, 'Waitting feedback...');*/
/*
MessageSchema.statics.feedback=function (feedback) {
    
}*/
mongoose.model('messageQueue', MessageSchema);

