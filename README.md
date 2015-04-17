###Parse Forms

Configuratble forms manager app for back office files and forms management. Used parse.com for data persistence.

[demo]  - (username - `demo`, password - `demo`)


#### Configurations
**`forms.json`**

- `name` - Name and title of the form
- `collection` - Table name and url of the form (no space, all lower case)
- `form_fields`
  - `column` - Name of the field column for database (no space, all lower case)
  - `label` - Label of the field
  - `type` - Type of the field
    - _Currently supported types_
    - `textbox`, `radio`, `select`
    - `images`
    - `date`
  - `options` - only need to provide if `type` is `radio` or `select` 
  - `show_in_index` - Show this field in listing page's column?
  - `required` (bool) - Required?

#### Example
_The following json will create the necessary crud operations and form pages._
```json
{
	"name":"Resumes",
	"collection":"resumes",
	"form_fields":[
		{
			"column":"name",
			"label":"Name",
			"type":"textbox",
			"show_in_index":true,
			"required":true,
		},
		{
			"column":"photos",
			"label":"Photo",
			"type":"images",
		},
		{
			"column":"gender",
			"label":"Gender",
			"type":"radio",
			"options":["Male","Female"],
			"show_in_index":true,
			"required":true,
		},
		{
			"column":"dob",
			"label":"Date of Birth",
			"type":"date",
			"required":true,
		}
	]			
}
```





[demo]:http://yemaw.github.io/parse-forms

