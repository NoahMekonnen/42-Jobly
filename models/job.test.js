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

  test("works", async function () {
    const n1 = await Job.create({...newJob})
    const result = await db.query(
      `SELECT id, title, salary, equity, company_handle
     FROM jobs
     `);
  
     const id = result.rows[0].id
  
    let job = await Job.update(id, updateData);
    expect({...job,id:id}).toEqual({
      id: expect.any(Number),
      ...updateData,
    });
  })
  test("not found if no such job", async function () {
    try {
      await Job.update(5,updateData);  
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });

  test("bad request with no data", async function () {
    try{
     await Job.update(1, {});
    } catch(err){
      expect(err instanceof BadRequestError).toBeTruthy()
    }
  });
});

/************************************** remove */

describe("remove", function () {
  test("works", async function () {
    await Job.create({...newJob})
    const result = await db.query(`SELECT * FROM jobs`)
    const id = result.rows[0].id
    expect(result.rows.length).toEqual(1);
    await Job.remove(id)
    const result2 = await db.query(`SELECT * FROM jobs`)
    expect(result2.rows.length).toEqual(0)
  });

  test("not found if no such job", async function () {
    try {
      await Job.remove(1);
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});
