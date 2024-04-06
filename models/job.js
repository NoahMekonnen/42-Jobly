"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

/** Related functions for jobs. */

class Job {
  /** Create a job (from data), update db, return new job data.
   *
   * data should be { title, salary, equity, company_handle }
   *
   * Returns { title, salary, equity, companyHandle }
   *
   * */

  static async create({ title, salary, equity, companyHandle }) {

    const result = await db.query(
      `INSERT INTO jobs
           (title, salary, equity, company_handle)
           VALUES ($1, $2, $3, $4)
           RETURNING id, title, salary, equity, company_handle AS "companyHandle"`,
      [
        title,
        salary,
        equity,
        companyHandle,
      ],
    );
    let job = result.rows[0];
    return job;
  }

  /** Find all jobs.
   *
   * Returns [{ title, salary, equity, companyHandle}, ...]
   * */

  static async findAll() {
    const jobsRes = await db.query(
      `SELECT id, 
                  title,
                  salary,
                  equity,
                  company_handle AS "companyHandle"
           FROM jobs
           ORDER BY title`);
    return jobsRes.rows;
  }

  /** Given a job id, return data about job.
   *
   * Returns { title, salary, equity, companyHandle}
   *
   * Throws NotFoundError if not found.
   **/

  static async get(id) {
    const jobRes = await db.query(
      `SELECT id,
                  title,
                  salary,
                  equity,
                  company_handle AS "companyHandle"
           FROM jobs
           WHERE id = $1`,
      [id]);

    const job = jobRes.rows[0];

    if (!job) throw new NotFoundError(`No job: ${id}`);

    return job;
  }

  /** Update job data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain all the
   * fields; this only changes provided ones.
   *
   * Data can include: {title, salary, equity, companyHandle}
   *
   * Returns {title, salary, equity, companyHandle}
   *
   * Throws NotFoundError if not found.
   */

  static async update(id, data) {
    const { setCols, values } = sqlForPartialUpdate(
      data,
      {
        companyHandle: "company_handle"
      });
    const IdVarIdx = "$" + (values.length + 1);

    const querySql = `UPDATE jobs 
                      SET ${setCols} 
                      WHERE id = ${IdVarIdx} 
                      RETURNING id,
                                title, 
                                salary, 
                                equity, 
                                company_handle AS "companyHandle"
                                `;
    const result = await db.query(querySql, [...values, id]);
    const job = result.rows[0];

    if (!job) throw new NotFoundError(`No job: ${id}`);

    return job;
  }

  /** Delete given job from database; returns undefined.
   *
   * Throws NotFoundError if job not found.
   **/

  static async remove(id) {
    const result = await db.query(
      `DELETE
           FROM jobs
           WHERE id = $1
           RETURNING id`,
      [id]);
    const job = result.rows[0];

    if (!job) throw new NotFoundError(`No company: ${id}`);
  }

  /** Filters jobs based on given params
   * Possible params:
   * - title
   * - minSalary
   * - hasEquity
   */

  static async filterJobs(params) {
    let finalquery = `SELECT id, 
                title, 
                salary, 
                equity, 
                company_handle AS "companyHandle" 
                FROM jobs WHERE `
    let query = `SELECT id, 
                title, 
                salary, 
                equity, 
                company_handle AS "companyHandle" 
                FROM jobs WHERE `
    let inputs = []
    if (params.title) {
      query += 'title LIKE $1 OR title LIKE $2'
      inputs.push("%" + params.title.toLowerCase() + "%")
      inputs.push("%" + params.title.toUpperCase() + "%")
      if (params.minSalary) {
        query += ' AND salary >= $3'
        inputs.push(params.minSalary)
        if (params.hasEquity) {
          query += ' AND equity > 0 OR equity < 0'
        }
      } else {
        if (params.hasEquity) {
          query += ' AND equity > 0 OR equity < 0'
        }
      }
    } else {
      if (params.minSalary) {
        query += 'salary >= $1'
        console.log(query,"Query1")
        inputs.push(params.minSalary)
        if (params.hasEquity) {
          query += ' AND equity > 0 OR equity < 0'
        }
      } else {
        if (params.hasEquity) {
          query += ' AND equity > 0 OR equity < 0'
        }
      }
    }
    if (query == finalquery) {
      query = `SELECT id, 
      title, 
      salary, 
      equity, 
      company_handle AS "companyHandle" 
      FROM jobs`
    }
    console.log(query,inputs,"Query2")
    const result = await db.query(query, inputs)
    const jobs = result.rows
    return jobs
  }

}


module.exports = Job;
