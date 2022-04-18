var BookInstance = require('../models/bookinstance')
var Book = require('../models/book')
var async = require('async')

var {body, validationResult} = require('express-validator')

exports.bookinstance_list = function(req, res, next) {
    BookInstance.find()
    .populate('book')
    .exec(function(err, list_bookinstances) {
        if(err) return next(err)
        res.render('bookinstance_list', {title: 'Book Instance List', bookinstance_list: list_bookinstances})
    })
}

exports.bookinstance_detail = function(req, res) {
    BookInstance.findById(req.params.id)
    .populate('book')
    .exec(function(err, bookinstance) {
        if(err) return next(err)
        if(bookinstance == null) {
            var err = new Error('Book instance not found')
            err.status = 404
            return next(err)
        }
        res.render('bookinstance_detail', {title: 'Copy: '+bookinstance.book.title, bookinstance: bookinstance})
    })
}

exports.bookinstance_create_get = function(req, res) {

    Book.find({}, 'title').exec(function(err, results) {
        if(err) return next(err)
        res.render('bookinstance_form', {title: 'Create Book Instance', book_list: results})
    })
}

exports.bookinstance_create_post = [
    body('book', 'Book must select.').escape(),
    body('imprint', 'Print must be specified').trim().isLength({min: 1}).escape(),
    body('status').escape(),
    body('due_back', 'Invalid date').optional({checkFalsy: true}).isISO8601().toDate(),

    (req, res, next) => {
        const errors = validationResult(req)

        var bookinstance = new BookInstance({
            book: req.body.book,
            imprint: req.body.imprint,
            status: req.body.status,
            due_back: req.body.due_back
        })

        if(!errors.isEmpty()) {
            Book.find({}, 'title').exec(function(err, books) {
                if(err) return next(err)
                res.render('bookinstance_form', {title: 'Create BookInstance', book_list: books, selected_book: bookinstance.book._id, errors: errors.array(), bookinstance: bookinstance})
            })
            return 
        } else {
            bookinstance.save(function(err) {
                if(err) return next(err)
                res.redirect(bookinstance.url)
            })
        }
    }

]

exports.bookinstance_delete_get = function(req, res) {
    res.send('book inst delete get')
}

exports.bookinstance_delete_post = function(req, res) {
    res.send('book inst delete post')
}

exports.bookinstance_update_get = function(req, res) {
    res.send('book inst update get')
}

exports.bookinstance_update_post = function(req, res) {
    res.send('book inst update post')
}