import { useState, useEffect, useRef } from "react";
import { FileText, Plus, Download, Trash2 } from "lucide-react";
import API from "../../services/api";

function AdminDocuments() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: "",
    category: "General",
    project: "All Projects",
  });
  const [selectedFile, setSelectedFile] = useState(null);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const res = await API.get("/documents");
      if (res.data && res.data.data) {
        setDocuments(res.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch documents:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) return alert("Please select a file to upload");

    const data = new FormData();
    data.append("file", selectedFile);
    data.append("name", formData.name);
    data.append("category", formData.category);
    data.append("project", formData.project);

    try {
      setUploading(true);
      await API.post("/documents", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setShowModal(false);
      setSelectedFile(null);
      setFormData({ name: "", category: "General", project: "All Projects" });
      fetchDocuments();
    } catch (err) {
      alert(err.response?.data?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this document?")) return;
    try {
      await API.delete(`/documents/${id}`);
      fetchDocuments();
    } catch (err) {
      alert("Failed to delete document");
    }
  };

  const getFileUrl = (url) => {
    if (url.startsWith("http")) return url;
    return `http://localhost:5001${url}`;
  };

  return (
    <>
      <div className="welcome-section">
        <div>
          <h1>Document Management 📁</h1>
          <p>Centralized storage for blueprints, permits, and project files.</p>
        </div>
        <button
          className="date-button"
          style={{
            background: "#0f766e",
            color: "#ffffff",
            border: "none",
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
          onClick={() => setShowModal(true)}
        >
          <Plus size={16} /> Upload Document
        </button>
      </div>

      <div className="dashboard-card" style={{ padding: "0" }}>
        <table className="proc-table" style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f8fafc", color: "#64748b", textAlign: "left", fontSize: "12px", borderBottom: "1px solid #e2e8f0" }}>
              <th style={{ padding: "12px 16px" }}>Document Name</th>
              <th style={{ padding: "12px 16px" }}>Category</th>
              <th style={{ padding: "12px 16px" }}>Project</th>
              <th style={{ padding: "12px 16px" }}>Uploaded By</th>
              <th style={{ padding: "12px 16px" }}>Date</th>
              <th style={{ padding: "12px 16px", textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" style={{ textAlign: "center", padding: "20px", color: "#94a3b8" }}>Loading...</td>
              </tr>
            ) : documents.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: "center", padding: "20px", color: "#94a3b8" }}>No documents uploaded yet.</td>
              </tr>
            ) : (
              documents.map((doc) => (
                <tr key={doc._id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                  <td style={{ padding: "12px 16px", fontWeight: 600, color: "#1e293b", display: "flex", alignItems: "center", gap: "8px" }}>
                    <FileText size={16} color="#64748b" /> {doc.name}
                  </td>
                  <td style={{ padding: "12px 16px", color: "#64748b" }}>{doc.category}</td>
                  <td style={{ padding: "12px 16px", color: "#64748b" }}>{doc.project}</td>
                  <td style={{ padding: "12px 16px", color: "#64748b" }}>{doc.uploadedBy}</td>
                  <td style={{ padding: "12px 16px", color: "#64748b" }}>{new Date(doc.createdAt).toLocaleDateString()}</td>
                  <td style={{ padding: "12px 16px", textAlign: "right" }}>
                    <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                      <a
                        href={getFileUrl(doc.fileUrl)}
                        target="_blank"
                        rel="noreferrer"
                        className="date-button"
                        style={{ padding: "4px 8px", fontSize: "11px", display: "inline-flex", alignItems: "center", gap: "4px" }}
                      >
                        <Download size={14} /> Download
                      </a>
                      <button
                        onClick={() => handleDelete(doc._id)}
                        className="date-button"
                        style={{ padding: "4px 8px", fontSize: "11px", display: "inline-flex", alignItems: "center", gap: "4px", background: "#fef2f2", color: "#ef4444", border: "1px solid #fecaca" }}
                      >
                        <Trash2 size={14} /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(15, 23, 42, 0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div className="dashboard-card" style={{ width: "400px" }}>
            <h3 style={{ margin: "0 0 16px" }}>Upload Document</h3>
            <form onSubmit={handleUpload} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div>
                <label style={{ fontSize: "11px", color: "#64748b" }}>File (PDF/Image)</label>
                <input
                  type="file"
                  required
                  ref={fileInputRef}
                  onChange={(e) => setSelectedFile(e.target.files[0])}
                  accept=".pdf,image/*"
                  style={{ width: "100%", padding: "8px", border: "1px solid #e2e8f0", borderRadius: "6px" }}
                />
              </div>
              <div>
                <label style={{ fontSize: "11px", color: "#64748b" }}>Document Name</label>
                <input
                  type="text"
                  placeholder="Leave empty to use filename"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={{ width: "100%", padding: "8px", border: "1px solid #e2e8f0", borderRadius: "6px" }}
                />
              </div>
              <div>
                <label style={{ fontSize: "11px", color: "#64748b" }}>Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  style={{ width: "100%", padding: "8px", border: "1px solid #e2e8f0", borderRadius: "6px" }}
                >
                  <option value="General">General</option>
                  <option value="Blueprint">Blueprint</option>
                  <option value="Permit">Permit</option>
                  <option value="Invoice">Invoice</option>
                  <option value="Report">Report</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: "11px", color: "#64748b" }}>Project</label>
                <input
                  type="text"
                  placeholder="e.g. City Mall"
                  value={formData.project}
                  onChange={(e) => setFormData({ ...formData, project: e.target.value })}
                  style={{ width: "100%", padding: "8px", border: "1px solid #e2e8f0", borderRadius: "6px" }}
                />
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "8px" }}>
                <button type="button" className="date-button" onClick={() => setShowModal(false)} disabled={uploading}>
                  Cancel
                </button>
                <button type="submit" className="date-button" style={{ background: "#d97706", color: "#ffffff", border: "none" }} disabled={uploading}>
                  {uploading ? "Uploading..." : "Upload"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default AdminDocuments;
