var mongoose = require('mongoose')
var Schema = mongoose.Schema
var { DateTime } = require('luxon')

var AuthorSchema = new Schema({
    first_name: {type: String, required: true, maxLength: 100},
    family_name: {type: String, required: true, maxLength: 100},
    date_of_birth: {type: Date},
    date_of_death: {type: Date},
})

AuthorSchema
.virtual('name')
.get(function() {
    var fullName = ''
    if(this.first_name && this.family_name) 
        fullName = this.family_name+', '+ this.first_name
    if(!this.first_name || !this.family_name) 
        fullName = ''
    return fullName
})

AuthorSchema
.virtual('lifespan')
.get(function() {
    var lifetime_string = ''
    if(this.date_of_birth)
        lifetime_string = this.date_of_birth.getYear().toString()
    if(this.date_of_death)
        lifetime_string += ' - ' + this.date_of_death.getYear()
    return lifetime_string
})

AuthorSchema
.virtual('url')
.get(function() {
    return '/catalog/author/'+this._id
})

AuthorSchema
.virtual('formated_birth_date')
.get(function() {
    let d = ''
    if(this.date_of_birth ){
        d =  DateTime.fromJSDate(this.date_of_birth).toLocaleString(DateTime.DATE_MED) 
        if(this.date_of_death) {
            d += ' - ' + DateTime.fromJSDate(this.date_of_death).toLocaleString(DateTime.DATE_MED) 
        }
        return d
    }
    else return ''
})

module.exports = mongoose.model('Author', AuthorSchema)