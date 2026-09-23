const User = require("../models/User");
const bcrypt = require("bcryptjs");
const Project = require("../models/Project");
const MaterialRequest = require("../models/MaterialRequest");
const WorkOrder = require("../models/WorkOrder");
const Equipment = require("../models/Equipment");
const Milestone = require("../models/Milestone");
const Attendance = require("../models/Attendance");
const Inventory = require("../models/Inventory");
const Report = require("../models/Report");
const Notification = require("../models/Notification");
const Payroll = require("../models/Payroll");

const seedInitialData = async () => {
  try {
    // 0. Default Users for all 6 roles
    const adminExists = await User.findOne({ email: "admin@buildtrack.com" });
    if (!adminExists) {
      const defaultPassword = await bcrypt.hash("password123", 12);
      const demoUsers = [
        { email: "admin@buildtrack.com", name: "Admin Administrator", role: "admin", password: defaultPassword },
        { email: "pm@buildtrack.com", name: "Project Manager", role: "project_manager", password: defaultPassword },
        { email: "engineer@buildtrack.com", name: "Site Engineer", role: "site_engineer", password: defaultPassword },
        { email: "contractor@buildtrack.com", name: "Master Contractor", role: "contractor", password: defaultPassword },
        { email: "worker@buildtrack.com", name: "Ramesh Kumar (Worker)", role: "worker", password: defaultPassword },
        { email: "client@buildtrack.com", name: "Skyline Client", role: "client", password: defaultPassword },
      ];
      await User.insertMany(demoUsers);
    }

    // 1. Projects
    const projectCount = await Project.countDocuments();
    if (projectCount === 0) {
      await Project.insertMany([
        {
          name: "Skyline Heights - Tower A",
          code: "PRJ-1024",
          description: "High-rise residential tower with 24 floors and premium amenities.",
          client: "Skyline Realty Ltd",
          manager: "Project Manager",
          location: "Sector 62, Metro City",
          budget: "₹ 15.0 Cr",
          spent: "₹ 8.5 Cr",
          status: "On Track",
          progress: 68,
          startDate: "10 Jan 2026",
          endDate: "30 Aug 2026",
          priority: "High",
        },
        {
          name: "Metro Phase 2 Line Extension",
          code: "PRJ-2048",
          description: "Underground tunnel and elevated metro track corridor.",
          client: "Metro Rail Corp",
          manager: "Project Manager",
          location: "South Corridor Zone 3",
          budget: "₹ 45.0 Cr",
          spent: "₹ 32.0 Cr",
          status: "On Track",
          progress: 80,
          startDate: "01 Nov 2025",
          endDate: "15 Dec 2026",
          priority: "High",
        },
        {
          name: "Green Valley Luxury Villas",
          code: "PRJ-3012",
          description: "Gated community project of 40 luxury smart villas.",
          client: "Green Valley Devs",
          manager: "Project Manager",
          location: "North Hills, Highway 8",
          budget: "₹ 22.0 Cr",
          spent: "₹ 11.2 Cr",
          status: "Delayed",
          progress: 45,
          startDate: "15 Feb 2026",
          endDate: "20 Jan 2027",
          priority: "Medium",
        },
        {
          name: "Apex IT Business Park",
          code: "PRJ-4096",
          description: "12-storey corporate commercial tower with LEED Gold rating.",
          client: "Apex Commercials",
          manager: "Project Manager",
          location: "Financial District",
          budget: "₹ 35.0 Cr",
          spent: "₹ 12.0 Cr",
          status: "At Risk",
          progress: 32,
          startDate: "01 Mar 2026",
          endDate: "10 Feb 2027",
          priority: "High",
        },
      ]);
    }

    // 2. Material Requests
    const reqCount = await MaterialRequest.countDocuments();
    if (reqCount === 0) {
      await MaterialRequest.insertMany([
        {
          reqId: "REQ-104",
          material: "OPC 53 Grade Cement",
          category: "Cement",
          quantity: "450 Bags",
          requestedBy: "Contractor",
          site: "Tower A - Level 12",
          status: "Approved",
          badge: "good",
          date: "Today, 10:15 AM",
          notes: "Required for slab casting batch.",
        },
        {
          reqId: "REQ-102",
          material: "TMT Rebar 16mm (Fe 550)",
          category: "Steel",
          quantity: "12 Metric Tons",
          requestedBy: "Contractor",
          site: "Core Column Zone",
          status: "In Transit",
          badge: "transit",
          date: "Yesterday",
          notes: "Dispatched from warehouse 1.",
        },
        {
          reqId: "REQ-099",
          material: "Ready-Mix Concrete (M25)",
          category: "Concrete",
          quantity: "65 m³",
          requestedBy: "Contractor",
          site: "Basement 2",
          status: "Delivered",
          badge: "good",
          date: "Yesterday",
          notes: "Pouring completed without slump issues.",
        },
        {
          reqId: "REQ-097",
          material: "Red Clay Modular Bricks",
          category: "Bricks",
          quantity: "15,000 Pcs",
          requestedBy: "Contractor",
          site: "Tower A - Floors 4-6",
          status: "Pending Approval",
          badge: "warning",
          date: "01 Mar 2026",
          notes: "Awaiting PM cost verification.",
        },
      ]);
    }

    // 3. Work Orders
    const woCount = await WorkOrder.countDocuments();
    if (woCount === 0) {
      await WorkOrder.insertMany([
        {
          orderId: "WO-2026-081",
          title: "RCC Frame Casting - Block C",
          lead: "Amit Sharma",
          trade: "Structural & Masons",
          progress: 82,
          deadline: "12 Mar 2026",
          status: "On Schedule",
          statusClass: "good",
          zone: "Block C Core",
        },
        {
          orderId: "WO-2026-089",
          title: "Brick Masonry & Plastering",
          lead: "Sunil Rawat",
          trade: "Finishing & Masonry",
          progress: 45,
          deadline: "25 Mar 2026",
          status: "In Progress",
          statusClass: "warning",
          zone: "Tower A - Floor 4",
        },
        {
          orderId: "WO-2026-092",
          title: "External Drainage Pipeline",
          lead: "Karan Patel",
          trade: "Plumbing & Earthwork",
          progress: 25,
          deadline: "05 Apr 2026",
          status: "Delayed",
          statusClass: "danger",
          zone: "Perimeter Trench",
        },
        {
          orderId: "WO-2026-095",
          title: "Internal Electrical Conduit Laying",
          lead: "Manish Kumar",
          trade: "Electrical MEP",
          progress: 60,
          deadline: "18 Apr 2026",
          status: "On Schedule",
          statusClass: "good",
          zone: "Floors 5 to 8",
        },
      ]);
    }

    // 4. Equipment
    const eqCount = await Equipment.countDocuments();
    if (eqCount === 0) {
      await Equipment.insertMany([
        {
          name: "Tower Crane #1 (Potain)",
          type: "Crane",
          status: "Operational",
          operator: "Rajesh S.",
          location: "Central Core Tower",
          badge: "status-operational",
          lastInspection: "24 Aug 2026",
        },
        {
          name: "CAT Excavator 320",
          type: "Excavator",
          status: "In Use",
          operator: "Harpreet Singh",
          location: "East Foundation Trench",
          badge: "status-operational",
          lastInspection: "22 Aug 2026",
        },
        {
          name: "Transit Mixer 8m³",
          type: "Concrete Mixer",
          status: "Scheduled Delivery",
          operator: "Vikas Verma",
          location: "Batching Plant #2",
          badge: "status-scheduled",
          lastInspection: "20 Aug 2026",
        },
        {
          name: "Tipper Truck #4 (Tata)",
          type: "Dump Truck",
          status: "Maintenance",
          operator: "Workshop",
          location: "Service Bay B",
          badge: "status-maintenance",
          lastInspection: "18 Aug 2026",
        },
        {
          name: "Diesel Generator 125kVA",
          type: "Generator",
          status: "Standby",
          operator: "Site Crew",
          location: "Power Substation 1",
          badge: "status-scheduled",
          lastInspection: "25 Aug 2026",
        },
      ]);
    }

    // 5. Milestones
    const msCount = await Milestone.countDocuments();
    if (msCount === 0) {
      await Milestone.insertMany([
        {
          phase: "Phase 1: Foundation & Earthwork",
          project: "Skyline Heights - Tower A",
          date: "Completed Jan 2026",
          status: "Verified & Approved",
          badge: "good",
          progress: 100,
          amount: "₹ 2.5 Cr",
          clientApproved: true,
          verifiedBy: "Site Engineer Rajesh",
        },
        {
          phase: "Phase 2: RCC Structure (Floors 1-12)",
          project: "Skyline Heights - Tower A",
          date: "Target: 25 Mar 2026",
          status: "85% On Track",
          badge: "progress",
          progress: 85,
          amount: "₹ 4.3 Cr",
          clientApproved: false,
          verifiedBy: "Site Engineer Rajesh",
        },
        {
          phase: "Phase 3: MEP & Electrical Rough-in",
          project: "Skyline Heights - Tower A",
          date: "Target: 30 Apr 2026",
          status: "45% In Progress",
          badge: "progress",
          progress: 45,
          amount: "₹ 1.8 Cr",
          clientApproved: false,
          verifiedBy: "Site Engineer Rajesh",
        },
        {
          phase: "Phase 4: Interior Plastering & Flooring",
          project: "Skyline Heights - Tower A",
          date: "Target: 15 Jun 2026",
          status: "Upcoming",
          badge: "pending",
          progress: 0,
          amount: "₹ 1.2 Cr",
          clientApproved: false,
          verifiedBy: "Pending",
        },
        {
          phase: "Phase 5: Final OC & Key Handover",
          project: "Skyline Heights - Tower A",
          date: "Target: 30 Aug 2026",
          status: "Scheduled",
          badge: "pending",
          progress: 0,
          amount: "₹ 0.8 Cr",
          clientApproved: false,
          verifiedBy: "Pending",
        },
      ]);
    }

    // 6. Attendance
    const attCount = await Attendance.countDocuments();
    if (attCount === 0) {
      await Attendance.insertMany([
        {
          userName: "Site Worker",
          userEmail: "worker@buildtrack.com",
          role: "worker",
          trade: "Skilled Masonry & Rebar",
          date: "Today",
          checkIn: "07:52 AM",
          checkOut: "--",
          status: "Present",
          site: "Metro Tower A - Floor 8",
          shift: "Day Shift (08:00 AM - 05:00 PM)",
        },
        {
          userName: "Sunil Rawat",
          userEmail: "sunil@buildtrack.com",
          role: "worker",
          trade: "Masons & Structural",
          date: "Today",
          checkIn: "08:05 AM",
          checkOut: "--",
          status: "Present",
          site: "Tower A - Level 12",
          shift: "Day Shift",
        },
        {
          userName: "Karan Patel",
          userEmail: "karan@buildtrack.com",
          role: "worker",
          trade: "Electricians & MEP",
          date: "Today",
          checkIn: "08:12 AM",
          checkOut: "--",
          status: "Present",
          site: "Tower A - Floor 4",
          shift: "Day Shift",
        },
      ]);
    }

    // 7. Inventory
    const invCount = await Inventory.countDocuments();
    if (invCount === 0) {
      await Inventory.insertMany([
        {
          name: "OPC 53 Grade Cement",
          category: "Cement & Aggregates",
          quantity: 850,
          unit: "Bags",
          minQuantity: 150,
          location: "Warehouse 1 - North Yard",
          unitPrice: "₹ 380",
          status: "In Stock",
        },
        {
          name: "TMT Rebar 16mm Fe 550",
          category: "Steel & Rebar",
          quantity: 28,
          unit: "Metric Tons",
          minQuantity: 10,
          location: "Open Stock Yard C",
          unitPrice: "₹ 62,000 / Ton",
          status: "In Stock",
        },
        {
          name: "River Sand (Coarse M-Sand)",
          category: "Aggregates",
          quantity: 45,
          unit: "Metric Tons",
          minQuantity: 50,
          location: "Sand Pit #2",
          unitPrice: "₹ 1,850 / Ton",
          status: "Low Stock",
        },
        {
          name: "Red Clay Modular Bricks",
          category: "Bricks & Blocks",
          quantity: 25000,
          unit: "Pcs",
          minQuantity: 5000,
          location: "Stock Pile A",
          unitPrice: "₹ 9 / Pc",
          status: "In Stock",
        },
        {
          name: "PVC Electrical Conduit 25mm",
          category: "MEP & Electrical",
          quantity: 120,
          unit: "Pcs",
          minQuantity: 200,
          location: "MEP Stores B",
          unitPrice: "₹ 140 / Pc",
          status: "Low Stock",
        },
      ]);
    }

    // 8. Reports
    const repCount = await Report.countDocuments();
    if (repCount === 0) {
      await Report.insertMany([
        {
          title: "Rebar Spacing Verification & Audit",
          type: "Inspection",
          author: "Site Engineer",
          date: "Today, 09:30 AM",
          summary: "Level 11 slab reinforcement verified. Clear spacing 150mm c/c as per structural drawing.",
          status: "Approved",
          location: "Block B - Level 11 Slab",
          snagsFound: 0,
        },
        {
          title: "Concrete Slump Test #04",
          type: "Quality",
          author: "Site Engineer",
          date: "Yesterday, 02:00 PM",
          summary: "Slump test passed at 120mm workability. Cube compressive tests scheduled for 7-day curing.",
          status: "Approved",
          location: "Foundation Pile 12",
          snagsFound: 0,
        },
        {
          title: "Daily Workforce & Equipment Utilization Log",
          type: "Daily Progress",
          author: "Site Engineer",
          date: "Today 08:30 AM",
          summary: "168 active crew on site across structural, MEP, and finishes. All 5 heavy machines logged.",
          status: "Submitted",
          location: "Main Campus",
          snagsFound: 0,
        },
        {
          title: "Electrical Conduit Snag Log",
          type: "Safety & Audit",
          author: "Site Engineer",
          date: "25 Aug 2026",
          summary: "Minor routing clash in Corridor 2 resolved with MEP supervisor.",
          status: "Approved",
          location: "Zone A - Corridor 2",
          snagsFound: 1,
        },
      ]);
    }

    // 9. Notifications
    const notifCount = await Notification.countDocuments();
    if (notifCount === 0) {
      await Notification.insertMany([
        {
          title: "Material Request REQ-104 Approved",
          message: "450 Bags of OPC 53 Cement approved for Tower A casting.",
          role: "all",
          type: "success",
          time: "10 mins ago",
          read: false,
        },
        {
          title: "Weather Advisory - Heavy Rain",
          message: "Precautionary dewatering pumps installed in excavation zones.",
          role: "all",
          type: "warning",
          time: "1 hour ago",
          read: false,
        },
        {
          title: "Level 11 Milestone Verified",
          message: "Site Engineer certified Phase 2 structural completion.",
          role: "all",
          type: "info",
          time: "3 hours ago",
          read: true,
        },
      ]);
    }

    // 10. Payroll Records
    const payrollCount = await Payroll.countDocuments();
    if (payrollCount === 0) {
      await Payroll.insertMany([
        {
          workerName: "Ramesh Kumar (Worker)",
          trade: "Masons & Structural",
          slipId: "PAY-2026-881",
          period: "01 Sep – 15 Sep 2026",
          regularHours: 80,
          otHours: 12,
          hourlyRate: 350,
          rateLabel: "₹350/hr",
          grossPay: 34300,
          grossLabel: "₹ 34,300",
          deductions: 2100,
          deductionsLabel: "₹ 2,100",
          netPay: 32200,
          netLabel: "₹ 32,200",
          payDate: "16 Sep 2026",
          status: "Disbursed",
          account: "HDFC Bank •••• 4912",
        },
        {
          workerName: "Ramesh Kumar (Worker)",
          trade: "Masons & Structural",
          slipId: "PAY-2026-742",
          period: "16 Aug – 31 Aug 2026",
          regularHours: 88,
          otHours: 16,
          hourlyRate: 350,
          rateLabel: "₹350/hr",
          grossPay: 39200,
          grossLabel: "₹ 39,200",
          deductions: 2400,
          deductionsLabel: "₹ 2,400",
          netPay: 36800,
          netLabel: "₹ 36,800",
          payDate: "01 Sep 2026",
          status: "Disbursed",
          account: "HDFC Bank •••• 4912",
        },
        {
          workerName: "Ramesh Kumar (Worker)",
          trade: "Masons & Structural",
          slipId: "PAY-2026-619",
          period: "01 Aug – 15 Aug 2026",
          regularHours: 80,
          otHours: 8,
          hourlyRate: 350,
          rateLabel: "₹350/hr",
          grossPay: 32200,
          grossLabel: "₹ 32,200",
          deductions: 1950,
          deductionsLabel: "₹ 1,950",
          netPay: 30250,
          netLabel: "₹ 30,250",
          payDate: "16 Aug 2026",
          status: "Disbursed",
          account: "HDFC Bank •••• 4912",
        },
      ]);
    }
  } catch (err) {
    console.error("Seed data error:", err.message);
  }
};

module.exports = seedInitialData;
