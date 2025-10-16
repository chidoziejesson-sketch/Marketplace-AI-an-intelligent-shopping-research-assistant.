import React from 'react';
import type { Product } from '../types';
import { ExternalLinkIcon } from './icons/ExternalLinkIcon';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  return (
    <div className="bg-slate-800/50 rounded-lg overflow-hidden shadow-lg border border-slate-700 hover:border-violet-500 transition-all duration-300 transform hover:-translate-y-1">
      <a href={product.productUrl} target="_blank" rel="noopener noreferrer">
        <img 
          src={product.imageUrl} 
          alt={product.name} 
          className="w-full h-48 object-cover" 
        />
      </a>
      <div className="p-4">
        <a href={product.productUrl} target="_blank" rel="noopener noreferrer" className="group inline-flex items-center">
          <h3 className="text-xl font-bold text-slate-100 group-hover:text-violet-400 transition-colors">{product.name}</h3>
          <ExternalLinkIcon />
        </a>
        <p className="text-slate-400 mt-2 text-sm h-20 overflow-hidden">{product.description}</p>
        <div className="mt-4 flex justify-between items-center">
          {/* Fix: product.price is a pre-formatted string, so render it directly. */}
          <span className="text-lg font-semibold text-violet-400">
            {product.price}
          </span>
          <span className="text-xs bg-slate-700 text-slate-300 px-2 py-1 rounded-full">
            on {product.platform}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;