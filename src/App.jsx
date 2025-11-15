import { useEffect, useMemo, useState } from 'react'
import ProductCard from './components/ProductCard'

function App() {
  const baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'
  const [categories, setCategories] = useState([])
  const [products, setProducts] = useState([])
  const [activeCat, setActiveCat] = useState('')
  const [q, setQ] = useState('')
  const [cart, setCart] = useState({ items: [], subtotal: 0 })
  const [sessionId] = useState(() => {
    const existing = localStorage.getItem('session_id')
    if (existing) return existing
    const id = crypto.randomUUID()
    localStorage.setItem('session_id', id)
    return id
  })

  useEffect(() => {
    fetch(`${baseUrl}/categories`).then(r => r.json()).then(setCategories).catch(() => setCategories([]))
  }, [baseUrl])

  useEffect(() => {
    const params = new URLSearchParams()
    if (activeCat) params.set('category', activeCat)
    if (q) params.set('q', q)
    fetch(`${baseUrl}/products?${params.toString()}`)
      .then(r => r.json())
      .then(setProducts)
      .catch(() => setProducts([]))
  }, [baseUrl, activeCat, q])

  useEffect(() => {
    fetch(`${baseUrl}/cart/${sessionId}`).then(r => r.json()).then(setCart).catch(() => {})
  }, [baseUrl, sessionId])

  const onAdd = async (p) => {
    const existing = cart.items.find(i => i.product_id === p._id)
    const items = existing
      ? cart.items.map(i => i.product_id === p._id ? { ...i, quantity: i.quantity + 1 } : i)
      : [...cart.items, { product_id: p._id, title: p.title, price: p.price, quantity: 1, image: p.images?.[0] }]
    const payload = { session_id: sessionId, items }
    const res = await fetch(`${baseUrl}/cart`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    const data = await res.json()
    setCart({ ...payload, subtotal: data.subtotal })
  }

  const onQty = async (id, qty) => {
    const items = cart.items.map(i => i.product_id === id ? { ...i, quantity: Math.max(1, qty) } : i)
    const payload = { session_id: sessionId, items }
    const res = await fetch(`${baseUrl}/cart`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    const data = await res.json()
    setCart({ ...payload, subtotal: data.subtotal })
  }

  const onRemove = async (id) => {
    const items = cart.items.filter(i => i.product_id !== id)
    const payload = { session_id: sessionId, items }
    const res = await fetch(`${baseUrl}/cart`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    const data = await res.json()
    setCart({ ...payload, subtotal: data.subtotal })
  }

  const checkout = async () => {
    const customer = {
      name: 'Guest User',
      email: 'guest@example.com',
      address_line1: '123 Main St', city: 'Springfield', state: 'CA', postal_code: '90001', country: 'US'
    }
    const res = await fetch(`${baseUrl}/checkout`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ session_id: sessionId, customer }) })
    const data = await res.json()
    alert(data?.order_id ? `Order placed! ID: ${data.order_id}` : `Checkout failed: ${data.detail || 'Unknown error'}`)
    if (data?.order_id) setCart({ items: [], subtotal: 0 })
  }

  const totalQty = useMemo(() => cart.items.reduce((s, i) => s + i.quantity, 0), [cart])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Flames Department Store</h1>
          <div className="flex items-center gap-3">
            <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search products" className="hidden sm:block px-3 py-2 border rounded-lg text-sm" />
            <button className="relative px-3 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg">
              Cart
              {totalQty > 0 && (
                <span className="absolute -top-1 -right-1 text-xs bg-red-600 text-white rounded-full px-1.5">{totalQty}</span>
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-1 md:grid-cols-4 gap-6">
        <aside className="md:col-span-1 space-y-2">
          <button onClick={()=>setActiveCat('')} className={`w-full text-left px-3 py-2 rounded-lg ${activeCat===''?'bg-blue-600 text-white':'hover:bg-slate-100'}`}>All Departments</button>
          {categories.map(c => (
            <button key={c._id} onClick={()=>setActiveCat(c.slug)} className={`w-full text-left px-3 py-2 rounded-lg ${activeCat===c.slug?'bg-blue-600 text-white':'hover:bg-slate-100'}`}>{c.name}</button>
          ))}
          <button onClick={async()=>{await fetch(`${baseUrl}/seed`,{method:'POST'}); location.reload()}} className="mt-4 text-xs text-slate-500 underline">Load sample data</button>
        </aside>
        <section className="md:col-span-3">
          {products.length===0 ? (
            <div className="text-center text-slate-500 py-20">No products found.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {products.map(p => (
                <ProductCard key={p._id} product={p} onAdd={onAdd} />
              ))}
            </div>
          )}
        </section>
      </main>

      <footer className="bg-white border-t border-slate-200 mt-8">
        <div className="max-w-6xl mx-auto px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-slate-600">
          <p>© {new Date().getFullYear()} Flames Department Store</p>
          <div className="flex items-center gap-4">
            <p>Items: {totalQty}</p>
            <p>Subtotal: ${cart.subtotal?.toFixed ? cart.subtotal.toFixed(2) : cart.subtotal}</p>
            <button onClick={checkout} disabled={totalQty===0} className="px-4 py-2 bg-emerald-600 text-white rounded-lg disabled:opacity-50">Checkout</button>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
