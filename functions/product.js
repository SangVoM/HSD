/*
Name File: 	Tất cả chức năng liên quan đến sản phẩm sẽ viết vào đây. 
			Mỗi cá nhân code đều phải comment code của mình viết chức năng gì.
			Coder thật cân nhắc nếu tạo file mới.
Author: Đội ngũ Finger
*/
var async = require('async');
var Product = require('../models/product');
var ProductType = require('../models/product_type');
var Group = require('../models/group');
var Notification = require('../models/notification');
var User = require('../models/user');

// libary Viet
const download = require('image-downloader');
const utf8 = require('utf8');
const request = require('request'),
    cheerio = require('cheerio');
var barcode_l = "", namePro_l = "", image_l = "";

// libary Viet

let ObjectId = require('mongodb').ObjectId;
const fs = require('fs'),
    url = require('url');
const formidable = require('formidable');
const path = require('path');
const uploadDir = path.join('./uploads/');


//==== CHECK BARCODE ==== TRẢ DỮ LIỆU NẾU CÓ ===========//
exports.checkBarcode = (barcode) =>
    new Promise((resolve, reject) => {
        ProductType.findOne({"barcode": barcode})

            .then(producttype => {
                console.log(producttype);
                if (producttype == null) {
                    resolve({status: 405, producttype: {}});
                } else {
                    console.log("Co 1 product type !!!");
                    resolve({status: 200, producttype: producttype});
                }
            })

            .catch(err => ({status: 500, message: "Lỗi sever !!!"}));
    });
exports.getAllProductInGroup = (iduser) =>
    new Promise((resolve, reject) => {
        Group.find({"owner": ObjectId(iduser),})
            .populate({path: "listproduct"})
            .then(groups => {
                if (groups.length === 0) {
                    reject({status: 500, mesage: "Dont Find Group User"});
                } else {
                    var listProduct = new Array();
                    console.log(groups[0].listproduct.length + "/0000/");
                    console.log(groups[0].listproduct + "/0000/");
                    async.eachSeries(groups[0].listproduct, function updateObject(obj, done) {
                        if (!obj.delete) {
                            obj.populate("producttype_id", "barcode", function (err) {
                                if (err) throw err;
                                listProduct.push(obj);
                                done();
                            });
                        } else {
                            done();
                        }

                    }, function allDone(err) {
                        if (err) throw err;
                        Group.find({listinvited: ObjectId(iduser)}, {listproduct: 1, _id: 0})
                            .populate({path: "listproduct"})
                            .then(group_nonowner => {
                                if (group_nonowner.length === 0) {
                                    resolve({status: 200, ListProduct: listProduct});
                                } else {
                                    async.eachSeries(group_nonowner, function updateObject(obj2, donePa) {
                                        async.eachSeries(obj2.listproduct, function updateObject(obj3, doneChi) {
                                            if (!obj3.delete) {
                                                obj3.populate("producttype_id", "barcode", function (err) {
                                                    if (err) throw err;
                                                    listProduct.push(obj3);
                                                    doneChi();
                                                });
                                            } else {
                                                doneChi();
                                            }
                                        }, function allDone(err) {
                                            if (err) throw err;
                                            donePa();
                                        });
                                    }, function allDone(err) {
                                        resolve({status: 200, ListProduct: listProduct});
                                    });
                                }
                            })
                            .catch(err => ({status: 500, message: "Lỗi sever !!!"}));
                    });
                }
            })
            .catch(err => ({status: 500, message: "Lỗi sever !!!"}));
    });
exports.addProductNonImage = (barcode, nameproduct, hsd_ex, detailproduct, iduser) =>
    new Promise((resolve, reject) => {
        var d = new Date();
        var timeStamp = d.getTime();
        ProductType.find({"barcode": barcode})
            .then(producttype => {
                if (producttype.length === 0) {
                    reject({status: 505, mesage: "ERROR"});
                } else {
                    producttype[0].name = nameproduct;
                    producttype[0].save();

                    var newProduct = new Product();
                    newProduct.producttype_id = producttype[0].id;
                    newProduct.createtime = parseFloat(timeStamp);
                    newProduct.expiretime = hsd_ex;
                    //  newProduct.barcode = barcode;
                    newProduct.description = detailproduct;
                    newProduct.namechanged = nameproduct;
                    newProduct.imagechanged = producttype[0].image;
                    newProduct.created_at = parseFloat(timeStamp);
                    //  newProduct.delete = "false"
                    newProduct.save(function (err, docs) {
                        if (err) {
                            console.log(err);
                            reject({status: 505, mesage: "ERROR"});
                        } else {
                            Group.find({"owner": iduser})
                                .then(groupList => {
                                    if (groupList.length === 0) {
                                        reject({status: 500, mesage: "Dont' Find User"});
                                    } else {
                                        var legth = groupList[0].listproduct.length;
                                        groupList[0].listproduct.push(ObjectId(docs._id));
                                        groupList[0].save()
                                        newProduct.populate("producttype_id", "barcode", function (err) {
                                            if (err) throw err;
                                            resolve({status: 200, product: newProduct});
                                        });
                                    }
                                })
                                .catch(err => ({status: 500, message: "Lỗi sever !!!"}));

                        }
                    })


                }
            })
            .catch(err => ({status: 500, message: "Lỗi sever !!!"}));
    });
exports.addProduct = (barcode, nameproduct, hsd_ex, detailproduct, image, iduser) =>
    new Promise((resolve, reject) => {
        var d = new Date();
        var timeStamp = d.getTime();
        ProductType.find({"barcode": barcode})
            .then(producttype => {
                if (producttype.length === 0) {
                    //============= TH 1: SP CHƯA ĐC ĐĂNG LÊN LẦN NÀO =================//

                    // const form = new formidable.IncomingForm();
                    // form.multiples = true;
                    // form.keepExtensions = true;
                    // form.uploadDir = uploadDir;
                    // form.parse(req, (err, fields, files) => {
                    //     if (err) return res.status(500).json({error: err});

                    //============= UP DỮ LIỆU LÊN SV VOI LINK ẢNH UP Ở TRÊN =================//
                    var newProType = new ProductType();
                    newProType.barcode = barcode;
                    newProType.name = nameproduct;
                    newProType.image = image; //====LINK ANH==//
                    // newProType.description = "";    //====THẰNG NÀY K CÓ Ở PRODUCTTYPE
                    newProType.check_barcode = false;
                    newProType.create_at = parseFloat(timeStamp);
                    newProType.save(function (err, docs) {
                        if (err) {
                            console.log(err);
                            reject({status: 505, mesage: "ERROR"});
                        } else {
                            console.log("save success 1")
                            //============= UP PRODUCTTYPE THÀNH CÔNG UP TIẾP PRODUCT =================//
                            var newProduct = new Product();
                            newProduct.producttype_id = newProType.id;
                            newProduct.createtime = parseFloat(timeStamp);
                            newProduct.expiretime = hsd_ex;
                            //    newProduct.barcode = barcode;
                            newProduct.description = detailproduct;
                            newProduct.namechanged = nameproduct;
                            newProduct.imagechanged = image;
                            newProduct.created_at = parseFloat(timeStamp);
                            //  newProduct.delete = "" //=====THẰNG NÀY K HIỂU ĐỂ LÀM GÌ
                            newProduct.save(function (err, docs) {
                                if (err) {
                                    console.log(err);
                                    reject({status: 505, mesage: "ERROR"});
                                } else {
                                    //============= HOANG THANH UP PRODUCTTYPE & PRODUCT =================//
                                    console.log("save success 2")
                                    Group.find({"owner": iduser})
                                        .then(groupList => {
                                            if (groupList.length === 0) {
                                                console.log(err);
                                                reject({status: 500, mesage: "Dont' Find User"});
                                            } else {
                                                var legth = groupList[0].listproduct.length;
                                                groupList[0].listproduct.push(ObjectId(docs._id));
                                                groupList[0].save()
                                                newProduct.populate("producttype_id", "barcode", function (err) {
                                                    console.log(newProduct)
                                                    resolve({status: 200, product: newProduct});
                                                });
                                            }
                                        })
                                        .catch(err => ({status: 500, message: "Lỗi sever !!!"}));
                                }
                            })

                        }
                    })

                    //  });
                } else {
                    //============= TH 2: SP ĐÃ CÓ TRÊN PRODUCTTYPE CHỈ CẦN UP LÊN PRODUCT =================//
                    producttype[0].name = nameproduct;
                    producttype[0].image = image;
                    producttype[0].save();
                    var newProduct = new Product();

                    newProduct.producttype_id = ObjectId(producttype[0]._id);
                    newProduct.createtime = parseFloat(timeStamp);
                    newProduct.expiretime = hsd_ex;
                    //   newProduct.barcode = barcode;
                    newProduct.description = detailproduct;
                    newProduct.namechanged = nameproduct;
                    newProduct.imagechanged = image;
                    newProduct.created_at = parseFloat(timeStamp);
                    //  newProduct.delete = "" //=====THẰNG NÀY K HIỂU ĐỂ LÀM GÌ
                    newProduct.save(function (err, docs) {
                        if (err) {
                            console.log(err);
                            reject({status: 505, mesage: "ERROR"});
                        } else {
                            //============= HOANG THANH UP PRODUCTTYPE & PRODUCT =================//
                            Group.find({"owner": iduser})
                                .then(groupList => {
                                    if (groupList.length === 0) {
                                        console.log(err);
                                        reject({status: 500, mesage: "Dont' Find User"});
                                    } else {
                                        var legth = groupList[0].listproduct.length;
                                        console.log(producttype[0]._id);
                                        groupList[0].listproduct.push(ObjectId(docs._id));
                                        groupList[0].save();
                                        newProduct.populate("producttype_id", "barcode", function (err) {
                                            console.log(newProduct)
                                            resolve({status: 200, product: newProduct});
                                        });


                                    }
                                })
                                .catch(err => ({status: 500, message: "Lỗi sever !!!"}));
                        }
                    })


                }
            })
            .catch(err => ({status: 500, message: "Lỗi sever !!!"}));
    });



exports.addProductType = (nameproduct, barcode, image) =>
    new Promise((resolve, reject) => {
        var d = new Date();
        var timeStamp = d.getTime();
        ProductType.find({"barcode": barcode})
            .then(producttype => {
                if (producttype.length === 0) {
                    var newProType = new ProductType();
                    newProType.barcode = barcode;
                    newProType.name = nameproduct;
                    newProType.image = image;
                    newProType.check_barcode = true;
                    newProType.check_product = true;
                    newProType.create_at = parseFloat(timeStamp);
                    newProType.save(function (err, docs) {
                        if (err) {
                            console.log(err);
                            reject({status: 500, mesage: "ERROR save"});
                        } else {
                            resolve({status: 200, product: newProType});
                        }

                    })
                }else{
                    reject({status: 205, mesage: "ton tai cmnr"});
                }
            })
            .catch(err => ({status: 500, message: "Lỗi sever !!!"}));
    });



exports.changeprodycttype = (id,nameproduct) =>
    new Promise((resolve, reject) => {
        ProductType.findByIdAndUpdate(ObjectId(id), {$set: {"name": nameproduct}}, { new: true },function (err, data) {
            if (err){
                reject({status: 500, mesage: err.mesage});
            }else{
                resolve({status: 200, product: data});
            }


        })

});


exports.changeprodycttypewithimage = (nameproduct,id,image) =>
    new Promise((resolve, reject) => {
        ProductType.findByIdAndUpdate(ObjectId(id), {$set: {"name": nameproduct,"image": image}}, { new: true },function (err, data) {
            if (err){
                reject({status: 500, mesage: err.mesage});
            }else{
                resolve({status: 200, product: data});
            }


        })
    });


// Lấy dữ liệu 01 sản phẩm với id (chi tiết sản phẩm)

exports.getOneProduct = (id_product) =>
    new Promise((resolve, reject) => {
        var d = new Date();
        var timeStamp = d.getTime();
        Product.findOne({"_id": ObjectId(id_product)})
            .populate({path: "producttype_id", select: "name image check_barcode"})

            .then(product => {
                console.log(product.producttype_id.name);
                console.log(product.producttype_id.image);
                console.log("DONE !");
                if (product.length === 0) {
                    reject({status: 404, message: "San pham khong ton tai"});
                } else {
                    return product;
                }
            })

            .then(result => {
                resolve({status: 200, product: result});
            })

            .catch(err => reject({status: 500, message: "Loi Sever"}));
    });

// Hiển thị những sản phẩm đã hết hạn tại tab chính, với phân trang là 10 sản phẩm

exports.getAllProductOnWeb = (id_user) =>
    new Promise((resolve, reject) => {
        var d = new Date();
        var timeStamp = d.getTime();
        Group.findOne({owner: ObjectId(id_user)})
            .then(result => {
                if (result.length === 0) {
                    reject({status: 404, message: "Không tìm thấy user"});
                } else {
                    let listProduct = result.listproduct;
                    let allProduct = [];
                    let listProductExpired = [];
                    let listProductDayLeft = [];
                    let listProductManyDay = [];

                    async.eachSeries(listProduct, function updateObject(obj, done) {
                        Product.findOne({"_id": ObjectId(obj)})
                            .then(item => {
                                let checkDay = (item.expiretime - timeStamp) / 86400000;
                                // item.put('ngayconlai',checkDay);
                                item.daysleft = parseInt(checkDay);
                                console.log(item.daysleft);
                                if (checkDay < 0) {
                                    listProductExpired.push(item);
                                } else if (checkDay < 3 && checkDay > 0) {
                                    listProductDayLeft.push(item);
                                } else if (checkDay => 3) {
                                    listProductManyDay.push(item);
                                }
                                // item.save();
                                allProduct.push(item);
                                done();

                            })
                            .catch(err => ({
                                status: 500, message: "Lỗi Server"
                            }));
                    }, function allDone(err) {
                        resolve({
                            status: 200,
                            allProduct: allProduct,
                            listProductExpired: listProductExpired,
                            listProductDayLeft: listProductDayLeft,
                            listProductManyDay: listProductManyDay
                        })
                    });
                }

            })

            .catch(err => ({status: 500, message: "Lỗi Server"}));
    });

// Hiển thị sản phẩm còn 2 ngày tại tab chính, phân trang với 10 sản phẩm

exports.getProductDayLeft = (id_user) =>
    new Promise((resolve, reject) => {
        var d = new Date();
        var timeStamp = d.getTime();
        Group.findOne({owner: ObjectId(id_user)})
            .then(result => {
                if (result.length === 0) {
                    reject({status: 404, message: "Không tìm thấy user"});
                } else {
                    var listProduct = result.listproduct;
                    var listProductDayLeft = new Array();
                    console.log(timeStamp);

                    async.eachSeries(listProduct, function updateObject(obj, done) {
                        Product.findOne({"_id": ObjectId(obj)})
                            .then(item => {
                                var checkDay = (item.expiretime - timeStamp) / 86400000;
                                console.log(checkDay);
                                if (checkDay < 2 && checkDay > 0) {
                                    listProductDayLeft.push(item);
                                    done();
                                } else {
                                    done();
                                }
                            })
                            .catch(err => ({
                                status: 500, message: "Lỗi Server"
                            }));
                    }, function allDone(err) {
                        resolve({status: 200, listProductDayLeft: listProductDayLeft})
                    });
                }
            })

            .catch(err => ({status: 500, message: "Lỗi server"}));
    });

// Hiển thị sản phẩm lớn hơn 02 ngày (manydays)

exports.getProductManyDays = (id_user) =>
    new Promise((resolve, reject) => {
        var d = new Date();
        var timeStamp = d.getTime();
        Group.findOne({owner: ObjectId(id_user)})
            .then(result => {
                if (result.length === 0) {
                    reject({status: 404, message: "Không tìm thấy user"});
                } else {
                    var listProduct = result.listproduct;
                    var listProductManyDay = new Array();
                    console.log(timeStamp);

                    async.eachSeries(listProduct, function updateObject(obj, done) {
                        Product.findOne({"_id": ObjectId(obj)})
                            .then(item => {
                                var checkDay = (item.expiretime - timeStamp) / 86400000;
                                console.log(checkDay);
                                if (checkDay > 3) {
                                    listProductManyDay.push(item);
                                    done();
                                } else {
                                    done();
                                }
                            })
                            .catch(err => ({
                                status: 500, message: "Lỗi Server"
                            }));
                    }, function allDone(err) {
                        resolve({status: 200, listProductManyDay: listProductManyDay})
                    });
                }
            })

            .catch(err => ({status: 500, message: "Lỗi server"}));
    });


// Chỉnh sửa giới hạn thông báo cho 01 sản phẩm

exports.changeDayBefore = (id_product, day) =>
    new Promise((resolve, reject) => {
        Product.findByIdAndUpdate(ObjectId(id_product), {$set: {"daybefore": day}}, {
            safe: true,
            upsert: true,
            new: true
        })
            .then(product => {
                console.log("DONE");
                if (product.length === 0) {
                    console.log("DONE 1");
                    reject({status: 404, message: "Không tìm thấy sản phẩm"});
                } else {
                    console.log("DONE 2");
                    resolve({status: 200, message: "Cập nhật thành công"});
                }
            })

            .catch(err => ({status: 500, message: "Lỗi server"}));
    });

// Xóa nhiều sản phẩm

exports.deleteProducts = (stringProduct,id_user) =>
    new Promise((resolve, reject) => {
        let arrayProducts = stringProduct.split(",");
        console.log(arrayProducts);
        async.eachSeries(arrayProducts, function updateObject(id_product, done) {
            Notification.findOne({"id_product": ObjectId(id_product), "idUser": ObjectId(id_user)})
                .then(notification => {
                    console.log(notification);
                    if (notification != null) {
                        console.log(notification.id);
                        User.update({"_id": ObjectId(id_user)}, {$pullAll: {"listnotification": [ObjectId(notification.id)]}})
                            .then(() => {
                                notification.remove()
                                    .then(() => {
                                        Product.findByIdAndUpdate(ObjectId(id_product), {$set: {"delete": true}}, {
                                            safe: true,
                                            upsert: true,
                                            new: true
                                        })
                                            .then(done())
                                            .catch(err=> done());
                                    })
                            })

                    }else {
                        Product.findByIdAndUpdate(ObjectId(id_product), {$set: {"delete": true}}, {
                            safe: true,
                            upsert: true,
                            new: true
                        })
                            .then(done())

                            .catch(err=> done());
                    }
                })

                .catch(err=> done());
        }, function allDone(err) {
            console.log("Cập nhật thành công");
            resolve({status: 200, message: "Cập nhật thành công"})
        });
    });

// Xóa sản phẩm

exports.deleteOneProduct = (id_product, id_user) =>
    new Promise((resolve, reject) => {
        Notification.findOne({"id_product": ObjectId(id_product), "idUser": ObjectId(id_user)})
            .then(notification => {
                console.log(notification);
                if (notification) {
                    console.log(notification.id);
                    User.update({"_id": ObjectId(id_user)}, {$pullAll: {"listnotification": [ObjectId(notification.id)]}})
                        .then(() => {
                            notification.remove()
                                .then(() => {
                                    Product.findByIdAndUpdate(ObjectId(id_product), {$set: {"delete": true}}, {
                                        safe: true,
                                        upsert: true,
                                        new: true
                                    })
                                        .then(resolve({status: 200, message: "Đã xóa thông báo và sản phẩm"}))
                                        .catch(reject({"status": 505}));
                                })
                        })

                        .catch({status: 505, message: "Ko the xoa thong bao trong user"});

                } else {
                    Product.findByIdAndUpdate(ObjectId(id_product), {$set: {"delete": true}}, {
                        safe: true,
                        upsert: true,
                        new: true
                    })
                        .then(resolve({status: 200, message: "Đã xóa sản phẩm"}))

                        .catch(reject({status: 505, message: "Khong the xoa"}))
                }
            })

            .catch({status: 500, message: "Internal Server Error !"});

    });


// Testing
exports.listAll = () =>
    new Promise((resolve, reject) => {
        user.find()
            .then(users => {
                if (users.length === 0) {
                    reject({status: 404, messages: "Không có users nào !"});
                } else {
                    return users;
                }
            })

            .then(users => {
                resolve(users);
            })

            .catch({status: 500, message: "Lỗi sever"});

    });

// update product

exports.updateProduct = (id_product, nameproduct, hsd_ex, description,daybefore) =>

    new Promise((resolve, reject) => {
        let d = new Date();
        let timeStamp = d.getTime();
        Product.findOne({"_id": ObjectId(id_product)}, {"imagechanged": 0})
            .then(product => {
                if (product) {


                    //============= UPDATE VÀO BẢNG PRODUCT =================//

                    let idProductType = product.producttype_id;
                    console.log("chay ngay di" + product._id)
                    if (nameproduct) {
                        console.log("chay ngay di" + product._id)
                        product.namechanged = nameproduct

                    }

                    if (hsd_ex) {
                        product.expiretime = hsd_ex
                    }
                    if (daybefore) {
                        product.daybefore = daybefore
                    }
                    if (description) {
                        product.description = description
                    }
                    product.save()
                        .then(() => {
                            ProductType.findOne({"_id": ObjectId(idProductType)})
                                .then(productType => {
                                    console.log("idproductType " + idProductType)
                                    if (productType != null) {
                                        let itemProductType = productType
                                        if (!itemProductType.check_product) {
                                            itemProductType.name = nameproduct
                                            itemProductType.save()
                                                .then(() => {
                                                    var a = {
                                                        "_id": id_product,
                                                        "expiretime": product.expiretime,
                                                        "description": product.description,
                                                        "namechanged": product.namechanged,
                                                        "daybefore": product.daybefore

                                                    }
                                                    resolve({
                                                        status: 200,
                                                        result: a,
                                                        message: "Cập nhật thành công"
                                                    })

                                                })
                                        } else {
                                            var a = {
                                                "_id": id_product,
                                                "expiretime": product.expiretime,
                                                "description": product.description,
                                                "namechanged": product.namechanged,
                                                "daybefore": product.daybefore
                                            }
                                            resolve({
                                                status: 200, result: a

                                                , message: "Cập nhật thành công"
                                            })
                                        }
                                    } else {
                                        reject({status: 400})
                                    }
                                })
                        })
                } else {
                    reject({status: 400})
                }
            })
            .catch(err => ({status: 500, message: "Lỗi sever !!!"}));
    });
exports.uploadImage = (id_product, image) =>
    new Promise((resolve, reject) => {
        Product.findOne({"_id": ObjectId(id_product)})

            .then(product => {

                if (product != null) {

                    product.imagechanged = image
                    product.save()
                        .then(() => {

                            ProductType.findOne({"_id": ObjectId(product.producttype_id)})
                                .then(productType => {
                                    if (productType) {
                                        if (!productType.check_product) {
                                            productType.image = image
                                            productType.save()
                                                .then(() => {
                                                    let a = {
                                                        "_id": id_product,
                                                        "expiretime": product.expiretime,
                                                        "description": product.description,
                                                        "namechanged": product.namechanged,
                                                        "imagechanged": product.imagechanged
                                                    }
                                                    resolve({
                                                        status: 200,
                                                        result: a,
                                                        message: "Cập nhật thành công"
                                                    })
                                                })

                                        } else {
                                            var a = {
                                                "_id": id_product,
                                                "expiretime": product.expiretime,
                                                "description": product.description,
                                                "namechanged": product.namechanged,
                                                "imagechanged": product.imagechanged
                                            }
                                            resolve({
                                                status: 200,
                                                result: a,
                                                message: "Cập nhật thành công"
                                            })
                                        }


                                    } else {
                                        reject({status: 400})

                                    }
                                })
                        })

                } else {
                    reject({status: 404, message: "User Not Found !"});

                }
            })

            .catch(err => reject({status: 500, message: "Internal Server Error !"}));

    });


//*******************==================> Test Take Data Website**********************************************
exports.Take_DataWebsite = (link,poss) =>
    new Promise((resolve, reject) => {
        console.log("*******************************************");
        console.log("POS ===> "+link +" - "+poss);
        if (poss === "1"){
            console.log("Website ==> http://www.12gmart.com.vn");
            TakeData_12gmart(link,resolve, reject);
        }else if(poss === "2") {
            console.log("Website ==> https://tiki.vn/");
            TakeData_tiki(link,resolve,reject)
        }else if (poss ==="3"){
            console.log("–ang lam !")
        }else {
            console.log("poss sai !")
        }
    });


//***********************================>hhttp://www.12gmart.com.vn*****************************************
function TakeData_12gmart(link, resolve, reject) {

    console.log("**************nhuviet*****************=>" + link);
    request("http://www.12gmart.com.vn/index.php?route=product/product&path=" + link, function (err, response, body) {
        if (err) {
            console.log(err);
            // res.render("trangchu", {html:"co loi xay ra" })
            console.log("trangchu", {html: "co loi xay ra"})
        } else {
            $ = cheerio.load(body);
            // console.log("nhuviet TIKI====> "+body)

            //===> barCode
            var i = $(body).find("div.container").find("div.description");
            barcode_l = i.text().trim().substring(13, 27).trim();

            //===> title
            var h2 = $(body).find("div.container").find("h2");
            h2.each(function (i, e) {
                namePro_l = $(this).text().trim()
            });

            //===> img
            var img = $(body).find("div.image").find("a.colorbox");
            img.each(function (i, e) {
                // b = e["attribs"]["src"]
                image_l = (e["attribs"]["href"])
            })
        }
        console.log("barCode : " + barcode_l);
        console.log("title : " + namePro_l);
        console.log("img : " + image_l.split(" ").join("%20").trim());

        //================> CreateTakeData
        const d = new Date();
        const timeStamp = d.getTime();
        ProductType.find({"barcode": barcode_l})
            .then(producttype => {
                if (producttype.length === 0) {
                    var newProType = new ProductType();
                    newProType.barcode = barcode_l;
                    newProType.name = namePro_l;
                    newProType.image = barcode_l+".png";
                    newProType.check_barcode = true;
                    newProType.check_product = true;
                    newProType.create_at = parseFloat(timeStamp);
                    newProType.save(function (err, docs) {
                        if (err) {
                            console.log(err);
                            reject({status: 500, mesage: "ERROR save"});
                        } else {
                            resolve({status: 200, product: newProType});
                            //================>download IMG
                            const uri = utf8.encode(image_l.split(" ").join("%20").trim());
                            Take_DownloadIMG(barcode_l, uri)
                        }
                    })
                } else {
                    console.log("S?n ph?m d„ t?n t?i");
                    reject({status: 205, mesage: "ton tai cmnr"});
                }
            })
            .catch(err => ({status: 500, message: "L?i sever !!!"}));

    })
}

//***********************================> https://tiki.vn***************************************************
function TakeData_tiki(link,resolve,reject){
    request("https://tiki.vn/"+link,function(err,response,body){
        if(err){
            console.log(err)
            // res.render("trangchu", {html:"co loi xay ra" })
            console.log("trangchu", {html:"co loi xay ra" })
        }else {
            $ = cheerio.load(body)
            // console.log("nhuviet TIKI====> "+body)

            //===> barCode
            var i = $(body).find("div#product-sku").find("p")
            barcode_l = i.text().trim()

            //===> title
            var h1 = $(body).find("h1.item-name")
            h1.each(function(i,e){
                namePro_l = $(this).text().trim()
            })

            //===> img
            var img = $(body).find("img#product-magiczoom")
            img.each(function(i,e){
                // b = e["attribs"]["src"]
                image_l = (e["attribs"]["src"])
            })
        }
        console.log("barCode : " + barcode_l)
        console.log("title : " + namePro_l)
        console.log("img : " + image_l)
        //================> CreateTakeData
        const d = new Date();
        const timeStamp = d.getTime();
        ProductType.find({"barcode": barcode_l})
            .then(producttype => {
                if (producttype.length === 0) {
                    var newProType = new ProductType();
                    newProType.barcode = barcode_l;
                    newProType.name = namePro_l;
                    newProType.image = barcode_l+".png";
                    newProType.check_barcode = true;
                    newProType.check_product = true;
                    newProType.create_at = parseFloat(timeStamp);
                    newProType.save(function (err, docs) {
                        if (err) {
                            console.log(err);
                            reject({status: 500, mesage: "ERROR save"});
                        } else {
                            resolve({status: 200, product: newProType});
                            //================>download IMG
                            Take_DownloadIMG(barcode_l,image_l)
                        }
                    })
                } else {
                    console.log("S?n ph?m d„ t?n t?i");
                    reject({status: 205, mesage: "ton tai cmnr"});
                }
            })
            .catch(err => ({status: 500, message: "L?i sever !!!"}));


    })
}

//***********************================> Take_DownloadIMG***************************************************
function Take_DownloadIMG(img_barcode_name, url) {
    // console.log("nhuvietIT ==========> " + url)
    const path = "./uploads/" + img_barcode_name + ".png"
    const options = {
        url: url,
        dest: path
    };
    download.image(options)
        .then(({filename, image}) => {
            console.log('File saved to', filename)
        })
        .catch((err) => {
            console.error("Loi ==============> " + err)
        })
}