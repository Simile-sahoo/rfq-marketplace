import { useState, useEffect } from "react"
import axios from "axios"
const API = "http://127.0.0.1:8000"

export default function App(){
  const [token, setToken] = useState(localStorage.getItem("token")||"")
  const [role, setRole] = useState(localStorage.getItem("role")||"")
  const [email, setEmail] = useState(""); const [pass, setPass] = useState("")
  const [rfqs, setRfqs] = useState([]); const [myRfqs, setMyRfqs] = useState([])
  const [quotes, setQuotes] = useState([]); const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(false); const [error, setError] = useState("")
  const [form, setForm] = useState({product_name:"", description:"", quantity:"", delivery_location:"", deadline:"2026-09-25"})

  const login = async() => {
    try{
      setLoading(true)
      const res = await axios.post(`${API}/login?email=${email}&password=${pass}`)
      localStorage.setItem("token", res.data.access_token); localStorage.setItem("role", res.data.role)
      setToken(res.data.access_token); setRole(res.data.role); setError("")
    }catch(e){ setError("Login failed") } finally{ setLoading(false) }
  }
  const fetchRfqs = async() => {
    setLoading(true)
    try{
      const res = await axios.get(`${API}/rfq/list?search=${search}&token=${token}`)
      setRfqs(res.data)
    }catch{} finally{ setLoading(false) }
  }
  const fetchMyRfqs = async() => {
    const res = await axios.get(`${API}/rfq/my?token=${token}`); setMyRfqs(res.data)
  }
  const createRfq = async() => {
    await axios.post(`${API}/rfq/create?product_name=${form.product_name}&description=${form.description}&quantity=${form.quantity}&delivery_location=${form.delivery_location}&deadline=${form.deadline}&token=${token}`)
    alert("RFQ Created"); fetchMyRfqs()
  }
  const viewQuotes = async(id) => {
    const res = await axios.get(`${API}/quote/rfq/${id}?token=${token}`); setQuotes(res.data)
  }
  const submitQuote = async(rfq_id) => {
    const p=prompt("Enter price"); if(!p) return
    await axios.post(`${API}/quote/create?rfq_id=${rfq_id}&price=${p}&delivery_days=5&notes=Best Offer&token=${token}`)
    alert("Quote Done")
  }
  useEffect(()=>{ if(token) { role==="BUYER"? fetchMyRfqs() : fetchRfqs() } }, [token, role])

  if(!token) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-6 rounded-xl w-full max-w-sm shadow">
        <h1 className="text-xl font-bold mb-4">RFQ Marketplace Login</h1>
        <input className="border w-full p-2 mb-2 rounded" placeholder="email" value={email} onChange={e=>setEmail(e.target.value)} />
        <input className="border w-full p-2 mb-2 rounded" placeholder="password" type="password" value={pass} onChange={e=>setPass(e.target.value)} />
        <button onClick={login} className="bg-black text-white w-full p-2 rounded">{loading?"Loading...":"Login"}</button>
        {error && <p className="text-red-500 mt-2 text-sm">{error}</p>}
        <p className="text-xs mt-3 text-gray-500">buyer1@gmail.com / vendor2@gmail.com - 123456</p>
      </div>
    </div>
  )
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="flex justify-between mb-4"><h1 className="font-bold">Role: {role}</h1><button onClick={()=>{localStorage.clear(); location.reload()}} className="bg-red-100 text-red-600 px-3 py-1 rounded">Logout</button></div>
      {role==="BUYER"? (
        <div>
          <div className="bg-white p-4 rounded shadow mb-4">
            <h2 className="font-bold mb-2">Create New RFQ</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <input placeholder="product_name" className="border p-2 rounded" value={form.product_name} onChange={e=>setForm({...form, product_name:e.target.value})} />
              <input placeholder="quantity" className="border p-2 rounded" value={form.quantity} onChange={e=>setForm({...form, quantity:e.target.value})} />
              <input placeholder="delivery_location" className="border p-2 rounded" value={form.delivery_location} onChange={e=>setForm({...form, delivery_location:e.target.value})} />
              <input placeholder="deadline YYYY-MM-DD" className="border p-2 rounded" value={form.deadline} onChange={e=>setForm({...form, deadline:e.target.value})} />
              <input placeholder="description" className="border p-2 rounded col-span-2" value={form.description} onChange={e=>setForm({...form, description:e.target.value})} />
            </div>
            <button onClick={createRfq} className="bg-black text-white px-4 py-2 rounded mt-3">Create RFQ</button>
          </div>
          <h2 className="font-bold mb-2">My RFQs</h2>
          {myRfqs.length===0? <p className="text-gray-500 bg-white p-4 rounded">Empty - No RFQs</p> : myRfqs.map(r=><div key={r.id} className="bg-white p-3 rounded mb-2 flex justify-between"><span><b>{r.product_name}</b> - {r.quantity} pcs - {r.delivery_location}</span><button onClick={()=>viewQuotes(r.id)} className="bg-blue-600 text-white px-3 py-1 rounded text-sm">View Quotes</button></div>)}
          {quotes.map(q=><div key={q.id} className="bg-green-50 border p-2 rounded mt-2 text-sm">Quote: ₹{q.price} - {q.delivery_days} days - {q.notes}</div>)}
        </div>
      ) : (
        <div>
          <div className="flex gap-2 mb-4"><input placeholder="Search product..." className="border p-2 rounded w-full" value={search} onChange={e=>setSearch(e.target.value)} /><button onClick={fetchRfqs} className="bg-black text-white px-4 rounded">Search</button></div>
          {loading? <p>Loading...</p> : rfqs.length===0? <p className="bg-white p-4 rounded">Empty - No RFQs found</p> : rfqs.map(r=><div key={r.id} className="bg-white p-3 rounded mb-2 flex justify-between"><div><b>{r.product_name}</b> - {r.description}<br/><small>Qty: {r.quantity} | {r.delivery_location}</small></div><button onClick={()=>submitQuote(r.id)} className="bg-green-600 text-white px-3 py-1 rounded">Quote</button></div>)}
        </div>
      )}
    </div>
  )
}