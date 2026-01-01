Account -> 

System has 0 or more rubrics. Each rubric has a name.

Each Rubric has 0 or more Dimensions. 
Each Dimension has a name (string) and Category.
Each Category has a name.
Each Dimension has Job Title.
Each Dimension has an Expectation for each Job Title.

## Useful Models

app/models/category.rb
app/models/dimension.rb
app/models/expectation.rb
app/models/job_title.rb
app/models/rubric.rb

## Example

An employee (app/models/account.rb) could have a Job Title of Senior Engineer. Within the Engineering Rubric, there are several Categories (Coding, Communication...). Each one has several Dimensions (Coding could be Languages, Testing, Architecture). 

Each Dimension has an Expectation for a give Job Title (Junior Engineer might be expected to know 1 language, Senior 3 languages, etc).


