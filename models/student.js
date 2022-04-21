const mongoose = require('mongoose');

const studentSchema = mongoose.Schema({
    name: {type: String, required: true},
    huid: {type: String, required: true},
    email: {type: String, required: true},

    academics: [mongoose.Schema({
            level: {type: String, enum: ["Certificate", "Undergraduate", "Graduate"], required: true},
            program: {type: String, required: true},
            status: {type: String, enum: ["Applied", "In Progress", "Awarded", "Withdrawn"], required: true}
        })]
}, {
    timestamps: true
});


const Student = mongoose.model('Student', studentSchema, 'student');

module.exports = Student;
