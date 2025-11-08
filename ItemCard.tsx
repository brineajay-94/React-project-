import React from 'react';
import type { ItemWithId } from '../types';

interface ItemCardProps {
  item: ItemWithId;
  categoryName?: string;
  searchTerm?: string;
}

const HighlightedText: React.FC<{text: string; highlight: string}> = ({ text, highlight }) => {
  if (!highlight.trim()) {
    return <span>{text}</span>;
  }
  const regex = new RegExp(`(${highlight})`, 'gi');
  const parts = text.split(regex);
  return (
    <span>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <span key={i} className="bg-yellow-400 text-gray-900 px-1 rounded">{part}</span>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </span>
  );
};

const ItemCard: React.FC<ItemCardProps> = ({ item, categoryName, searchTerm = '' }) => {
  return (
    <div className="group relative rounded-xl bg-gray-800/60 p-4 border border-gray-700 overflow-hidden transition-all duration-300 hover:border-purple-500 hover:shadow-2xl hover:shadow-purple-600/20 hover:-translate-y-2">
      <div className="absolute -top-1 -right-1 bg-gradient-to-bl from-purple-600 to-indigo-600 w-16 h-16 rounded-full opacity-0 group-hover:opacity-20 blur-2xl transition-opacity duration-500"></div>
      <img
        src={item.imageUrl}
        alt={item.title}
        loading="lazy"
        className="w-full h-48 object-cover rounded-lg mb-4 border border-gray-700 group-hover:border-purple-500/50 transition-all duration-300"
        onError={(e) => (e.currentTarget.src = 'https://picsum.photos/400/300?grayscale')}
      />
      <h3 className="text-lg font-bold truncate mb-2 text-gray-100">
        <HighlightedText text={item.title} highlight={searchTerm} />
      </h3>
      {categoryName && (
        <p className="text-xs font-medium bg-indigo-500/20 text-indigo-300 rounded-full px-2 py-1 inline-block mb-4">
          {categoryName}
        </p>
      )}
      <div className="flex justify-between items-center mt-auto">
        <a
          href={item.link}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-semibold text-center w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-2 px-4 rounded-lg shadow-md hover:shadow-lg hover:shadow-purple-500/40 transform hover:-translate-y-0.5 transition-all duration-300"
        >
          Open Link
        </a>
      </div>
    </div>
  );
};

export default ItemCard;
