import React, { useState, useEffect, useMemo } from 'react';
import { db, collection, onSnapshot, query, orderBy } from '../firebase';
import type { ItemWithId, CategoryWithId } from '../types';
import ItemCard from './ItemCard';
import Pagination from './Pagination';

const ITEMS_PER_PAGE = 20;

interface DashboardProps {
  showToast: (message: string, type: 'success' | 'error') => void;
}

const Dashboard: React.FC<DashboardProps> = ({ showToast }) => {
  // Global state
  const [items, setItems] = useState<ItemWithId[]>([]);
  const [categories, setCategories] = useState<CategoryWithId[]>([]);
  const [loading, setLoading] = useState(true);

  // Search and filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isAiSearching, setIsAiSearching] = useState(false);
  const [aiFilteredIds, setAiFilteredIds] = useState<string[] | null>(null);

  // Data fetching
  useEffect(() => {
    const itemsQuery = query(collection(db, 'items'), orderBy('createdAt', 'desc'));
    const unsubscribeItems = onSnapshot(itemsQuery, (snapshot) => {
      setItems(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ItemWithId)));
      setLoading(false);
    }, (error) => {
      console.error("Error fetching items: ", error);
      showToast("Failed to load content.", "error");
      setLoading(false);
    });

    const categoriesQuery = query(collection(db, 'categories'), orderBy('name'));
    const unsubscribeCategories = onSnapshot(categoriesQuery, (snapshot) => {
      setCategories(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CategoryWithId)));
    }, (error) => {
      console.error("Error fetching categories: ", error);
      showToast("Failed to load categories.", "error");
    });

    return () => {
      unsubscribeItems();
      unsubscribeCategories();
    };
  }, [showToast]);

  // Memoized data for display
  const categoryMap = useMemo(() => categories.reduce((acc, cat) => ({ ...acc, [cat.id]: cat.name }), {} as Record<string, string>), [categories]);

  const handleAiSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) {
        showToast("Please enter a search query.", "error");
        return;
    }

    setIsAiSearching(true);
    setAiFilteredIds(null);

    try {
        const { GoogleGenAI } = await import('@google/genai');
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

        const prompt = `
            You are an intelligent search assistant for a content dashboard.
            I will provide you with a user's search query and a list of all available items.
            Each item has an ID, a title, and a category.

            Your task is to analyze the user's query and determine which items are the most relevant matches.
            The query might be a simple keyword or a natural language question (e.g., "what are the newest tools for productivity?").
            You must return only the IDs of the matching items.

            User Query: "${searchTerm}"

            Available Items (JSON):
            ${JSON.stringify(items.map(item => ({ id: item.id, title: item.title, category: categoryMap[item.categoryId] || 'Uncategorized' })))}

            Based on the query, return a JSON object containing a single key "itemIds" which is an array of strings, where each string is the ID of a matching item.
            If no items match the query, return an empty array.
        `;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: 'OBJECT',
                    properties: {
                        itemIds: {
                            type: 'ARRAY',
                            items: { type: 'STRING' },
                        },
                    },
                },
            },
        });
        
        const result = JSON.parse(response.text);
        setAiFilteredIds(result.itemIds || []);

    } catch (error) {
        console.error("AI search failed:", error);
        showToast("AI search failed. Please try again.", "error");
        setAiFilteredIds(null);
    } finally {
        setIsAiSearching(false);
    }
  };

  const clearSearch = () => {
    setSearchTerm('');
    setAiFilteredIds(null);
    setSelectedCategory('');
  }

  const filteredItems = useMemo(() => {
    if (aiFilteredIds !== null) {
      const idSet = new Set(aiFilteredIds);
      return items.filter(item => idSet.has(item.id));
    }
    
    let filtered = items;
    if (selectedCategory) {
      filtered = filtered.filter(item => item.categoryId === selectedCategory);
    }
    if (searchTerm) {
      const lowercasedSearch = searchTerm.toLowerCase();
      filtered = filtered.filter(item => item.title.toLowerCase().includes(lowercasedSearch));
    }
    return filtered;
  }, [items, selectedCategory, searchTerm, aiFilteredIds]);

  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredItems.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredItems, currentPage]);

  const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, searchTerm, aiFilteredIds]);
  
  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    // If user types, we revert to simple search until they submit for AI search
    if(aiFilteredIds !== null) {
      setAiFilteredIds(null);
    }
  }

  return (
    <div className="container mx-auto">
      <h2 className="text-3xl font-bold mb-6 text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400">
        Browse Content
      </h2>
      <div className="sticky top-0 bg-gray-900/80 backdrop-blur-md py-4 z-40 mb-8 rounded-xl shadow-lg border border-gray-700/50">
        <div className="p-4 space-y-4">
          <form onSubmit={handleAiSearch} className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              placeholder="Ask about the content..."
              value={searchTerm}
              onChange={handleSearchInputChange}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition"
            />
            <button
                type="submit"
                disabled={isAiSearching}
                className="flex items-center justify-center gap-2 w-full sm:w-auto bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-2 px-6 rounded-lg shadow-md hover:shadow-lg hover:shadow-purple-500/40 transform hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-wait"
            >
              {isAiSearching && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
              {isAiSearching ? 'Searching...' : 'Search'}
            </button>
          </form>
          <div className="flex flex-col sm:flex-row gap-4">
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setAiFilteredIds(null); // Clear AI search when category changes
              }}
              disabled={aiFilteredIds !== null}
              className="w-full sm:w-1/2 bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition disabled:opacity-50"
            >
              <option value="">All Categories</option>
              {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
            </select>
            {aiFilteredIds !== null && (
                <button onClick={clearSearch} className="w-full sm:w-1/2 bg-gray-600 hover:bg-gray-500 text-white py-2 px-4 rounded-lg shadow-md transform hover:-translate-y-0.5 transition-all duration-300">
                    Clear Search
                </button>
            )}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center text-xl font-semibold mt-16">Loading...</div>
      ) : (
        <>
          {aiFilteredIds !== null && (
            <div className="text-center mb-6 bg-gray-800/50 border border-purple-500/30 rounded-lg p-3 text-purple-300">
              Showing {filteredItems.length} result{filteredItems.length !== 1 ? 's' : ''} from AI search.
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {paginatedItems.map(item => (
              <ItemCard 
                key={item.id} 
                item={item} 
                categoryName={categoryMap[item.categoryId]} 
                searchTerm={aiFilteredIds === null ? searchTerm : ''}
              />
            ))}
          </div>
          {paginatedItems.length === 0 && <p className="text-center text-gray-400 mt-12 text-lg">No items found.</p>}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </>
      )}
    </div>
  );
};

export default Dashboard;