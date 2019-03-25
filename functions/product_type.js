/*
Name File: 	Tất cả chức năng liên quan đến loại sản phẩm sẽ viết vào đây. 
			Mỗi cá nhân code đều phải comment code của mình viết chức năng gì.
			Coder thật cân nhắc nếu tạo file mới.
Author: Đội ngũ Finger
*/

let product_type = require('../models/product_type');
let ObjectId = require('mongodb').ObjectId;

exports.insertBarcode = (barcode, ten_san_pham, image) =>
    new Promise((resolve, reject) => {
        var d = new Date();
        var timeStamp = d.getTime();

        product_type.findOne({'barcode' : barcode})
            .then(pro => {
                if(pro){
                    let data = pro;
                    reject({status: 301, message: "Barcode đã tồn tại !", data: data});
                }else{
                    let ProductType = new product_type();
                    ProductType.barcode = barcode;
                    ProductType.name = ten_san_pham;
                    ProductType.image = image;
                    ProductType.check_barcode = true;
                    ProductType.check_product = true;
                    ProductType.create_at = parseFloat(timeStamp);
                    ProductType.save(function(err, docs){
                        if(err){
                            throw err;
                        }else{
                            return resolve({status: 200, message: "Thêm barcode thành công - Cám ơn bạn đã đóng góp ! !", data: docs});
                        }
                    });
                }
            })
            .catch(err =>{
                reject({status: 500, message: "Lỗi Server !"});
            })
    });
