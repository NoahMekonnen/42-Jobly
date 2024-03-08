const {sqlForPartialUpdate} = require("./sql")

describe("sqlForPartialUpdate", function(){
    test("converts js to sql", function(){
        const test1 = sqlForPartialUpdate({firstName: 'Aliya', age: 32},{firstName:"first_name",age:"age"})
        expect(test1).toEqual({
            setCols: '"first_name"=$1, "age"=$2',
            values:['Aliya', 32]
        })
    })
})