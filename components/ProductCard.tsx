import React from 'react';
import type { Product } from '../types';
import { ExternalLinkIcon } from './icons/ExternalLinkIcon';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const getImageSourceDomain = (url: string): string => {
    try {
      const hostname = new URL(url).hostname;
      return hostname.replace(/^www\./, '');
    } catch (e) {
      console.error("Invalid image URL:", url);
      return product.platform; // Fallback to the platform name
    }
  };
  
  const imageSource = getImageSourceDomain(product.imageUrl);

  return (
    <div className="bg-slate-800/50 rounded-lg overflow-hidden shadow-lg border border-slate-700 hover:border-violet-500/50 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl hover:shadow-violet-500/20">
      <div className="relative">
        <a href={product.productUrl} target="_blank" rel="noopener noreferrer">
          <img 
            src={product.imageUrl} 
            alt={product.name} 
            className="w-full h-48 object-cover" 
          />
        </a>
        <div className="absolute bottom-0 left-0 right-0 px-2 py-1 bg-black/60 backdrop-blur-sm">
            <p className="text-xs text-slate-300 truncate">
              Image from: <span className="font-semibold">{imageSource}</span>
            </p>
        </div>
      </div>
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