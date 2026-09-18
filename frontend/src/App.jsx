import { useState, useEffect } from "react"
import axios from "axios"
const API = "https://rfq-marketplace-rdnv.onrender.com"

function App() {
  const [token, setToken] = useState(localStorage.getItem("token") || "")
  const [role, setRole] = useState(localStorage.getItem("role") || "")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [rfqs, setRfqs] = useState([])
  const [myRfqs, setMyRfqs] = useState([])
  const [quotes, setQuotes] = useState({})
  const [myQuotes, setMyQuotes] = useState([])
  const [view, setView] = useState("browse")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [search, setSearch] = useState("")
  const [form, setForm] = useState({product_name:"", quantity:"", delivery_location:"", deadline:"", description:""})
  const headers = { Authorization: `Bearer ${token}` }

  const login = async () => {
    try {
      setLoading(true); setError("")
      const res = await axios.post(`${API}/login?email=${email}&password=${password}`)
      localStorage.setItem("token", res.data.access_token)
      localStorage.setItem("role", res.data.role)
      setToken(res.data.access_token); setRole(res.data.role)
    } catch(e){ setError(e.response?.data?.detail || "Login failed") } 
    finally{ setLoading(false) }
  }

  const fetchAll = async () => {
    setLoading(true)
    try{
      if(role==="BUYER"){
        const r = await axios.get(`${API}/rfq/my?token=${token}`, {headers})
        setMyRfqs(r.data)
      } else {
        const r = await axios.get(`${API}/rfq/list?token=${token}&search=${search}`, {headers})
        setRfqs(r.data)
      }
    } catch{ setError("Failed to load") } 
    finally{ setLoading(false) }
  }

  useEffect(()=>{ if(token) fetchAll() }, [token, role])

  const createRfq = async () => {
    if(!form.product_name || !form.quantity) return setError("Product name & Quantity required")
    try{
      await axios.post(`${API}/rfq/create?token=${token}`, null, {params: {...form, quantity: parseInt(form.quantity)}, headers})
      setForm({product_name:"", quantity:"", delivery_location:"", deadline:"", description:""}); fetchAll()
    } catch(e){ setError(e.response?.data?.detail) }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 max-w-5xl mx-auto">
      {!token ? (
        <div className="bg-white p-6 rounded-xl shadow max-w-md mx-auto mt-20">
          <h1 className="text-2xl font-bold mb-4">RFQ Marketplace</h1>
          {error && <div className="bg-red-100 text-red-700 p-2 rounded mb-2 text-sm">{error}</div>}
          <input className="w-full border p-2 rounded mb-2" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
          <input className="w-full border p-2 rounded mb-3" placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
          <button onClick={login} className="w-full bg-black text-white p-2 rounded font-semibold">{loading?"Loading...":"Login"}</button>
          <p className="text-xs mt-3 text-gray-500">Buyer: buyer1@gmail.com / Vendor: vendor1@gmail.com - 123456</p>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center mb-4">
            <h1 className="font-bold text-lg">{role} Dashboard</h1>
            <button onClick={()=>{localStorage.clear(); setToken("")}} className="bg-red-500 text-white px-3 py-1 rounded text-sm">Logout</button>
          </div>

          {role==="BUYER" && (
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-xl shadow">
                <h2 className="font-semibold mb-2">Create New RFQ</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <input className="border p-2 rounded" placeholder="Product Name*" value={form.product_name} onChange={e=>setForm({...form, product_name:e.target.value})} />
                  <input className="border p-2 rounded" placeholder="Quantity*" type="number" value={form.quantity} onChange={e=>setForm({...form, quantity:e.target.value})} />
                  <input className="border p-2 rounded" placeholder="Delivery Location" value={form.delivery_location} onChange={e=>setForm({...form, delivery_location:e.target.value})} />
                  <input className="border p-2 rounded" type="date" value={form.deadline} onChange={e=>setForm({...form, deadline:e.target.value})} />
                  <textarea className="col-span-1 md:col-span-2 border p-2 rounded" placeholder="Requirement Description" value={form.description} onChange={e=>setForm({...form, description:e.target.value})} />
                </div>
                <button onClick={createRfq} className="mt-3 bg-black text-white px-4 py-2 rounded w-full md:w-auto">Create RFQ</button>
              </div>

              <div className="bg-white p-4 rounded-xl shadow">
                <h3 className="font-bold mb-2">My RFQs ({myRfqs.length})</h3>
                {loading ? <p className="text-gray-500">Loading...</p> : myRfqs.length===0 ? <div className="text-gray-400 p-6 text-center border-2 border-dashed rounded">Empty - No RFQs yet. Create one above.</div> : myRfqs.map(r=>(
                  <div key={r.id} className="border p-3 rounded mb-2">
                    <div className="flex justify-between">
                      <div><b>{r.product_name}</b> - {r.quantity} pcs - {r.delivery_location}<br/><span className="text-xs text-gray-600">{r.description} | Deadline: {r.deadline}</span></div>
                      <div className="flex gap-2 items-start">
                        <button onClick={async()=>{ const res=await axios.get(`${API}/quote/rfq/${r.id}?token=${token}`,{headers}); setQuotes({...quotes, [r.id]:res.data}) }} className="bg-blue-600 text-white px-2 py-1 rounded text-xs">View Quotes</button>
                        <button onClick={async()=>{ if(confirm("Delete?")){ await axios.delete(`${API}/rfq/${r.id}?token=${token}`,{headers}); fetchAll() } }} className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs">Delete</button>
                      </div>
                    </div>
                    {quotes[r.id]?.length>0 && <div className="mt-2 bg-blue-50 p-2 rounded text-sm">{quotes[r.id].map((q,i)=><div key={i} className="border-b py-1">₹{q.price} - {q.delivery_days} days - {q.notes}</div>)}</div>}
                    {quotes[r.id]?.length===0 && <p className="text-xs text-gray-400 mt-1">No quotes yet</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {role==="VENDOR" && (
            <div className="bg-white p-4 rounded-xl shadow">
              <div className="flex flex-col md:flex-row gap-2 mb-4">
                <input className="border p-2 rounded flex-1" placeholder="Search RFQs by product name..." value={search} onChange={e=>setSearch(e.target.value)} onKeyDown={e=>e.key==="Enter" && fetchAll()} />
                <div className="flex gap-2">
                  <button onClick={()=>{setView("browse"); fetchAll()}} className={`px-4 py-2 rounded text-sm ${view==="browse"?"bg-black text-white":"bg-gray-200"}`}>Browse RFQs</button>
                  <button onClick={async()=>{ setView("myquotes"); const res=await axios.get(`${API}/quote/my?token=${token}`,{headers}); setMyQuotes(res.data) }} className={`px-4 py-2 rounded text-sm ${view==="myquotes"?"bg-black text-white":"bg-gray-200"}`}>My Quotes ({myQuotes.length})</button>
                </div>
              </div>

              {view==="browse" ? (
                loading ? <p className="text-center p-8">Loading RFQs...</p> : rfqs.length===0 ? <div className="text-gray-400 p-8 text-center border-2 border-dashed rounded">Empty - No RFQs found. Ask buyer to create one.</div> :
                rfqs.map(r=>(
                  <div key={r.id} className="border p-3 rounded mb-2 hover:shadow-sm transition">
                    <div className="flex justify-between">
                      <div><b className="text-lg">{r.product_name}</b> <span className="text-sm text-gray-500">x {r.quantity}</span><br/><span className="text-sm">{r.delivery_location} | Deadline: {r.deadline}</span><br/><span className="text-xs text-gray-600">{r.description}</span></div>
                      <button onClick={async()=>{
                        const price=prompt("Quoted Price (₹)?"); if(!price) return
                        const days=prompt("Estimated delivery days?"); const notes=prompt("Message/Notes?");
                        await axios.post(`${API}/quote/create?token=${token}&rfq_id=${r.id}&price=${price}&delivery_days=${days||5}&notes=${notes||""}`, null, {headers})
                        alert("Quote Submitted Successfully!")
                      }} className="bg-green-600 text-white px-3 py-1 rounded text-sm h-fit">Submit Quote</button>
                    </div>
                  </div>
                ))
              ) : (
                <div>{myQuotes.length===0 ? <div className="text-gray-400 p-8 text-center border-2 border-dashed rounded">You haven't submitted any quotes yet</div> : myQuotes.map((q,i)=><div key={i} className="border p-3 rounded mb-2 flex justify-between"><span>RFQ #{q.rfq_id} - ₹{q.price} - {q.delivery_days} days</span><span className="text-xs text-gray-500">{q.notes}</span></div>)}</div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}
export default App
