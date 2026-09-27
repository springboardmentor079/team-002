import {useEffect,useState} from "react"; import {Plus,Edit2,Trash2} from "lucide-react"; import API from "../../services/api";
const empty={projectId:"",clientId:"",milestoneId:"",invoiceNumber:"",amount:"",dueDate:"",paidDate:"",status:"Due",method:"Bank Transfer",reference:"",notes:""};
const inp={width:"100%",padding:"8px 10px",border:"1px solid #e2e8f0",borderRadius:6,fontSize:12,boxSizing:"border-box"};
export default function AdminPayments(){const [rows,setRows]=useState([]),[projects,setProjects]=useState([]),[clients,setClients]=useState([]),[milestones,setMilestones]=useState([]),[form,setForm]=useState(empty),[edit,setEdit]=useState(null),[open,setOpen]=useState(false),[loading,setLoading]=useState(true);
const load=async()=>{setLoading(true);try{const [p,c,m,pay]=await Promise.all([API.get("/projects"),API.get("/users/clients"),API.get("/milestones"),API.get("/payments")]);setProjects(p.data.data||[]);setClients(c.data.data||[]);setMilestones(m.data.data||[]);setRows(pay.data.data||[]);}finally{setLoading(false)}};useEffect(()=>{load()},[]);
const filteredMilestones = milestones.filter((m) => {
  const milestoneProjectId =
    m.projectId?._id ||
    m.projectId ||
    m.project?._id ||
    m.project;

  return String(milestoneProjectId) === String(form.projectId);
});
const save=async e=>{e.preventDefault();try{if(edit)await API.put(`/payments/${edit}`,form);else await API.post("/payments",form);setOpen(false);setEdit(null);setForm(empty);load()}catch(e){alert(e.response?.data?.message||"Save failed")}};
const del=async id=>{if(confirm("Delete this payment record?")){try{await API.delete(`/payments/${id}`);load()}catch(e){alert(e.response?.data?.message||"Delete failed")}}};
const startEdit=r=>{setEdit(r._id);setForm({projectId:r.projectId?._id||r.projectId,clientId:r.clientId?._id||r.clientId,milestoneId:r.milestoneId?._id||r.milestoneId||"",invoiceNumber:r.invoiceNumber,amount:r.amount,dueDate:r.dueDate?.slice(0,10)||"",paidDate:r.paidDate?.slice(0,10)||"",status:r.status,method:r.method,reference:r.reference||"",notes:r.notes||""});setOpen(true)};
return <><div className="welcome-section"><div><h1>Payment Records 💳</h1><p>Create, edit and delete client invoices and milestone disbursements in MongoDB.</p></div><button className="date-button" style={{background:"#d97706",color:"#fff",border:"none"}} onClick={()=>{setEdit(null);setForm(empty);setOpen(true)}}><Plus size={15}/> Add Payment</button></div>
<div className="dashboard-card" style={{overflowX:"auto"}}>{loading?<p>Loading...</p>:<table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}><thead><tr>{["Invoice","Project","Client","Amount","Status","Due","Actions"].map(x=><th key={x} style={{textAlign:"left",padding:10,borderBottom:"1px solid #e2e8f0"}}>{x}</th>)}</tr></thead><tbody>{rows.map(r=><tr key={r._id}><td style={{padding:10}}>{r.invoiceNumber}</td><td style={{padding:10}}>{r.projectId?.name||"-"}</td><td style={{padding:10}}>{r.clientId?.name||"-"}</td><td style={{padding:10}}>₹ {Number(r.amount).toLocaleString("en-IN")}</td><td style={{padding:10}}><span className="status-pill">{r.status}</span></td><td style={{padding:10}}>{r.dueDate?new Date(r.dueDate).toLocaleDateString("en-IN"):"-"}</td><td style={{padding:10}}><button className="menu-item" onClick={()=>startEdit(r)}><Edit2 size={13}/> Edit</button><button className="menu-item" style={{color:"#dc2626"}} onClick={()=>del(r._id)}><Trash2 size={13}/> Delete</button></td></tr>)}</tbody></table>}</div>
{open&&<div style={overlay}><div className="dashboard-card" style={{width:700,maxWidth:"95vw",maxHeight:"90vh",overflowY:"auto"}}><h3>{edit?"Edit Payment":"Add Payment"}</h3><form onSubmit={save} style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
<label>Project<select required value={form.projectId} 
onChange={e=>setForm({
  ...form,
  projectId:e.target.value,
  milestoneId:""
})}
 style={inp}><option value="">Select project</option>{projects.map(p=><option key={p._id} value={p._id}>{p.name} ({p.code})</option>)}</select></label>
<label>Client<select required value={form.clientId} onChange={e=>setForm({...form,clientId:e.target.value})} style={inp}><option value="">Select client</option>{clients.map(c=><option key={c._id} value={c._id}>{c.name} — {c.email}</option>)}</select></label>
<label>
  Milestone
  <select
    value={form.milestoneId}
    onChange={e=>setForm({...form,milestoneId:e.target.value})}
    style={inp}
    disabled={!form.projectId}
  >
    <option value="">
      {form.projectId ? "None" : "Select project first"}
    </option>

    {filteredMilestones.map(m => (
      <option key={m._id} value={m._id}>
        {m.phase}
      </option>
    ))}
  </select>
</label>
<label>Invoice Number<input required value={form.invoiceNumber} onChange={e=>setForm({...form,invoiceNumber:e.target.value})} style={inp}/></label>
<label>Amount (₹)<input required type="number" min="0" value={form.amount} onChange={e=>setForm({...form,amount:e.target.value})} style={inp}/></label>
<label>Status<select value={form.status} onChange={e=>setForm({...form,status:e.target.value})} style={inp}>{["Due","Paid","Partially Paid","Overdue","Cancelled"].map(x=><option key={x}>{x}</option>)}</select></label>
<label>Due Date<input type="date" value={form.dueDate} onChange={e=>setForm({...form,dueDate:e.target.value})} style={inp}/></label><label>Paid Date<input type="date" value={form.paidDate} onChange={e=>setForm({...form,paidDate:e.target.value})} style={inp}/></label>
<label>Payment Method<select value={form.method} onChange={e=>setForm({...form,method:e.target.value})} style={inp}>{["Bank Transfer","UPI","Cheque","Cash","Card","Other"].map(x=><option key={x}>{x}</option>)}</select></label><label>Reference<input value={form.reference} onChange={e=>setForm({...form,reference:e.target.value})} style={inp}/></label>
<label style={{gridColumn:"1/-1"}}>Notes<textarea value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} style={{...inp,minHeight:60}}/></label><div style={{gridColumn:"1/-1",display:"flex",justifyContent:"flex-end",gap:8}}><button type="button" className="date-button" onClick={()=>setOpen(false)}>Cancel</button><button className="date-button" style={{background:"#d97706",color:"#fff",border:"none"}}>Save</button></div></form></div></div>}</>}
const overlay={position:"fixed",inset:0,background:"rgba(15,23,42,.45)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000};
