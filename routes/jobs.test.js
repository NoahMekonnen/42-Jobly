"use strict";

const request = require("supertest");

const db = require("../db");
const app = require("../app");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  u1Token,
  u4Token,
  u2Token,
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

/************************************** POST /jobs */

describe("POST /jobs", function () {

  test("ok for admin", async function () {
    const resp = await request(app)
        .post("/jobs")
        .send({...newJob,salary:`${newJob.salary}`})
        .set("authorization", `Bearer ${u4Token}`);
    expect(resp.statusCode).toEqual(201);
    expect(resp.body).toEqual({
      job:{...newJob, id: resp.body.job.id},
    });
  });

  test("bad request with missing data", async function () {
    const resp = await request(app)
        .post("/jobs")
        .send({
          title: "teacher",
          salary: 65000
        })
        .set("authorization", `Bearer ${u4Token}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request with invalid data", async function () {
    const resp = await request(app)
        .post("/jobs")
        .send({
          ...newJob,
          title:2,
        })
        .set("authorization", `Bearer ${u4Token}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("unauth for normal user", async function(){
    const resp = await request(app)
    .post("/jobs")
    .send(newJob)
    .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  })
});

// /************************************** GET /jobs */

describe("GET /jobs", function () {
  test("ok for anon", async function () {

    const resp1 = await request(app)
        .post("/jobs")
        .send({...newJob,salary:`${newJob.salary}`})
        .set("authorization", `Bearer ${u4Token}`);
    const resp2 = await request(app)
        .post("/jobs")
        .send({...newJob2,salary:`${newJob2.salary}`})
        .set("authorization", `Bearer ${u4Token}`);
    const resp3 = await request(app).get("/jobs")
    
    expect(resp3.body.jobs[0].id).toEqual(resp1.body.job.id);
    expect(resp3.body.jobs[1].id).toEqual(resp2.body.job.id);
  });

  test("fails: test next() handler", async function () {
    // there's no normal failure event which will cause this route to fail ---
    // thus making it hard to test that the error-handler works with it. This
    // should cause an error, all right :)
    await db.query("DROP TABLE jobs CASCADE");
    const resp = await request(app)
        .get("/jobs")
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(500);
  });
});

// /************************************** GET /jobs/:id */

describe("GET /jobs/:id", function () {
  test("works for anon", async function () {
    const postResp = await request(app).post('/jobs')
    .send({
      ...newJob,salary:`${newJob.salary}`
  })
  .set("authorization", `Bearer ${u4Token}`);

    const resp = await request(app).get(`/jobs/${postResp.body.job.id}`);
    expect(resp.body.job.id).toEqual(postResp.body.job.id);
  });


  test("not found for no such job", async function () {
    const resp = await request(app).get(`/jobs/0`);
    expect(resp.statusCode).toEqual(404);
  });
});

/************************************** PATCH /jobs/:id */

describe("PATCH /jobs/:id", function () {
  test("works for admin", async function () {
    const resp1 = await request(app)
        .post("/jobs")
        .send({...newJob,salary:`${newJob.salary}`})
        .set("authorization", `Bearer ${u4Token}`);
    const resp2 = await request(app)
        .patch(`/jobs/${resp1.body.job.id}`)
        .send({
          title : "Truck Driver",
        })
        .set("authorization", `Bearer ${u4Token}`);
    expect(resp2.body.job.id).toEqual(resp1.body.job.id);
    expect(resp2.statusCode).toEqual(200);
  });

  test("unauth for anon", async function () {
    await request(app).post('/jobs')
    .send({
     ...newJob,
     salary:`${newJob.salary}`
  })
  .set("authorization", `Bearer ${u4Token}`);
    const getResp = await request(app).get(`/jobs`);
    const resp = await request(app)
        .patch(`/jobs/${getResp.body.jobs[0].id}`)
        .send({
          title: "Truck Driver",
        });
  
    expect(resp.statusCode).toEqual(401);
  });

  test("not found on no such job", async function () {
    const resp = await request(app)
        .patch(`/jobs/0`)
        .send({
          title: "new nope",
        })
        .set("authorization", `Bearer ${u4Token}`);
    expect(resp.statusCode).toEqual(404);
  });

  test("bad request on id change attempt", async function () {
    const postResp = await request(app).post('/jobs')
    .send({
     ...newJob,
     salary:`${newJob.salary}`
  })
  .set("authorization", `Bearer ${u4Token}`);
    const resp = await request(app)
        .patch(`/jobs/${postResp.body.job.id}`)
        .send({
          id: 1,
        })
        .set("authorization", `Bearer ${u4Token}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request on invalid data", async function () {
    const postResp = await request(app).post('/jobs')
    .send({
     ...newJob,
     salary:`${newJob.salary}`
  })
  .set("authorization", `Bearer ${u4Token}`);

    const resp = await request(app)
        .patch(`/jobs/${postResp.body.job.id}`)
        .send({
          equity:"1"
        })
        .set("authorization", `Bearer ${u4Token}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("unauth for normal user", async function(){
    const postResp = await request(app).post('/jobs')
    .send({
     ...newJob,
     salary:`${newJob.salary}`
  })
  .set("authorization", `Bearer ${u4Token}`);

    const resp = await request(app)
    .patch(`/jobs/c2`)
    .send({
      title:"Truck Driver"
    })
    .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401)
  })
});

// /************************************** DELETE /companies/:handle */

describe("DELETE /jobs/:id", function () {
  test("works for admin", async function () {
    const postResp = await request(app).post('/jobs')
    .send({
     ...newJob,
     salary:`${newJob.salary}`
  })
  .set("authorization", `Bearer ${u4Token}`);

    const resp = await request(app)
        .delete(`/jobs/${postResp.body.job.id}`)
        .set("authorization", `Bearer ${u4Token}`);
    expect(resp.body).toEqual({ deleted: `${postResp.body.job.id}` });
  });

  test("unauth for anon", async function () {
    const postResp = await request(app).post('/jobs')
    .send({
     ...newJob,
     salary:`${newJob.salary}`
  })
  .set("authorization", `Bearer ${u4Token}`);

    const resp = await request(app)
        .delete(`/jobs/${postResp.body.job.id}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("not found for no such job", async function () {
    const resp = await request(app)
        .delete(`/jobs/0`)
        .set("authorization", `Bearer ${u4Token}`);
    expect(resp.statusCode).toEqual(404);
  });
});

describe("GET /jobs", function(){
  test("works test1", async function(){
  const postResp1 = await request(app).post('/jobs')
    .send({
     ...newJob,
     salary:`${newJob.salary}`
  })
  .set("authorization", `Bearer ${u4Token}`);

  const postResp2 = await request(app).post('/jobs')
    .send({
     ...newJob2,
     salary:`${newJob2.salary}`
  })
  .set("authorization", `Bearer ${u4Token}`);

  const postResp3 = await request(app).post('/jobs')
    .send({
     ...newJob3,
     salary:`${newJob3.salary}`
  })
  .set("authorization", `Bearer ${u4Token}`);

    const res1 = await request(app)
    .get('/jobs?title=c&')
    
    expect(res1.statusCode).toEqual(200)
    expect(res1.body.jobs.length).toEqual(1)
    expect(res1.body.jobs[0].id).toEqual(postResp3.body.job.id)
  })

  test("works test2", async function(){
    const postResp1 = await request(app).post('/jobs')
    .send({
     ...newJob,
     salary:`${newJob.salary}`
  })
  .set("authorization", `Bearer ${u4Token}`);

  const postResp2 = await request(app).post('/jobs')
    .send({
     ...newJob2,
     salary:`${newJob2.salary}`
  })
  .set("authorization", `Bearer ${u4Token}`);

  const postResp3 = await request(app).post('/jobs')
    .send({
     ...newJob3,
     salary:`${newJob3.salary}`
  })
  .set("authorization", `Bearer ${u4Token}`);

    const res = await request(app)
    .get('/jobs?minSalary=50000')

    expect(res.statusCode).toEqual(200)
    expect(res.body.jobs.length).toEqual(2)
    
    expect(res.body.jobs[0].id).toEqual(postResp1.body.job.id)
    expect(res.body.jobs[1].id).toEqual(postResp3.body.job.id)
  })

  test("invalid data", async function(){
    const res = await request(app)
    .get('/jobs?minSalary=max')
    expect(res.statusCode).toEqual(400)
  })

  test("unauth for normal user", async function(){
    const postResp = await request(app)
    .post('/jobs')
    .send({...newJob, salary: `${newJob.salary}`})
    .set('authorization', `Bearer ${u4Token}`)

    const resp = await request(app)
    .delete(`/jobs/${postResp.body.job.id}`)
    .set('authorization', `Bearer ${u2Token}`)
    expect(resp.statusCode).toEqual(401)
  })
})
