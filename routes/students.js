const express = require('express');
const flash = require('connect-flash');

const Student = require('../models/student');

const router = express.Router();
router.use(flash());


router.get('/', async (req, res, next) => {
    let student_count = await Student.countDocuments({});
    res.render('main', {
        'student_count': student_count
    })
});


router.get('/student', (req, res, next) => {
    Student.find({})
        .then((students) => {
            res.render('student_list', {
                students: student,
                flash: req.flash('message')
            });
        })
        .catch((err) => {
            res.end("Error: No students.");
            console.log(err);
        });
});


router.post('/student', (req, res, next) => {
    var student = new Student({
        name: req.body.name,
        huid: req.body.huid,
        email: req.body.email
    });
    student.save()
        .then(() => {
            req.flash('message', 'You made a new student!');
            res.redirect("/student");
        })
        .catch((err) => {
            req.flash('message', 'There was a problem creating your new student.');
            res.redirect('/student/create');
            //console.log(err);
        });
});


router.get('/student/:studentid', (req, res, next) => {
    // Individual students
    Student.findById(req.params.studentid)
        .then((student) => {
            res.render('student', {
            });
        })
});


router.post('/student/:studentid', (req, res, next) => {
    Student.findById(req.params.studentid)
        .then((student) => {
            student.name = req.body.name;
            student.huid = req.body.huid;
            student.email = req.body.email;
            student.save()
                .then(() => {
                    req.flash('message', 'You successfully updated your student.')
                    res.redirect('/student');
                });
        })
        .catch((err) => {
            console.log("Student update error");
            next();
        });
});


router.post('/student/:studentid/program', (req, res, next) => {
    Student.findById(req.params.studentid)
        .then((student) => {
            student.name = req.body.name;
            student.huid = req.body.huid;
            student.email = req.body.email;
            student.save()
                .then(() => {
                    req.flash('message', 'You successfully updated your student.')
                    res.redirect('/student');
                });
        })
        .catch((err) => {
            console.log("Student update error");
            next();
        });
});


router.post('/student/:studentid/delete', (req, res, next) => {
    Student.findByIdAndDelete(req.params.studentid)
        .then(() => {
            req.flash('message', 'You deleted your student.')
            res.redirect('/student');
        })
        .catch((err) => {
            req.flash('message', 'There was a problem deleting your student.')
            redirect('/student/' + req.params.studentid)
        })
})


router.use(function(err, req, res, next) {
    console.error(err.stack);
    next(err);
});

module.exports = router;
