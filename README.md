CSCI E-31 Grad Assignment

Getting More Out Of Mongoose

Virtuals
Fairly often, you'll need to present or manipulate your data in some way
that can't be accomplished by just pulling what you've captured in the raw documents.
Mongoose lets you add virtual properties to a schema: these are essentially logical
fields calculated on the fly, and don't exist in the MongoDB database itself.
For example, let's say you track a student's first, middle, and last names, with
this schema:

~~~
const studentSchema = mongoose.Schema({
    first_name: {type: String, required: true},
    middle_name: {type: String, required: false},
    last_name: {type: String, required: true},
    salutation: {type: String, required: true}
}
~~~

You might find yourself often needing to construct full names from these
component parts for different purposes. With virtuals, you can define the business
logic on the schema itself and then reference it in any route, controller, or
view that requires it:

~~~
``
studentSchema.virtual('display_name').get(function() {
    return `${this.first_name} ${this.middle_name? this.middle_name + ' ' : ''}$this.last_name}`;
});

studentSchema.virtual('formal_name').get(function() {
    return `${this.salutation} ${this.last_name}`;
})
``
~~~



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
