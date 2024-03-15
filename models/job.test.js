"use strict";

process.env.NODE_ENV = "test"

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

const newJob = {
    title: "software engineer",
    salary: 55000,
    equity: "1",
    companyHandle: "c1"
}

const newJob2 = {
    id: 2,
    title: "janitor",
    salary: 40000,
    equity: "0",
    companyHandle: "c1"
}

const newJob3 = {
    title: "teacher",
    salary: 70000,
    equity: "0",
    companyHandle: "c1"
}

/************************************** create */

describe("create", function () {

    test("works", async function () {
        await db.query(`DELETE FROM jobs`)
        let job = await Job.create(newJob);
    
        expect({...job,id:0}).toEqual({...newJob,id:0});
      
        const result = await db.query(
            `SELECT id, title, salary, equity, company_handle
           FROM jobs
           `);

        expect(result.rows[0]).toEqual(
            {
                id: expect.any(Number),
                title: "software engineer",
                salary: 55000,
                equity: "1",
                company_handle: "c1"
            });
    });

});

/************************************** findAll */

describe("findAll", function () {
    test("works: no filter", async function () {
        await Job.create(newJob2)
        await Job.create(newJob3)
        let jobs = await Job.findAll();
        expect(jobs).toEqual([
            {
                title: "janitor",
                salary: 40000,
                equity: "0",
                companyHandle: "c1"
            },
            {
                title: "teacher",
                salary: 70000,
                equity: "0",
                companyHandle: "c1"
            }
        ]);
    });
});

/************************************** get */

describe("get", function () {
  test("works", async function () {
    const n1 = await Job.create({...newJob})
    const n2 = await Job.create({...newJob2})
    
    const result = await db.query(
      `SELECT id, title, salary, equity, company_handle
     FROM jobs
     `);

    let job = await Job.get(result.rows[1].id);

    expect({...job,id:result.rows[1].id}).toEqual({
        id:expect.any(Number),
        title: "janitor",
        salary: 40000,
        equity: "0",
        companyHandle: "c1"
    });
  });

  test("not found if no such job", async function () {
    try {
      await Job.get(5);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

/************************************** update */

describe("update", function () {

  const updateData = {
    title:"project manager",
    salary:75000,
    equity:"0.5",
    companyHandle:"c2"
  };

  // test("works", async function () {
  //   const n1 = await Job.create({...newJob})
  //   const result = await db.query(
  //     `SELECT id, title, salary, equity, company_handle
  //    FROM jobs
  //    `);
  
  //    const id = result.rows[0].id
  
  //   let job = await Job.update(id, updateData);
  //   expect({...job,id:id}).toEqual({
  //     id: expect.any(Number),
  //     ...updateData,
  //   });
  // })
  test("not found if no such job", async function () {
    console.log("hi")
      const resp = await Job.update(47, updateData);
      console.log(resp,"RESP")
      expect(resp.statusCode).toEqual(404)
  });

  // test("bad request with no data", async function () {
  //   const resp = await Job.update(1, {});
  //    expect(resp.statusCode).toEqual(400)
  // });
});

// // /************************************** remove */

// // describe("remove", function () {
// //   test("works", async function () {
// //     await Company.remove("c1");
// //     const res = await db.query(
// //         "SELECT handle FROM companies WHERE handle='c1'");
// //     expect(res.rows.length).toEqual(0);
// //   });

// //   test("not found if no such company", async function () {
// //     try {
// //       await Company.remove("nope");
// //       fail();
// //     } catch (err) {
// //       expect(err instanceof NotFoundError).toBeTruthy();
// //     }
// //   });

// // /*************************************** filter */ 

// //  describe("filter", function(){
// //   test("works test1", async function(){
// //     const params = {
// //       name: "C",
// //       minEmployees:2,
// //       maxEmployees:2
// //     }
// //     const companies = await Company.filterCompanies(params)
// //     expect(companies).toEqual([{'name': "C2", 'num_employees': 2, description:"Desc2", handle:"c2", logo_url:"http://c2.img"}])
// //   })

// //   test("works test2", async function(){
// //     const params = {
// //       name: "c",
// //       minEmployees:1,
// //       maxEmployees:3
// //     }
// //     const companies = await Company.filterCompanies(params)
// //     expect(companies).toEqual([{'name': "C1", 'num_employees': 1, description:"Desc1", handle:"c1", logo_url:"http://c1.img"},
// //     {'name': "C2", 'num_employees': 2, description:"Desc2", handle:"c2", logo_url:"http://c2.img"},
// //     {'name': "C3", 'num_employees': 3, description:"Desc3", handle:"c3", logo_url:"http://c3.img"}])
// //   })

// //   test("works test3", async function(){
// //     const params = {
// //       name: "c"
// //     }
// //     const companies = await Company.filterCompanies(params)
// //     expect(companies).toEqual([{'name': "C1", 'num_employees': 1, description:"Desc1", handle:"c1", logo_url:"http://c1.img"},
// //     {'name': "C2", 'num_employees': 2, description:"Desc2", handle:"c2", logo_url:"http://c2.img"},
// //     {'name': "C3", 'num_employees': 3, description:"Desc3", handle:"c3", logo_url:"http://c3.img"}])
// //   })

// //   test("works test4", async function(){
// //     const params = {
// //       name: "a",
// //       minEmployees:6,
// //       maxEmployees:8
// //     }
// //     const companies = await Company.filterCompanies(params)
// //     expect(companies).toEqual([])
// //   })
// //  })

