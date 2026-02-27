'use client';

interface CategoryTabsProps {
  categories: string[];
  selected: string;
  onSelect: (cat: string) => void;
  themeColor?: string;
}

export function CategoryTabs({ categories, selected, onSelect, themeColor = '#2563eb' }: CategoryTabsProps) {
  const all = ['All', ...categories];

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4">
      {all.map((cat) => {
        const isActive = cat === 'All' ? selected === '' : selected === cat;
        return (
          <button
            key={cat}
            onClick={() => onSelect(cat === 'All' ? '' : cat)}
            className="flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors border"
            style={
              isActive
                ? { backgroundColor: themeColor, color: 'white', borderColor: themeColor }
                : { backgroundColor: 'white', color: '#374151', borderColor: '#e5e7eb' }
            }
          >
            {cat}
          </button>
        );
      })}
    </div>
  );
}
