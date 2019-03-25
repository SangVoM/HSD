let category_news = require('../models/category_news');
let ObjectId = require('mongodb').ObjectId;

/**************************************
*               DANH MỤC
* *************************************/
// Thêm 1 category
exports.createCategory = (name_category, alias) =>
   new Promise((resolve, reject) => {
       category_news.findOne({"alias" : alias})
           .then(cat => {
               if(cat){
                   reject({status: 400, message: "Alias danh mục đã bị trùng, xin đặt tên khác !"});
               }else{
                   let d = new Date();
                   let timeStamp = d.getTime();
                   let newCat = new category_news();
                   newCat.name = name_category;
                   newCat.alias = alias;
                   newCat.create_at = timeStamp;
                   newCat.save()
                       .then(result => {
                           resolve({status: 200, message: "Thêm thành công !"});
                       })
                       .catch(err => {
                           reject({status: 500, message: "Thêm thất bại !"});
                       });
               }
           })
           .catch(err => {
               reject({status: 500, message: "Lỗi Server !"})
           })
   });

// Hiển thị danh sách category

exports.getAllCategory = () =>
    new Promise((resolve, reject) => {
        category_news.find({})
            .then(cat => {
                if(cat.length === 0){
                    reject({status: 400, message: "Không có danh mục nào !"});
                }else{
                    resolve({status: 200, allCategory: cat});
                }
            })

            .catch(err => {
                reject({status: 500, message: "Lỗi server !"});
            });
    });

// Sửa category

exports.getEditCategory = (alias) =>
    new Promise((resolve, reject) => {
        category_news.findOne({"alias" : alias})
            .then(cat => {
                if(cat.length === 0){
                    reject({status: 404, message: "Category không tồn tại !"});
                }else{
                    console.log("DONE 2 !!!")
                    resolve({status: 200, category: cat});
                }
            })
            .catch(err => {
               reject({status: 500, message: "Lỗi server !"});
            });
    });

exports.postEditCategory = (id_category,category_name, alias) =>
    new Promise((resolve, reject) => {
        category_news.findOne({"alias" : alias})
            .then(cat => {
                if(cat){
                    reject({status: 400, message: "Category đã tồn tại !"});
                }else{
                    category_news.findByIdAndUpdate({"_id" : ObjectId(id_category)},{$set: {name: category_name, alias : alias}})
                        .then(() => {
                            resolve({status: 200, message: "Cập nhật thành công !"});
                        })
                        .catch(err => {
                            reject({status: 500, message: "Lỗi server !"});
                        })
                }
            })
            .catch(err => {
                reject({status: 500, message: "Lỗi server !"});
            })
    });

// Xóa danh mục

exports.deleteCategory = (id_category) =>
    new Promise((resolve, reject) => {
        category_news.findByIdAndRemove({"_id" : id_category})
            .then(() => {
                resolve({status: 200, message: "Xoa thanh cong !"});
            })
            .catch(err =>{
               reject({status: 500, message: "Lỗi server !"});
            });
    });