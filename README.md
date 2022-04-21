CSCI E-31 Grad Assignment

# Getting More Out Of Mongoose


## Validators

As a schemaless database, MongoDB is perfectly happy to accept a document in
basically any condition, as long as it's valid BSON. This has its upsides, but
at the end of the day your data does need to meet certain business requirements --
what's the use of a mailing address record that has no street, city, or state, for
example?

Mongoose will help you enforce consistency and usability across your documents by
defining field validation. These are simply conditions that must be met for
Mongoose to write a model instance back to the database, so you can trust that
your data will be fit for the uses its intended for.

Let's say you're tracking students and want to record their first, middle, and
last names. Middle names are usually optional, but you might want to insist that
every student has the other fields recorded. Using the ```required```
validator tells Mongoose to enforce these rules:

~~~
const studentSchema = mongoose.Schema({
    first_name: {type: String, required: true},
    middle_name: {type: String, required: false},
    last_name: {type: String, required: true},
}
~~~

Now, if you try to create or update an instance of studentSchema without a value in
first_name, Mongoose will raise a ```ValidatorError``` instead. (And if you want to
get fancy, ```required``` can use any expression that evaluates to a boolean.)

Mongoose provides more fine-grained validators as well:
* Number fields can define ```min``` and ```max``` values.
* String fields can define ```minLength``` and ```maxLength```.
* String can also have a powerful ```match``` validator, which lets you define a
regular expression that the field must match.
* And strings can also use ```enum``` to define an array of values, which the field
must be one of.

So let's say you want to track your students' current academic program. A validator
make sense here: your school probably doesn't offer free-text degrees. Using
an ```enum``` validator probably makes more sense than a ```match``` unless you're
*really* good with regular expressions.

~~~
const studentSchema = mongoose.Schema({
    first_name: {type: String, required: true},
    middle_name: {type: String, required: false},
    last_name: {type: String, required: true},
    program: {
        type:String,
        required: true,
        enum: ['Computer Science', 'Programming', 'Database Management']
    }
}
~~~

(You don't have to define the ```enum``` array inline, either -- you can construct it
somewhere more convenient and then just reference it on the field, if that makes
sense.)

 


## Virtuals
Fairly often, you'll need to present or manipulate your data in some way
that can't be accomplished by just pulling what you've captured in the raw documents.
Mongoose lets you add *virtual* properties to a schema. These are essentially logical
fields calculated on the fly, and don't exist in the MongoDB database itself.

You might find yourself needing to construct full names from these component parts
for different purposes. With virtuals, you can define this business logic on the
schema itself:

~~~
studentSchema.virtual('display_name').get(function() {
    return `${this.first_name} ${this.middle_name? this.middle_name + ' ' : ''}$this.last_name}`;
});

studentSchema.virtual('formal_name').get(function() {
    return `${this.salutation} ${this.last_name}`;
})

student.display_name; \\ e.g. "Bob Jones", "Alice E. Smith"
student.formal_name; \\ e.g. "Mr. Jones", "Dr. Smith"
~~~

So instead of repeating the logic you need all over your project, you can just
define it once and then treat it like a normal field in any route, controller,
or view that requires it.


Object Relationships
Any data-driven web app that's reasonably large in scope will almost certainly
have to consider how different types of records will relate to each other.
MongoDB is not a relational database, where fine-grained relationships are a key
part of its structure, but there are still benefits to doing so.

For example, take a hypothetical app that's tracking students at Harvard
DCE. Let's say your Student schema in Mongoose looks like this:

const studentSchema = mongoose.Schema({
    name: {type: String, required: true},
    huid: {type: String, required: true},
    email: {type: String, required: true},
});

Students at DCE can be affiliated with multiple programs over time A one-to-many relationships
like this would be pretty complicated to include directly on a Student document.
Essentially, MongoDB lets you nest all of that information within the Student as
an embedded document. In Mongoose, you would add a new field that has its own
schema, like so:

const studentSchema = mongoose.Schema({
    name: {type: String, required: true},
    huid: {type: String, required: true},
    email: {type: String, required: true},
    academics: [mongoose.Schema({
            level: {type: String, enum: ["Certificate", "Undergraduate", "Graduate"], required: true},
            program: {type: String, required: true},
            status: {type: String, enum: ["Applied", "In Progress", "Awarded", "Withdrawn"], required: true}
        })]

});


How do you track course enrollments? This is a classic many-to-many
relationship: every student can be enrolled in multiple different courses, and
every course will have different students enrolled. The Harvard DCE spring catalog
has close to 500 classes, so clearly you can't have fields for each one on the
top-level Student record. MongoDB gives us two ways to approach this.


Lean
EnumValues
