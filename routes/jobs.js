"use strict";

/** Routes for companies. */

const jsonschema = require("jsonschema");
const express = require("express");

const { BadRequestError, UnauthorizedError } = require("../expressError");
const { ensureLoggedIn } = require("../middleware/auth");
const Company = require("../models/company");

const companyNewSchema = require("../schemas/companyNew.json");
const companyUpdateSchema = require("../schemas/companyUpdate.json");
const companyFilterSchema = require("../schemas/companyfilter.json");

const router = new express.Router();


/** POST / { company } =>  { company }
 *
 * company should be { handle, name, description, numEmployees, logoUrl }
 *
 * Returns { handle, name, description, numEmployees, logoUrl }
 *
 * Authorization required: login
 */

router.post("/", ensureLoggedIn, async function (req, res, next) {
  try {
    if (!(res.locals.user.isAdmin)) throw new UnauthorizedError("You must be an Admin to do this")

    const validator = jsonschema.validate(req.body, companyNewSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }

    const company = await Company.create(req.body);
    return res.status(201).json({ company });
  } catch (err) {
    return next(err);
  }
});

/** GET /  =>
 *   { companies: [ { handle, name, description, numEmployees, logoUrl }, ...] }
 *
 * Can filter on provided search filters:
 * - minEmployees
 * - maxEmployees
 * - nameLike (will find case-insensitive, partial matches)
 *
 * Authorization required: none
 */

router.get("/", async function (req, res, next) {
  try {
    const minEmployees = req.query.minEmployees
    const maxEmployees = req.query.maxEmployees
    const params = {}

    if (req.query.name){ params.name = req.query.name }
    if (req.query.minEmployees){ params.minEmployees = parseInt(req.query.minEmployees) }
    if (req.query.maxEmployees){ params.maxEmployees = parseInt(req.query.maxEmployees) }
    

    const validator = jsonschema.validate(params, companyFilterSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }

    if ( minEmployees > maxEmployees) throw new BadRequestError("min must be <= max")

    const companies = await Company.filterCompanies(params)

    return res.json({ companies });
  } catch (err) {
    return next(err);
  }
});

/** GET /[handle]  =>  { company }
 *
 *  Company is { handle, name, description, numEmployees, logoUrl, jobs }
 *   where jobs is [{ id, title, salary, equity }, ...]
 *
 * Authorization required: none
 */

router.get("/:handle", async function (req, res, next) {
  try {
    const company = await Company.get(req.params.handle);
    return res.json({ company });
  } catch (err) {
    return next(err);
  }
});

/** PATCH /[handle] { fld1, fld2, ... } => { company }
 *
 * Patches company data.
 *
 * fields can be: { name, description, numEmployees, logo_url }
 *
 * Returns { handle, name, description, numEmployees, logo_url }
 *
 * Authorization required: login
 */

router.patch("/:handle", ensureLoggedIn, async function (req, res, next) {
  try {
    if (!(res.locals.user.isAdmin)) throw new UnauthorizedError("You must be an Admin to do this")

    const validator = jsonschema.validate(req.body, companyUpdateSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }

    const company = await Company.update(req.params.handle, req.body);
    return res.json({ company });
  } catch (err) {
    return next(err);
  }
});

/** DELETE /[handle]  =>  { deleted: handle }
 *
 * Authorization: login
 */

router.delete("/:handle", ensureLoggedIn, async function (req, res, next) {
  try {
    if (!(res.locals.user.isAdmin)) throw new UnauthorizedError("You must be an Admin to do this")

    await Company.remove(req.params.handle);
    return res.json({ deleted: req.params.handle });
  } catch (err) {
    return next(err);
  }
});


module.exports = router;
