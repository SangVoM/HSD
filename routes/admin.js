let express = require('express');
let router = express.Router();
let csrf = require('csurf');
let csrfProtection = csrf();
router.use(csrfProtection);
let category_news = require('../functions/category_news');
let news = require('../functions/news');

router.get('/', function (req, res) {
    res.render('admin/index', {layout: 'admin_layout.hbs'});
});

// Danh sách danh mục

router.get('/category/list', (req, res) => {
    category_news.getAllCategory()
        .then(result => {
            res.render('admin/category/list', {allCategory: result.allCategory, layout: 'admin_layout.hbs'});
        })
        .catch(err => {
            res.redirect('/admin/category/list');
        });
});

/**************************
*          DANH MỤC
***************************/

router.get('/category/create', (req, res) => {
    res.render('admin/category/create',{csrfToken: req.csrfToken(), messages: req.flash('message'), message_err: req.flash('err'), layout: 'admin_layout.hbs'});
});


// thêm danh mục
router.post('/category/create', (req, res) => {
   let name_category = req.body.name_category;
   let alias = req.body.alias;

   if(!name_category || !alias){
       req.flash('message','Bạn đã điền thiếu thông tin !');
       req.flash('formData',{name_category: name_category, alias: alias});
       res.render('admin/category/create');
   }else{
       category_news.createCategory(name_category, alias)
           .then(result => {
              req.flash('message',result.message);
              res.redirect('/admin/category/create');
           })
           .catch(err => {
               req.flash('err',err.message);
               res.redirect('/admin/category/create');
           });
   }
});

// Sửa danh mục
router.get('/category/edit/:alias', (req,res) => {
    let alias = req.param('alias');
    console.log(alias);
    category_news.getEditCategory(alias)
        .then(result => {
            res.render('admin/category/edit', {err_edit_category: req.flash('err_edit_category'), success_edit_category: req.flash('success_edit_category'),category: result.category, csrfToken: req.csrfToken(), layout: 'admin_layout.hbs'});
        })
        .catch(err => {
           res.redirect('/admin/category/list');
        });
});

router.post('/category/edit', (req, res) => {
    let id_category = req.body.id_category;
    let category_name = req.body.category_name;
    let alias = req.body.alias;

    category_news.postEditCategory(id_category,category_name, alias)
       .then(result => {
           req.flash('success_edit_category', result.message);
           res.redirect('/admin/category/edit/' + alias);
       })
       .catch(err => {
           req.flash('err_edit_category', err.message);
           res.redirect('/admin/category/edit/' + alias);
       });
});

router.get('/category/delete/:id_category', (req, res) =>{
    let id_category = req.param('id_category');
    console.log(id_category);
    category_news.deleteCategory(id_category)
        .then(result => {
            req.flash('success_del_cat', result.message);
            res.redirect('/admin/category/list');
        })
        .catch(err => {
            req.flash('err_del_cat', err.message);
            res.redirect('/admin/category/list');
        })
});


/**************************
 *          Bài viết
 ***************************/

// thêm bài viết

router.get('/news/create', (req, res) => {
   res.render('admin/news/create', {layout: 'admin_layout.hbs'});
});

module.exports = router;