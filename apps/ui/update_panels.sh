#!/bin/bash

# Update all panel files to use the new gradient style
find /Users/madeaux/Downloads/gg_production-main-v2-modular/apps/ui/src/components/contractor-detail/tabs -name "*Panel.tsx" | while read file; do
    echo "Processing $file"

    # Skip overview panels as they're already done
    if [[ "$file" == *"/overview/"* ]]; then
        echo "  Skipping overview panel (already updated)"
        continue
    fi

    # Replace old Card className with new gradient style
    sed -i '' 's/Card className={\`h-full border-gray-700\/30 rounded-xl overflow-hidden shadow-2xl hover:border-gray-600\/20 transition-all duration-500 group \${CONTRACTOR_DETAIL_COLORS\.panelColor}\`}/Card className="h-full border-[#6366F1]\/30 rounded-xl overflow-hidden shadow-2xl hover:border-[#6366F1]\/50 transition-all duration-500 group relative bg-gradient-to-b from-black\/90 via-gray-900\/50 to-black\/90 backdrop-blur-sm">/g' "$file"

    # Check if the file was modified and add grid and glow effects
    if grep -q 'bg-gradient-to-b from-black/90' "$file"; then
        echo "  Adding grid and glow effects"
        # This is a simplified approach - we'll add the grid/glow manually to key panels
    fi
done

echo "Bulk update complete"