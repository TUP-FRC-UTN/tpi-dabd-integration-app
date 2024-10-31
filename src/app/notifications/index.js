
const fs = require('fs');



let data = JSON.parse(fs.readFileSync('./db.json', 'utf-8'));



data = data['email-templates'].map((x, index) => {
    return {

        id: index,
        name: "Template " + (index + 1),
        base64Body: "Body " + (index + 1)

    }
});






fs.writeFileSync('./dbModified.json', JSON.stringify({ ["email-templates"]: data }));