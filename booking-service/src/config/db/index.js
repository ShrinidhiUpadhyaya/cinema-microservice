const { ObjectId } = require("mongodb");
const { connect } = require("./mongo");

module.exports = Object.assign({}, { connect, ObjectId });
