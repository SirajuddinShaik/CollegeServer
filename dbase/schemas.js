import mongoose from "mongoose";

const securitySchema = new mongoose.Schema({
  securityKey: String,
  _id: String,
});

const studentSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  src: String,
  password: {
    type: String,
    required: true,
  },
  fname: {
    type: String,
    required: true,
  },
  lname: {
    type: String,
    required: true,
  },
  _id: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  regdno: String,
  mobile: Number,
  address: String,
  fatherName: String,
  fmobile: Number,
  motherName: String,
  mmobile: Number,
  attendance: Number,
  branch: String,
  feePaid: Number,
  totalFee: Number,
  studentMessage: String,
  counsellorMessage: String,
  counsellorId: String,
});

const counsellorSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  src: String,
  password: {
    type: String,
    required: true,
  },
  fname: String,
  mName: String,
  lname: String,
  uniqueId: {
    type: String,
    required: true,
  },
  _id: {
    type: String,
    required: true,
  },
  mobile: Number,
  address: String,
  branch: String,
  subject: String,
  counsellingStudents: [studentSchema],
  hodname: String,
  counsellorMessage: String,
  adminMessage: String,
  email: String,
});

const counsellorScheme = new mongoose.Schema({
  _id: {
    type: String,
    required: true,
  },
  fullName: {
    type: String,
    required: true,
  },
  branch: String,
});

const adminSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  src: String,
  password: {
    type: String,
    required: true,
  },
  fName: String,
  mName: String,
  lName: String,
  uniqueId: {
    type: String,
    required: true,
  },
  mobile: Number,
  address: String,
  branch: String,
  subject: String,
  counsellers: [counsellorScheme],
  counsellorMessage: String,
});

export const Student = mongoose.model("Student", studentSchema);
export const Counseller = mongoose.model("Counseller", counsellorSchema);
export const Admin = mongoose.model("Admin", adminSchema);
export const Security = mongoose.model("Security", securitySchema);
