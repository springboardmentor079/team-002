const Vendor = require("../models/Vendor");

const DEFAULT_VENDORS = [
  {
    name: "Ultratech Cement & Aggregates",
    category: "Raw Materials",
    phone: "+91 98450 11223",
    email: "sales@ultratech-build.com",
    contactPerson: "Ramesh Aggarwal",
    status: "Active",
  },
  {
    name: "Tata Steel & Rebar Suppliers",
    category: "Raw Materials",
    phone: "+91 98200 44556",
    email: "orders@tatasteel-infra.in",
    contactPerson: "Vikram Mehta",
    status: "Active",
  },
  {
    name: "L&T Heavy Machinery & Cranes",
    category: "Machinery",
    phone: "+91 98110 77889",
    email: "rentals@lt-machinery.com",
    contactPerson: "Anand Joshi",
    status: "Active",
  },
  {
    name: "Schneider Electric & MEP Systems",
    category: "Equipment",
    phone: "+91 98765 33221",
    email: "mep-support@schneider-systems.in",
    contactPerson: "Pooja Verma",
    status: "Active",
  },
  {
    name: "Safework Pro Safety Equipment",
    category: "Safety Equipment",
    phone: "+91 99000 88112",
    email: "safety@safeworkpro.com",
    contactPerson: "Karan Singh",
    status: "Active",
  },
];

exports.getVendors = async (req, res) => {
  try {
    let data = await Vendor.find().sort({ createdAt: -1 });
    if (!data || data.length === 0) {
      data = await Vendor.insertMany(DEFAULT_VENDORS);
    }
    res.json({ success: true, data });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};


exports.createVendor = async (req, res) => {
  try {
    const data = await Vendor.create(req.body);
    res.status(201).json({ success: true, data });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
};

exports.updateVendor = async (req, res) => {
  try {
    const data = await Vendor.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!data) {
      return res.status(404).json({ success: false, message: "Vendor not found" });
    }
    res.json({ success: true, data });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
};

exports.deleteVendor = async (req, res) => {
  try {
    const data = await Vendor.findByIdAndDelete(req.params.id);
    if (!data) {
      return res.status(404).json({ success: false, message: "Vendor not found" });
    }
    res.json({ success: true, message: "Vendor deleted" });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
};