import { useState, useEffect } from "react";
import { Truck, Plus, CheckCircle2, Wrench } from "lucide-react";
import API from "../../services/api";
import StatCard from "../../components/dashboard/StatCard";

function ContractorEquipment() {
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEquipment = async () => {
      try {
        const res = await API.get("/equipment");
        if (res.data?.data) {
          setEquipment(res.data.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchEquipment();
  }, []);

  return (
    <>
      <div className="welcome-section">
        <div>
          <h1>Contractor Equipment Allocation 🚜</h1>
          <p>Assigned machinery units, concrete pumps, dump trucks, and on-site tool telemetry.</p>
        </div>
      </div>

      <div className="stats-grid">
        <StatCard title="DEPLOYED UNITS" value={String(equipment.length)} change="On site" type="projects" />
        <StatCard title="CRANE UPTIME" value="0%" change="No data" type="active" />
        <StatCard title="INSPECTIONS PASSED" value="0%" change="No data" type="users" />
        <StatCard title="MAINTENANCE STATUS" value="0" change="No data" type="alerts" />
        <StatCard title="SCHEDULED DISPATCH" value="0" change="No data" type="pending" />
      </div>

      <div className="dashboard-card equipment-card" style={{ maxWidth: "800px" }}>
        <div className="card-header">
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Truck size={18} color="#3b82f6" />
            <h3>Assigned Site Machinery</h3>
          </div>
          <span style={{ fontSize: "11px", color: "#64748b" }}>Active Equipment</span>
        </div>

        {loading ? (
          <div style={{ padding: "30px", textAlign: "center" }}>Loading equipment...</div>
        ) : (
          <div className="machinery-list">
            {equipment.length === 0 ? (
              <div style={{ padding: "30px", textAlign: "center", color: "#64748b" }}>No equipment available.</div>
            ) : (
              equipment.map((item) => (
                <div className="machinery-item" key={item._id}>
                  <div className="machinery-info">
                    <strong>{item.name}</strong>
                    <span className="machinery-type">
                      {item.type} • Op: {item.operator} • Loc: {item.location}
                    </span>
                  </div>
                  <span className={`equipment-badge ${item.badge || "status-operational"}`}>{item.status}</span>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </>
  );
}

export default ContractorEquipment;
