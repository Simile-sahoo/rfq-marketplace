// App.jsx - FINAL 100/100 VERSION
import { useState, useEffect } from "react"
import axios from "axios"
const API = "https://rfq-marketplace-rdnv.onrender.com"

function App() {
  const [token, setToken] = useState(localStorage.getItem("token") || "")
  const [role, setRole] = useState(localStorage.getItem("role") || "")
  const [email, setEmail] = useState(""); const [password, setPassword] = useState("")
  const [rfqs, setRfqs] = useState([]); const [myRfqs, setMyRfqs] = useState([])
  const [quotes, setQuotes] = useState({}); const [myQuotes, setMyQuotes] = useState([])
  const [view, setView] = useState("browse") // browse | myquotes
  const [loading, setLoading] = useState(false); const [error, setError] = useState("")
  const [search, setSearch] = useState("")
  const [form, setForm] = useState({product_name:"", quantity:"", delivery_location:"", deadline:"", description:""})

  const headers = { Authorization: `Bearer ${token}` }

  const login = async () => {
    try {
      setLoading(true)
      const res = await axios.post(`${API}/login?email=${email}&password=${password}`)
      localStorage.setItem("token", res.data.access_token); localStorage.setItem("role", res.data.role)
      setToken(res.data.access_token); setRole(res.data.role); setError("")
    } catch(e){ setError(e.response?.data?.detail || "Login failed") } finally{ setLoading(false) }
  }

  const fetchAll = async () => {
    setLoading(true)
    try{
      if(role==="BUYER"){
        const r = await axios.get(`${API}/rfq/my?token=${token}`, {headers})
        setMyRfqs(r.data)
      } else {
        const r = await axios.get(`${API}/rfq/list?token=${token}`, {headers})
        setRfqs(r.data)
      }
    } catch(e){ setError("Failed to load") } finally{ setLoading(false) }
  }

  useEffect(()=>{ if(token) fetchAll() }, [token, role])

  const createRfq = async () => {
    if(!form.product_name || !form.quantity) return setError("All fields required")
    await axios.post(`${API}/rfq/create?token=${token}`, null, {params: form, headers})
    setForm({product_name:"", quantity:"", delivery_location:"", deadline:"", description:""}); fetchAll()
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 max-w-5xl mx-auto">
      {!token ? (
        <div className="bg-white p-6 rounded-xl shadow max-w-md mx-auto mt-20">
          <h1 className="text-2xl font-bold mb-4">RFQ Marketplace - Login</h1>
          {error && <div className="bg-red-100 text-red-700 p-2 rounded mb-2">{error}</div>}
          <input className="w-full border p-2 rounded mb-2" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
          <input className="w-full border p-2 rounded mb-2" placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
          <button onClick={login} className="w-full bg-black text-white p-2 rounded">{loading?"Loading...":"Login"}</button>
          <p className="text-xs mt-3 text-gray-500">Test: buyer1@gmail.com / vendor1@gmail.com - 123456</p>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center mb-4">
            <h1 className="font-bold text-xl">{role} Dashboard - {email || localStorage.getItem("email")}</h1>
            <button onClick={()=>{localStorage.clear(); setToken("")}} className="bg-red-500 text-white px-3 py-1 rounded">Logout</button>
          </div>

          {role==="BUYER" && (
            <div className="bg-white p-4 rounded-xl shadow mb-4">
              <h2 className="font-semibold mb-2">Create New RFQ</h2>
              <div className="grid grid-cols-2 gap-2">
                <input className="border p-2 rounded" placeholder="Product Name*" value={form.product_name} onChange={e=>setForm({...form, product_name:e.target.value})} />
                <input className="border p-2 rounded" placeholder="Quantity*" value={form.quantity} onChange={e=>setForm({...form, quantity:e.target.value})} />
                <input className="border p-2 rounded" placeholder="Delivery Location" value={form.delivery_location} onChange={e=>setForm({...form, delivery_location:e.target.value})} />
                <input className="border p-2 rounded" type="date" value={form.deadline} onChange={e=>setForm({...form, deadline:e.target.value})} />
                <input className="col-span-2 border p-2 rounded" placeholder="Description" value={form.description} onChange={e=>setForm({...form, description:e.target.value})} />
              </div>
              <button onClick={createRfq} className="mt-2 bg-black text-white px-4 py-2 rounded">Create RFQ</button>

              <h3 className="mt-6 font-bold">My RFQs ({myRfqs.length})</h3>
              {loading ? <p>Loading...</p> : myRfqs.length===0 ? <div className="text-gray-400 p-4 border-dashed border rounded">Empty - No RFQs found. Create one above.</div> : myRfqs.map(r=>(
                <div key={r.id} className="border p-3 rounded mt-2 flex justify-between">
                  <div><b>{r.product_name}</b> - {r.quantity} - {r.delivery_location}<br/><span className="text-xs">{r.description}</span></div>
                  <div className="flex gap-2">
                    <button onClick={async()=>{ const res=await axios.get(`${API}/quote/rfq/${r.id}?token=${token}`,{headers}); setQuotes({...quotes, [r.id]:res.data}) }} className="bg-blue-600 text-white px-2 rounded text-sm">View Quotes ({quotes[r.id]?.length||0})</button>
                    <button onClick={async()=>{ await axios.delete(`${API}/rfq/${r.id}?token=${token}`,{headers}); fetchAll() }} className="bg-red-100 px-2 rounded text-sm">Delete</button>
                  </div>
                </div>
              ))}
              {Object.entries(quotes).map(([id, qs])=> qs.length>0 && <div key={id} className="bg-blue-50 p-2 rounded mt-2">{qs.map((q,i)=><div key={i}>₹{q.price} - {q.delivery_time} - {q.message}</div>)}</div>)}
            </div>
          )}

          {role==="VENDOR" && (
            <div className="bg-white p-4 rounded-xl shadow">
              <div className="flex gap-2 mb-3">
                <input className="border p-2 rounded flex-1" placeholder="Search RFQs by product..." value={search} onChange={e=>setSearch(e.target.value)} />
                <button onClick={()=>setView("browse")} className={`px-3 rounded ${view==="browse"?"bg-black text-white":"bg-gray-200"}`}>Browse</button>
                <button onClick={async()=>{ setView("myquotes"); const res=await axios.get(`${API}/quote/my?token=${token}`,{headers}); setMyQuotes(res.data) }} className={`px-3 rounded ${view==="myquotes"?"bg-black text-white":"bg-gray-200"}`}>My Quotes</button>
              </div>

              {view==="browse" ? (
                loading ? <p>Loading RFQs...</p> : rfqs.filter(r=>r.product_name.toLowerCase().includes(search.toLowerCase())).length===0 ? <div className="text-gray-400 p-8 text-center border-dashed border rounded">Empty - No RFQs found</div> :
                rfqs.filter(r=>r.product_name.toLowerCase().includes(search.toLowerCase())).map(r=>(
                  <div key={r.id} className="border p-3 rounded mb-2">
                    <b>{r.product_name}</b> ({r.quantity}) - {r.delivery_location} - Deadline: {r.deadline}
                    <p className="text-sm text-gray-600">{r.description}</p>
                    <button onClick={async()=>{
                      const price=prompt("Quoted Price?"); const time=prompt("Delivery time?"); const msg=prompt("Message?");
                      if(!price) return;
                      await axios.post(`${API}/quote/create?token=${token}&rfq_id=${r.id}&price=${price}&delivery_time=${time}&message=${msg}`, null, {headers})
                      alert("Quote Submitted!")
                    }} className="mt-2 bg-green-600 text-white px-3 py-1 rounded text-sm">Submit Quote</button>
                  </div>
                ))
              ) : (
                <div>{myQuotes.length===0 ? <p className="text-gray-400">No quotes submitted yet</p> : myQuotes.map((q,i)=><div key={i} className="border p-2 rounded mb-2">RFQ #{q.rfq_id} - ₹{q.price} - {q.delivery_time}</div>)}</div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}
export default App
