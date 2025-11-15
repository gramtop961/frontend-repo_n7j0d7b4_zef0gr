import { ShoppingCart } from 'lucide-react'

export default function ProductCard({ product, onAdd }) {
  const price = product.price?.toFixed ? product.price.toFixed(2) : product.price
  const compare = product.compare_at_price
  return (
    <div className="group bg-white rounded-xl shadow-sm hover:shadow-md transition overflow-hidden border border-gray-100">
      <div className="aspect-square bg-gray-50 overflow-hidden">
        <img
          src={product.images?.[0] || 'https://via.placeholder.com/600x600?text=Product'}
          alt={product.title}
          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
          loading="lazy"
        />
      </div>
      <div className="p-4">
        <h3 className="font-medium text-gray-900 line-clamp-1">{product.title}</h3>
        <p className="text-sm text-gray-500 line-clamp-2 h-10">{product.description}</p>
        <div className="mt-2 flex items-center gap-2">
          <span className="text-lg font-semibold text-gray-900">${price}</span>
          {compare && (
            <span className="text-sm text-gray-400 line-through">${compare.toFixed(2)}</span>
          )}
        </div>
        <button
          onClick={() => onAdd(product)}
          className="mt-3 w-full inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2.5 rounded-lg transition"
        >
          <ShoppingCart size={18} /> Add to cart
        </button>
      </div>
    </div>
  )
}
