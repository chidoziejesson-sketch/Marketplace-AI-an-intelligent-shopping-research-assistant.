
import React from 'react';
import type { Product } from '../types';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  return (
    <div className="bg-gray-800/50 rounded-lg overflow-hidden shadow-lg border border-gray-700 hover:border-purple-500 transition-all duration-300 transform hover:-translate-y-1">
      <img 
        src={product.imageUrl} 
        alt={product.name} 
        className="w-full h-48 object-cover" 
      />
      <div className="p-4">
        <h3 className="text-xl font-bold text-gray-100">{product.name}</h3>
        <p className="text-gray-400 mt-2 text-sm h-20 overflow-hidden">{product.description}</p>
        <div className="mt-4 flex justify-between items-center">
          <span className="text-lg font-semibold text-purple-400">
            ${product.price.toFixed(2)}
          </span>
          <span className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded-full">
            on {product.platform}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
