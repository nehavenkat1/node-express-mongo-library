const res = require('express/lib/response')
var Book = require('../models/book')
var Author = require('../models/author')
var BookInstance = require('../models/bookinstance')
var Genre = require('../models/genre')
var {body, validationResult} = require('express-validator')

var async = require('async')
const genre = require('../models/genre')

exports.index = function(req, res) {
    async.parallel({
        book_count: function(callback) {
            Book.countDocuments({}, callback)
        },
        book_instance_count: function(callback) {
            BookInstance.countDocuments({}, callback)
        },
        book_instance_avilable_count: function(callback) {
            BookInstance.countDocuments({status: 'Available'}, callback)
        },
        author_count: function(callback) {
            Author.countDocuments({}, callback)
        },
        genre_count: function(callback) {
            Genre.countDocuments({}, callback)
        }
    }, function(err, results) {
        res.render('index', {title: 'Local Library Home', error: err, data: results})
    })
}

exports.book_list = function(req, res, next) {
    Book.find({}, 'title author')
    .sort({title: 1})
    .populate('author')
    .exec(function(err, list_books) {
        if(err) return next(err)
        res.render('book_list', {title: 'Book List', book_list: list_books})
    })
}

exports.book_detail = function(req, res) {
    async.parallel({
        book: function(callback) {
            Book.findById(req.params.id)
            .populate('author')
            .populate('genre')
            .exec(callback)
        },
        book_instance: function(callback) {
            BookInstance.find({'book': req.params.id})
            .exec(callback)
        }
    }, function(err, results) {
        if(err) return next(err)
        if(results.book == null) {
            var err = new Error('Book not found.')
            err.status = 404
            return next(err)
        }
        res.render('book_detail', {title: results.book.title, book: results.book, book_instances: results.book_instance})
    })
}

exports.book_create_get = function(req, res, next) {
    async.parallel({
        author: function(callback) {
            Author.find().exec(callback)
        },
        genre: function(callback) {
            Genre.find().exec(callback)
        }
    }, function(err, results) {
        if(err) return next(err)
        res.render('book_form', {title: 'Create Book', genres: results.genre, authors: results.author})
    })
}

exports.book_create_post = [
    (req, res, next) => {
        if(!(req.body.genre instanceof Array)) {
            if(typeof req.body.genre === 'undefined')
                req.body.genre = []
            else 
                req.body.genre = new Array(req.body.genre)
        }
        next()
    },
    body('title', 'Title must not be empty.').trim().isLength({min: 1}).escape(),
    body('author', 'Author must not be empty.').trim().isLength({min: 1}).escape(),
    body('summary', 'Summary must not be empty.').trim().isLength({min: 1}).escape(),
    body('isbn', 'isbn must not be empty.').trim().isLength({min: 1}).escape(),
    body('genre*', 'Select at least one genre.').escape(),

    (req, res, next) => {
        var book = new Book({
            title: req.body.title,
            author: req.body.author,
            summary: req.body.summary,
            isbn: req.body.isbn,
            genre: req.body.genre
        })

        var errors = validationResult(req)
        if(!errors.isEmpty()) {
            async.parallel({
                author: function(cb) {
                    Author.find().exec(cb)
                },
                genre: function(cb) {
                    Genre.find().exec(cb)
                }
            }, function(err, results) {
                if(err) return next(err)
                for(let i=0; i<results.genre.length; i++) {
                    if(book.genre.indexOf(results.genre[i]._id) > -1) {
                        results.genre[i].checked = 'true'
                    }
                }
                res.render('book_form', {title: 'Create Book', book: book, authors: results.author, genres: results.genre, errors: errors.array()})
            })
            
        } else {
            book.save(function(err) {
                if(err) return next(err)
                res.redirect(book.url)
            })
        }

    }

]

exports.book_delete_get = function(req, res) {
    res.send('book delete get')
}

exports.book_delete_post = function(req, res) {
    res.send('book delete post')
}

exports.book_update_get = function(req, res) {
    res.send('book update get')
}

exports.book_update_post = function(req, res) {
    res.send('book update post')
}