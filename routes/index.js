let express = require('express');
let router = express.Router();
let userfunction = require('../functions/user');
let product = require('../functions/product');
let producttype = require('../functions/product_type');
let notification = require('../functions/notification');
const formidable = require('formidable');
const path = require('path');
const url = require('url');
let fs = require('fs');
let passport = require('passport');
const uploadDir = path.join('./uploads/');
/* GET home page. */
router.get('/', function(req, res, next) {
    console.log("show log //////////");
  res.render('index', { title: 'HẠN SỬ DỤNG VIỆT NAM' });
});


/*---------------------------------------------
					Trang 404
---------------------------------------------*/

router.get('/404', (req, res) => {
	res.render('404');
});

/*---------------------------------------------
				Lấy hình ảnh
---------------------------------------------*/

router.get('/getimage', (req, res, next) => {
    const query = url.parse(req.url, true).query;
    let pic;
    pic = query.image;
    //read the image using fs and send the image content back in the response
    fs.readFile('./uploads/' + pic, function (err, content) {
        if (err) {
            res.writeHead(400, {'Content-type': 'text/html'});
            console.log(err);
            res.end("No such ");
        } else {
            //specify the content type in the response will be an image
            res.writeHead(200, {'Content-type': 'image/jpg'});
            res.end(content);
        }
    });

    //res.render('index', { title: 'Express' });
});
/*---------------------------------------------
				Sản phẩm
---------------------------------------------*/

//Kiểm tra barcode
router.post('/product/checkbarcode', (req, res) => {
	var barcode = req.body.barcode;
	console.log("barcode hahahaha"+barcode);


	product.checkBarcode(barcode)

    .then(result => res.status(result.status).json({status: result.status ,ProductType: result.producttype}))

	.catch(err => {
		res.status(err.status).json({message: err.message});
	});
});

// Thêm sản phẩm
router.post('/product/add-product', (req, res) => {

    const form = new formidable.IncomingForm();
    form.multiples = true;
    form.keepExtensions = true;
    form.uploadDir = uploadDir;
    form.parse(req, (err, fields, files) => {
        if (err){return res.status(500).json({error: err});}
        console.log(fields.barcode,fields.nameproduct,fields.hsd_ex,fields.detailproduct,files.image.path.substring(8));
        product.addProduct(fields.barcode,fields.nameproduct,fields.hsd_ex,fields.detailproduct,files.image.path.substring(8),fields.iduser)

            .then(result => res.status(result.status).json({status: result.status ,product: result.product}))

            .catch(err => {
                res.status(err.status).json({message: err.message});
            })
    });

    // var barcode = req.body.barcode;
    // var nameproduct = req.body.nameproduct;
    // var hsd_ex = req.body.hsd_ex;
    // var detailproduct = req.body.detailproduct;
    // var image = req.body.image;
    // product.addProduct(barcode,nameproduct,hsd_ex,detailproduct,image)
    //
    //     .then(result => res.status(result.status).json({status: result.status ,Product: result.producttype}))
    //
    //     .catch(err => {
    //         res.status(err.status).json({message: err.message});
    //     })
});
router.post('/product/add-product-non-image', (req, res) => {
    var barcode = req.body.barcode;
    var nameproduct = req.body.nameproduct;
    var hsd_ex = req.body.hsd_ex;
    var detailproduct = req.body.detailproduct;
    var iduser = req.body.iduser;
    product.addProductNonImage(barcode,nameproduct,hsd_ex,detailproduct,iduser)

        .then(result => res.status(result.status).json({status: result.status ,product: result.product}))

        .catch(err => {
            res.status(err.status).json({message: err.message});
        })
});

router.post('/product/getAllProductInGroup', (req, res) => {
    let iduser = req.body.iduser;

    product.getAllProductInGroup(iduser)
        .then(result => res.status(result.status).json({status: result.status ,ListProduct: result.ListProduct}))
        .catch(err => {
            res.status(err.status).json({message: err.message});
        })
});


// Lấy dữ liệu 01 sản phẩm với id

router.post('/product/get-one-product', (req, res) => {
	let id_product = req.body.id_product;
	product.getOneProduct(id_product)

		.then(result => res.status(result.status).json({status: result.status, info_product: result.product}))

		.catch(err => {
			res.status(err.status).json({message: err.message});
		});
});

// Hiển thị sản phẩm đã hết hạn

router.post('/product/expired', (req, res) => {
	let id_user = req.body.id_user;
	product.getProductExpired(id_user)
		.then(result => {
			res.status(result.status).json({status: result.status, listProductExpired: result.listProductExpired});
		})

		.catch(err => {
			res.status(err.status).json({message: err.message});
		});
});

// Hiển thị sản phẩm còn 02 ngày hết hạn

router.post('/product/dayleft', (req, res) => {
	let id_user = req.body.id_user;
	product.getProductDayLeft(id_user)
		.then(result => {
			res.status(result.status).json({status: result.status, listProductDayLeft: result.listProductDayLeft});
		})
		.catch(err => {
			res.status(err.status).json({message: err.message});
		})
});

// Hiển thị sản phẩm lớn hơn 3 ngày

router.post('/product/manyday', (req, res) => {
    let id_user = req.body.id_user;
    product.getProductManyDays(id_user)
        .then(result => {
            res.status(result.status).json({status: result.status, listProductManyDay: result.listProductManyDay});
        })
        .catch(err => {
            res.status(err.status).json({message: err.message});
        })
});

// Chỉnh sửa giới hạn thông báo cho 01 sản phẩm

router.post('/product/changedaybefore', (req, res) => {
		let id_product = req.body.id_product;
		let day = req.body.day;
		if(!id_product || !day){
			res.status(400).json({message: "Không tồn tại dữ liệu"});
		}else{
            product.changeDayBefore(id_product, day)
				.then(result => {
					res.status(result.status).json({status: result.status, message: result.message});
				})
				.catch(err => {
					res.status(err.status).json({status: err.status, message: err.message});
				});
		}

});



/*---------------------------------------------
	Xóa nhiều sản phẩm
---------------------------------------------*/

router.post('/delete-products', (req, res) => {
		let stringProduct = req.body.stringProduct;

        let id_user = req.body.id_user;
		console.log(stringProduct);

		if(!stringProduct || !id_user){
			res.status(404).json({message: "Không tồn tại dữ liệu"});
		}else{
			product.deleteProducts(stringProduct, id_user)
				.then(result => {
					res.status(200).json({status: result.status, message: result.message})
				})

				.catch(err => {
					res.status(500).json({status: err.status, message: err.message})
				})
		}
});
/*---------------------------------------------
	xóa một  sản phẩm
---------------------------------------------*/
router.post('/product/delete_one_product', (req, res) => {
    let id_product = req.body.id_product;
    let id_user = req.body.id_user;

    if(!id_product){
        res.status(400).json({message: "Không tồn tại dữ liệu"});
    }else{
        product.deleteOneProduct(id_product , id_user)
            .then(result => {
                res.status(result.status).json({status: result.status, product: result.result, message: result.message});
            })
            .catch(err => {
                res.status(err.status).json({status: err.status, message: err.message});
            });
    }

});



/*---------------------------------------------
	Nhập liệu
---------------------------------------------*/
router.post('/product/addProductType', (req, res) => {

    const form = new formidable.IncomingForm();
    form.multiples = true;
    form.keepExtensions = true;
    form.uploadDir = uploadDir;
    form.parse(req, (err, fields, files) => {
        if (err){return res.status(500).json({error: err});}

        product.addProductType(fields.nameproduct,fields.barcode,files.image.path.substring(8))
            .then(result => res.status(result.status).json({status: result.status ,ProductType: result.product}))

            .catch(err => {
                res.status(err.status).json({message: err.message});
            })
    });

});

/*---------------------------------------------
	Nhập liệu 2
---------------------------------------------*/
router.post('/product/changeProductType', (req, res) => {

    let name_product = req.body.name;
    let id_product = req.body.id;
    console.log(name_product,id_product);
    if(!name_product && !id_product){
        res.status(400).json({message: "Không tồn tại dữ liệu"});
    }else{
        product.changeprodycttype(id_product , name_product)
            .then(result => {
                res.status(result.status).json({status: result.status, ProductType: result.product});
            })
            .catch(err => {
                res.status(err.status).json({status: err.status, message: err.message});
            });
    }

});


/*---------------------------------------------
	Nhập liệu 3
---------------------------------------------*/
router.post('/product/changeProductTypeWithImage', (req, res) => {

    const form = new formidable.IncomingForm();
    form.multiples = true;
    form.keepExtensions = true;
    form.uploadDir = uploadDir;
    form.parse(req, (err, fields, files) => {
        if (err){return res.status(500).json({error: err});}

        product.changeprodycttypewithimage(fields.nameproduct,fields.id,files.image.path.substring(8))
            .then(result => res.status(result.status).json({status: result.status ,ProductType: result.product}))

            .catch(err => {
                res.status(err.status).json({message: err.message});
            })
    });

});

/*---------------------------------------------
	Đăng nhập với android
---------------------------------------------*/

router.post('/login-android', (req, res) => {
    let phone = req.body.phone;
    let password = req.body.password;
    let token = req.body.tokenfirebase
    // console.log("OK: " + username + password);
    if(!phone ){
    	res.status(404).json({status: 404, message: "Dữ liệu không tồn tại"});
    }else{
        userfunction.loginAndroid(phone, password, token)

			.then(result => {
				res.status(200).json({status: result.status,message: result.message, user: result.user});
            })

			.catch(err => {
				res.status(500).json({status: err.status, message: err.message});
			});
	}
});

/*---------------------------------------------
	Đăng ký với android
---------------------------------------------*/
router.post('/register-android', (req, res) => {
	let phone = req.body.phone;
	let password = req.body.password;
    let type = req.body.type;
    let token = req.body.token;
	if(!phone){
		res.status(404).json({status: 404 , message : "Dữ liệu không hợp lệ"});
	}else{
		userfunction.registerAndroid(phone, password, type, token)
			.then(result => {
				res.status(200).json({status: result.status, message: result.message, user: result.user})
			})

			.catch(err => {
				res.status(500).json({status: err.status, message: err.message})
			})
	}
});

/*---------------------------------------------
	            Install app
---------------------------------------------*/
router.get('/download', (req, res) => {
    res.render('download');
});


/*---------------------------------------------
	Thử nghiệm Promise
---------------------------------------------*/

router.get('/pages/promise', (req, res) => {
	// var id_user = req.body.id_user;
    userfunction.listAll()
	.then(result => {
		console.log(result);
		res.render('pages/promise', {look: result});
	})

	.catch(err => {
		res.status(err.status).json({message: err.message});
	});
});

module.exports = router;

/*---------------------------------------------
			Quản lý sản phẩm
---------------------------------------------*/

router.get('/product/quan-ly-san-pham', (req, res, next) => {

	if(req.isAuthenticated()){
		let id_user = req.user.id;
        product.getAllProductOnWeb(id_user)
            .then(result => {
                var d = new Date();
                var timeStamp = d.getTime();
                res.render('product/quan-ly-san-pham',
					{timeStamp: timeStamp,
						allProduct: result.allProduct,
						listProductManyDay : result.listProductManyDay,
						listProductDayLeft: result.listProductDayLeft,
						listProductExpired: result.listProductExpired,
                        helpers: {
                            foo: function (item) { return 'Toi ten la' + item; },
                            compare : function (lvalue, rvalue, options) {
                                if (arguments.length < 3)
                                    throw new Error("Handlerbars Helper 'compare' needs 2 parameters");

                                operator = options.hash.operator || "==";

                                var operators = {
                                    '==':		function(l,r) { return l == r; },
                                    '===':	function(l,r) { return l === r; },
                                    '!=':		function(l,r) { return l != r; },
                                    '<':		function(l,r) { return l < r; },
                                    '>':		function(l,r) { return l > r; },
                                    '<=':		function(l,r) { return l <= r; },
                                    '>=':		function(l,r) { return l >= r; },
                                    'typeof':	function(l,r) { return typeof l == r; }
                                }

                                if (!operators[operator])
                                    throw new Error("Handlerbars Helper 'compare' doesn't know the operator "+operator);

                                var result = operators[operator](lvalue,rvalue);

                                if( result ) {
                                    return options.fn(this);
                                } else {
                                    return options.inverse(this);
                                }
                            },
                            convert : function(expired){
                                var date = new Date(expired);
                                var string =  date.getDate() + "/" + (date.getMonth() + 1) + "/" +date.getFullYear();
                                return string;
                            }
                        }
					});
            })

            .catch(err => {
                res.redirect('/');
            });

    }else{
		res.redirect('../download')
	}

    });

/*---------------------------------------------
    update and add notificationoooooooooooooooooooooooooooo
---------------------------------------------*/

router.post('/notification/update_or_add_notification', (req, res) => {
    let id_product = req.body.id_product;
    let idUser = req.body.idUser;
    let type = req.body.type;
    let status_expiry = req.body.status_expired;
    let watched = req.body.watched;
    let time = req.body.time;

    console.log(id_product);
    console.log(idUser);
    console.log(type);
    console.log(watched);
    console.log(time);

    if(!id_product || !idUser){
        res.status(400).json({message: "Không tồn tại dữ liệu"});
    }else{
        notification.updateNotification(id_product, idUser, type, watched, time, status_expiry)
            .then(result => {
                res.status(result.status).json({status: result.status, message: result.message});
            })
            .catch(err => {
                res.status(err.status).json({status: err.status, message: err.message});
            });
    }

});

/*---------------------------------------------
    update sản phẩm
---------------------------------------------*/

router.post('/product/update-infomation', (req, res) => {
    let id_product = req.body.id_product;
    let nameproduct = req.body.nameproduct;
    let hsd_ex = req.body.hsd_ex;
    let description = req.body.description;
    let daybefore = req.body.daybefore;
    if(!id_product){
        res.status(400).json({message: "Không tồn tại dữ liệu"});
    }else{
        product.updateProduct(id_product, nameproduct, hsd_ex, description,daybefore)
            .then(result => {
                res.status(result.status).json({status: result.status, product: result.result, message: result.message});
            })
            .catch(err => {
                res.status(err.status).json({status: err.status, message: err.message});
            });
    }

});

router.post('/product/upload_image_product', (req, res) => {

    const form = new formidable.IncomingForm();
    form.multiples = true;
    form.keepExtensions = true;
    form.uploadDir = uploadDir;

    form.parse(req, (err, fields, files) => {
        if (err) {
            return res.status(500).json({error: err});
        }

        console.log( fields.id_product, files.image.path.substring(8));

        product.uploadImage(fields.id_product, files.image.path.substring(8))

            .then(result => res.status(result.status).json({status: result.status, product: result.result}))

            .catch(err => {
                res.status(err.status).json({message: err.message});
            })

        // uploadImage(req, res);

    });
})

function uploadImage(req, res) {
    // This is just for my Controller same as app.post(url, function(req,res,next) {....
    const form = new formidable.IncomingForm();

    form.multiples = true;
    form.keepExtensions = true;
    form.uploadDir = uploadDir;

    form.parse(req, (err, fields, files) => {

        var fileee = files.file;

        if (err) return res.status(500).json({error: err});

        product.uploadImage(fields.id_product, fileee.path.substring(8))
            .then(result =>
                res.status(result.status).json({status: result.status, product: result.result, message: result.message})
            )

    });

    form.on('fileBegin', function (name, file) {
        const [fileName, fileExt] = file.name.split('.');
        file.path = path.join(uploadDir, `${fileName}_${new Date().getTime()}.${fileExt}`)

    })
}



    /*---------------------------------------------
        Thao tác với product
    ---------------------------------------------*/
    router.post('/product/delete_product', (req, res) => {
        let id_product = req.body.id_product;
        let id_user = req.body.id_user;

        if(!id_product || !id_user){
            res.status(400).json({message: "Không tồn tại dữ liệu"});
        }else{
            product.deleteOneProduct(id_product, id_user)
                .then(result => {
                    res.status(result.status).json({status: result.status, product: result.result, message: result.message});
                })
                .catch(err => {
                    res.status(err.status).json({status: err.status, message: err.message});
                });
        }

    });

    /*---------------------------------------------
                Thêm barcode trên website
    ---------------------------------------------*/

    router.get('/product/dong-gop', function(req, res){
        if(req.isAuthenticated()){
            if(req.user.id === "5b3c6a8203b168715746d1a7"){
                let user = req.user;
                res.render('product/dong-gop', { messages: req.flash('info'), user : user});
            }else{
                res.redirect('/');
            }

        }else{
            res.redirect('/');
        }
    });

    router.post('/product/dong-gop', (req, res) => {

        const form = new formidable.IncomingForm();
        form.multiples = true;
        form.keepExtensions = true;
        form.maxFieldsSize = 10 * 1024 * 1024;
        form.uploadDir = uploadDir;
        form.parse(req, (err, fields, files) => {
            if (err){
                req.flash('info','Đã có lỗi khi upload !');
                res.redirect('/product/dong-gop');
            }else{
                if(!fields.barcode || !fields.ten_san_pham || !files.image.path){
                    req.flash('info', 'Dữ liệu không tồn tại !');
                    res.render('product/dong-gop');
                }else{
                    producttype.insertBarcode(fields.barcode,fields.ten_san_pham,files.image.path.substring(8))
                        .then(result => {
                            req.flash('info', 'Thêm Barcode thành công !');
                            res.redirect('/product/dong-gop');
                        })
                        .catch(err => {
                            req.flash('info', 'Thêm thất bại !');
                            res.redirect('/product/dong-gop');
                        });
                }
            }

        });
    });

    /*---------------------------------------------
        dang nhap facebook
    ---------------------------------------------*/
    router.get('/auth/facebook', passport.authenticate('facebook',
		{scope: ['email']}));

    router.get('/auth/facebook/callback',
        passport.authenticate('facebook', {
            successRedirect: '/',
            failureRedirect: '/'
        }));
	/*---------------------------------------------
		dang nhap google
	---------------------------------------------*/
	router.get('/auth/google', passport.authenticate('google',
        {scope : ['email']}));

    // the callback after google has authenticated the user
    router.get('/auth/google/callback',
        passport.authenticate('google', {
            successRedirect : '/',
            failureRedirect : '/'
        }));


/*---------------------------------------------
=============> Nh?p li?u 4 Take WebSite
---------------------------------------------*/
router.post('/product/viewPro/Add_link=:link?Add_pos=:poss', (req, res) => {
    const link = req.params.link;
    const poss = req.params.poss;

    product.Take_DataWebsite(link,poss)
        .then(result => res.status(result.status).json({status: result.status ,ProductType: result.product}))
        .catch(err => {
            res.status(err.status).json({message: err.message});
        })

});