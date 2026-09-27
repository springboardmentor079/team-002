import { useEffect, useState } from "react";
import { User, Settings, Shield, Check } from "lucide-react";
import API from "../../services/api";
import ThemeSwitcher from "../../components/common/ThemeSwitcher";

function ClientSettings() {
  const [form,setForm]=useState({name:"",email:"",currentPassword:"",newPassword:""});
  const [saved,setSaved]=useState(false); const [loading,setLoading]=useState(true); const [error,setError]=useState("");
  useEffect(()=>{API.get("/users/me").then(r=>setForm(f=>({...f,name:r.data.data.name,email:r.data.data.email}))).catch(e=>setError(e.response?.data?.message||"Failed to load profile")).finally(()=>setLoading(false));},[]);
  const submit=async e=>{e.preventDefault();setError("");try{const r=await API.put("/users/me",form); const u={...JSON.parse(localStorage.getItem("user")||sessionStorage.getItem("user")||"{}"),...r.data.user}; if(localStorage.getItem("user")) localStorage.setItem("user",JSON.stringify(u)); else sessionStorage.setItem("user",JSON.stringify(u)); setForm(f=>({...f,currentPassword:"",newPassword:""}));setSaved(true);setTimeout(()=>setSaved(false),2500);}catch(e){setError(e.response?.data?.message||"Failed to save changes");}};
  return <><div className="welcome-section"><div><h1>Client Portal Preferences ⚙️</h1><p>Manage your profile, password and visual preferences. Changes are saved in MongoDB.</p></div></div>
    <div style={{display:"flex",flexDirection:"column",gap:20,maxWidth:680}}>
      <div className="dashboard-card"><div className="card-header"><div style={{display:"flex",alignItems:"center",gap:8}}><User size={18} color="#d97706"/><h3>Client Profile</h3></div><span className="status-pill good">Verified Client</span></div>
      {loading?<p>Loading profile...</p>:<form onSubmit={submit} style={{display:"flex",flexDirection:"column",gap:12}}>
        <label>Contact Name<input required value={form.name} onChange={e=>setForm({...form,name:e.target.value})} style={input}/></label>
        <label>Email<input required type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} style={input}/></label>
        <div style={{borderTop:"1px solid #f1f5f9",paddingTop:12}}><strong style={{fontSize:12}}>Change Password</strong></div>
        <label>Current Password<input type="password" value={form.currentPassword} onChange={e=>setForm({...form,currentPassword:e.target.value})} style={input}/></label>
        <label>New Password<input type="password" minLength="6" value={form.newPassword} onChange={e=>setForm({...form,newPassword:e.target.value})} style={input}/></label>
        {error&&<div style={{color:"#dc2626",fontSize:12}}>{error}</div>}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>{saved&&<span style={{color:"#059669",fontSize:12,display:"flex",gap:4}}><Check size={14}/> Saved to MongoDB</span>}<button className="date-button" style={{background:"#d97706",color:"#fff",border:"none",marginLeft:"auto"}}>Save Changes</button></div>
      </form>}</div>
      <div className="dashboard-card"><div className="card-header"><div style={{display:"flex",alignItems:"center",gap:8}}><Settings size={18} color="#3b82f6"/><h3>Visual Theme</h3></div></div><ThemeSwitcher/></div>
      <div className="dashboard-card"><div className="card-header"><div style={{display:"flex",alignItems:"center",gap:8}}><Shield size={18} color="#10b981"/><h3>Account Security</h3></div></div><p style={{fontSize:12,color:"#64748b"}}>Your profile and password are protected by JWT authentication and server-side password hashing.</p></div>
    </div></>;
}
const input={width:"100%",display:"block",marginTop:4,padding:"8px 12px",border:"1px solid #e2e8f0",borderRadius:6,fontSize:12,boxSizing:"border-box"};
export default ClientSettings;
