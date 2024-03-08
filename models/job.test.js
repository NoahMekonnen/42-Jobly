"use strict";

const db = require("../db.js");
const { BadRequestError, NotFoundError } = require("../expressError");
const Job = require("./job.js");
const {
    commonBeforeAll,
    commonBeforeEach,
    commonAfterEach,
    commonAfterAll,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** create */

describe("create", function () {
    const newJob = {
        title: "software engineer",
        salary: 55000,
        equity: 10000,
        companyHandle: "c1"
    }

    test("works", async function () {
        console.log(Job)
        let job = await Job.create(newJob);
        expect(job).toEqual(newJob);

        const result = await db.query(
            `SELECT title, salary, equity, companyHandle
           FROM jobs
           WHERE id = 1`);
        expect(result.rows).toEqual([
            {
                title: "software engineer",
                salary: 55000,
                equity: 10000,
                companyHandle: "c1"
            }
        ]);
    });

});

/************************************** findAll */

describe("findAll", function () {
    const newJob2 = {
        title: "janitor",
        salary: 40000,
        equity: 0,
        companyHandle: "c1"
    }

    const newJob3 = {
        title: "teacher",
        salary: 70000,
        equity: 0,
        companyHandle: "c1"
    }
    test("works: no filter", async function () {
        await Job.create(newJob2)
        await Job.create(newJob3)
        let jobs = await Job.findAll();
        expect(jobs).toEqual([
            {
                title: "software engineer",
                salary: 55000,
                equity: 10000,
                companyHandle: "c1"
            },
            {
                title: "janitor",
                salary: 40000,
                equity: 0,
                companyHandle: "c1"
            },
            {
                title: "teacher",
                salary: 70000,
                equity: 0,
                companyHandle: "c1"
            }
        ]);
    });
});

// /************************************** get */

// describe("get", function () {
//   test("works", async function () {
//     let company = await Company.get("c1");
//     expect(company).toEqual({
//       handle: "c1",
//       name: "C1",
//       description: "Desc1",
//       numEmployees: 1,
//       logoUrl: "http://c1.img",
//     });
//   });

//   test("not found if no such company", async function () {
//     try {
//       await Company.get("nope");
//       fail();
//     } catch (err) {
//       expect(err instanceof NotFoundError).toBeTruthy();
//     }
//   });
// });

// /************************************** update */

// describe("update", function () {
//   const updateData = {
//     name: "New",
//     description: "New Description",
//     numEmployees: 10,
//     logoUrl: "http://new.img",
//   };

//   test("works", async function () {
//     let company = await Company.update("c1", updateData);
//     expect(company).toEqual({
//       handle: "c1",
//       ...updateData,
//     });

//     const result = await db.query(
//           `SELECT handle, name, description, num_employees, logo_url
//            FROM companies
//            WHERE handle = 'c1'`);
//     expect(result.rows).toEqual([{
//       handle: "c1",
//       name: "New",
//       description: "New Description",
//       num_employees: 10,
//       logo_url: "http://new.img",
//     }]);
//   });

//   test("works: null fields", async function () {
//     const updateDataSetNulls = {
//       name: "New",
//       description: "New Description",
//       numEmployees: null,
//       logoUrl: null,
//     };

//     let company = await Company.update("c1", updateDataSetNulls);
//     expect(company).toEqual({
//       handle: "c1",
//       ...updateDataSetNulls,
//     });

//     const result = await db.query(
//           `SELECT handle, name, description, num_employees, logo_url
//            FROM companies
//            WHERE handle = 'c1'`);
//     expect(result.rows).toEqual([{
//       handle: "c1",
//       name: "New",
//       description: "New Description",
//       num_employees: null,
//       logo_url: null,
//     }]);
//   });

//   test("not found if no such company", async function () {
//     try {
//       await Company.update("nope", updateData);
//       fail();
//     } catch (err) {
//       expect(err instanceof NotFoundError).toBeTruthy();
//     }
//   });

//   test("bad request with no data", async function () {
//     try {
//       await Company.update("c1", {});
//       fail();
//     } catch (err) {
//       expect(err instanceof BadRequestError).toBeTruthy();
//     }
//   });
// });

// /************************************** remove */

// describe("remove", function () {
//   test("works", async function () {
//     await Company.remove("c1");
//     const res = await db.query(
//         "SELECT handle FROM companies WHERE handle='c1'");
//     expect(res.rows.length).toEqual(0);
//   });

//   test("not found if no such company", async function () {
//     try {
//       await Company.remove("nope");
//       fail();
//     } catch (err) {
//       expect(err instanceof NotFoundError).toBeTruthy();
//     }
//   });

// /*************************************** filter */ 

//  describe("filter", function(){
//   test("works test1", async function(){
//     const params = {
//       name: "C",
//       minEmployees:2,
//       maxEmployees:2
//     }
//     const companies = await Company.filterCompanies(params)
//     expect(companies).toEqual([{'name': "C2", 'num_employees': 2, description:"Desc2", handle:"c2", logo_url:"http://c2.img"}])
//   })

//   test("works test2", async function(){
//     const params = {
//       name: "c",
//       minEmployees:1,
//       maxEmployees:3
//     }
//     const companies = await Company.filterCompanies(params)
//     expect(companies).toEqual([{'name': "C1", 'num_employees': 1, description:"Desc1", handle:"c1", logo_url:"http://c1.img"},
//     {'name': "C2", 'num_employees': 2, description:"Desc2", handle:"c2", logo_url:"http://c2.img"},
//     {'name': "C3", 'num_employees': 3, description:"Desc3", handle:"c3", logo_url:"http://c3.img"}])
//   })

//   test("works test3", async function(){
//     const params = {
//       name: "c"
//     }
//     const companies = await Company.filterCompanies(params)
//     expect(companies).toEqual([{'name': "C1", 'num_employees': 1, description:"Desc1", handle:"c1", logo_url:"http://c1.img"},
//     {'name': "C2", 'num_employees': 2, description:"Desc2", handle:"c2", logo_url:"http://c2.img"},
//     {'name': "C3", 'num_employees': 3, description:"Desc3", handle:"c3", logo_url:"http://c3.img"}])
//   })

//   test("works test4", async function(){
//     const params = {
//       name: "a",
//       minEmployees:6,
//       maxEmployees:8
//     }
//     const companies = await Company.filterCompanies(params)
//     expect(companies).toEqual([])
//   })
//  })
});
