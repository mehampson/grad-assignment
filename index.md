CSCI E-31 Grad Assignment

# Data Validation With Mongoose

As a schemaless database, MongoDB is perfectly happy to accept a document in
basically any condition, as long as it's valid BSON. This has its upsides, but
at the end of the day your application will need to be a bit pickier if it's
going to meet your needs -- what's the use of accepting a mailing address record
that has no street, city, or state, for example? Or an email address of "do not
email me"?

Mongoose will help you enforce consistency and usability across your documents by
defining [field validation](https://mongoosejs.com/docs/validation.html)
on your schema. These are simply conditions that must be met for
Mongoose to write a model instance back to the database, so you can trust that
your data will be fit for the uses it's intended for.

Let's say you're tracking students and want to record their first, middle, and
last names. Middle names are usually optional, but you might want to insist that
every student has the other fields recorded. Using the ```required```
validator tells Mongoose to enforce these rules:

~~~
const studentSchema = mongoose.Schema({
    first_name: {
        type: String,
        required: true
    },
    middle_name: {
        type: String,
        required: false
    },
    last_name: {
        type: String,
        required: true
    },
}
~~~

Now, if you try to create or update an instance of studentSchema without a value in
first_name, Mongoose will raise a ```ValidatorError``` instead of sending that
instance to Mongo. (And if you want to get fancy, ```required``` can use any
expression that evaluates to a boolean, so you can even make fields conditionally
required based on other criteria.)

Mongoose provides more fine-grained validators as well:
* Number and Date fields can define ```min``` and ```max``` values.
* String fields can define length requirements with ```minLength``` and ```maxLength```.
* Strings also have a powerful ```match``` validator, which lets you use a regular
expression to define a required pattern.
* And Strings and Numbers can both use ```enum``` to define an array of acceptable values.

(Note that not all of those appear in Mongoose's Validation documentation, but
they are all described under [SchemaTypes](https://mongoosejs.com/docs/schematypes.html).)

So let's say you want to track your students' current academic program. A validator
is a good idea here: your school probably doesn't offer free-text degrees. Using
an ```enum``` validator probably makes more sense than a ```match``` unless you're
*really* into regular expressions.

~~~
const studentSchema = mongoose.Schema({
    first_name: {
        type: String,
        required: true
    },
    middle_name: {
        type: String,
        required: false
    },
    last_name: {
        type: String,
        required: true
    },
    program: {
        type: String,
        required: true,
        enum: ['Computer Science', 'Programming', 'Database Management']
    }
}
~~~

(In the real world, you would probably want to model this academic program field as
a [subdocument](https://mongoosejs.com/docs/subdocs.html) on the student,
which would give you much more granular detail and allow for more than a single
program at a time. But subdocuments need validation too.)

You don't have to define the ```enum``` array inline, either -- you can construct it
somewhere more convenient and then just reference it on the field. For example,
you probably have more than three academic programs to choose from, so you could
define that array in a separate file and import it:

~~~
// models/validation.js

const validators = {
    'program': [
        'Computer Science',
        'Programming',
        'Database Management',
        ...,
        'Etc.'
    ],
    // add more validators here for your convenience
}

module.exports = validators;
~~~

~~~
// models/student.js

const validators = require('./validation');

const studentSchema = mongoose.Schema({
    ...,
    program: {
        type: String,
        required: true,
        enum: validators['program']
    }
}
~~~

### Using Validators Elsewhere

The validators you define on your schema can be helpful in other places as well.
You can find a field's validators on the ```options``` property of its SchemaType
object, which itself can be accessed with the ```schema.path()``` function:

~~~
const studentSchema = mongoose.Schema({
    ...,
    last_name: {
        type: String,
        minLength: 3,
        required: true
    },
    program: {
        type: String,
        required: true,
        enum: ['Computer Science', 'Programming', 'Database Management']
    }
}
~~~

~~~
Student.schema.path('last_name').options.minLength;
// returns 3

Student.schema.path('program').options.enum;
// returns ['Computer Science', 'Programming', 'Database Management']
~~~

(Of course if you're defining your validators separately as described above,
it's probably more ergonomic to just reference those instead.)

Once you know where the validator can be found, you can reference it directly in
the route and pass it to the render context. Your res.render call could look
something like this:

~~~
res.render('student': {
        student: student,
        programs: Student.schema.path('program').options.enum
    });
~~~

And then in your template, you could dynamically construct a select widget with
those values:

~~~
form#update(method="POST", action="/student/" + student.id)
    .form-group
        label(for="program") Program:
        select(type="select", name="program", required)
            each p in programs
                if p == student.program
                    option(value=p, selected='true') #{p}
                else
                    option #{p}
~~~

### What Are The Alternatives?

Mongoose is not the only strategy to handle data validation, and there are a few
other approaches to consider as well. These methods are not mutually exclusive,
and the more complex your data requirements, the more likely you are to need
several layers of validation.

The first is to put your validation logic in HTML forms on the client side. Client-side
validation is important: it provides users with direct feedback on how to use your
application, and it does keep your server from having to handle those invalid requests.
But it's risky to leave all your validation on the client, as it's not terribly
hard for a bad actor to get around. It's also inefficient, because you'll have to
repeat yourself in cases when multiple forms can touch the same collection. And
of course, you can't rely on it at all if you're providing end-users with an API.

The second approach is to define your validation in MongoDB itself. MongoDB does
offer similar functionality by letting you define [validation rules](https://www.mongodb.com/docs/manual/core/schema-validation/)
for a collection if you choose. This might be a better place to put your validation
logic than Mongoose if your app is just one of several sources pushing data into the DB,
especially if you don't have control over all the others. (Though if you have control
over the DB but not all the apps that have write permissions on it, you're probably
better off offering an API built in Express instead of direct MongoDB access if you can.)

Another advantage of using MongoDB schema validation is that it will facilitate
data integrity checks: Atlas automatically tells you which documents meet or fail
validation, for example. You can do this in Mongoose too, by instantiating
models from the DB and running their validators manually, but it takes a bit more
work to set up. So if you find that your project has substantial data management
requirements that are not really in scope for a web app (e.g. decades worth of
historical student records that have already migrated from system to system),
consider looking into MongoDB's native validation as well.
