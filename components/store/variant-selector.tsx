'use client';

interface Variant {
  id: string;
  variantName: string;
  price: string | number;
  stockQuantity: number;
  attributes: Record<string, string>;
}

interface VariantSelectorProps {
  variants: Variant[];
  selectedId?: string;
  onSelect: (variant: Variant) => void;
  themeColor?: string;
}

export function VariantSelector({ variants, selectedId, onSelect, themeColor = '#2563eb' }: VariantSelectorProps) {
  if (!variants || variants.length === 0) return null;

  // Group variants by attribute type
  const attributeTypes = new Set<string>();
  variants.forEach((v) => {
    if (v.attributes && typeof v.attributes === 'object') {
      Object.keys(v.attributes).forEach((k) => attributeTypes.add(k));
    }
  });

  // If no structured attributes, show as simple list
  if (attributeTypes.size === 0) {
    return (
      <div className="space-y-2">
        <p className="text-sm font-medium text-gray-700">Options</p>
        <div className="flex flex-wrap gap-2">
          {variants.map((v) => {
            const isSelected = v.id === selectedId;
            const outOfStock = v.stockQuantity <= 0;
            return (
              <button
                key={v.id}
                onClick={() => !outOfStock && onSelect(v)}
                disabled={outOfStock}
                className="px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                style={
                  isSelected
                    ? { backgroundColor: themeColor, color: 'white', borderColor: themeColor }
                    : { borderColor: '#d1d5db', color: '#374151' }
                }
              >
                {v.variantName}
                {outOfStock && ' (Out of Stock)'}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {Array.from(attributeTypes).map((attrType) => {
        const uniqueValues = new Map<string, Variant>();
        variants.forEach((v) => {
          const val = v.attributes?.[attrType];
          if (val && !uniqueValues.has(val)) {
            uniqueValues.set(val, v);
          }
        });

        return (
          <div key={attrType} className="space-y-1.5">
            <p className="text-sm font-medium text-gray-700">{attrType}</p>
            <div className="flex flex-wrap gap-2">
              {Array.from(uniqueValues.entries()).map(([val, v]) => {
                const isSelected = v.id === selectedId;
                const outOfStock = v.stockQuantity <= 0;
                return (
                  <button
                    key={v.id}
                    onClick={() => !outOfStock && onSelect(v)}
                    disabled={outOfStock}
                    className="px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    style={
                      isSelected
                        ? { backgroundColor: themeColor, color: 'white', borderColor: themeColor }
                        : { borderColor: '#d1d5db', color: '#374151' }
                    }
                  >
                    {val}
                    {outOfStock && ' (Out of Stock)'}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
