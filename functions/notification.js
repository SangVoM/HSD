let Notification = require('../models/notification');
let User = require('../models/user');
let ObjectId = require('mongodb').ObjectId;

exports.updateNotification = (id_product, idUser, type, watched, time, status_expiry) =>

    new Promise((resolve, reject) => {

        Notification.findOne({"id_product" : ObjectId(id_product), "idUser":ObjectId(idUser) })
            .then(notification => {
                // var d = new Date();
                // var timeStamp = d.getTime();
                if(notification != null){
                    console.log("Ok1");

                    console.log("chay ngay di");

                    notification.watched = watched;
                    notification.type = type;
                    notification.create_at = time
                    notification.status_expiry = status_expiry

                    notification.save();
                    User.findOne({"_id" : idUser},{"listnotification" : 1})
                        .then(user => {
                            if(user != null){
                                let notiArray = user.listnotification;
                                if(notiArray.indexOf(notification) == null){
                                    User.findOneAndUpdate({"_id" : ObjectId(idUser)},{$push: {"listnotification" : ObjectId(notification.id)}},{upsert: true}, function(err, docs){
                                        if(err){
                                            throw err;
                                        } else{
                                            resolve({status: 200, message: "Cập nhật thông báo thành công"});
                                        }
                                    });
                                }else{
                                    resolve({status: 200, message: "Cập nhật thông báo thành công"});
                                }
                            }else{
                                reject({status: 404, message: "User không tồn tại !"});
                            }
                        })
                        .catch({status: 500, message: "Lỗi server"})

                }else{
                    console.log("Ok2");
                    let newNotify = new Notification();
                    newNotify.watched = watched;
                    newNotify.type = type;
                    newNotify.status_expiry = status_expiry
                    newNotify.create_at = time;
                    newNotify.idUser = idUser;
                    newNotify.id_product = id_product;

                    newNotify.save();
                    User.findOneAndUpdate({"_id" : ObjectId(idUser)},{$push: {"listnotification" : ObjectId(newNotify.id)}},{safe: true, new: true, upsert: true}, function(err, docs){
                       if(err){
                           throw err;
                       } else{
                           resolve({status: 200, message: "Khởi tạo thông báo thành công"});
                       }
                    });

//add new notification
                    // add in listnotification of user
                }
            })
            .catch(err => ({status: 500, message: "Lỗi sever !!!"}));
    });