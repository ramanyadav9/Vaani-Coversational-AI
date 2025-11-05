# Pagination Component

A beautiful, accessible pagination component designed for the Virtual Galaxy conversational AI dashboard. Features glassmorphism design, smooth animations, and comprehensive keyboard navigation.

## Features

- **Smart Page Navigation**: Automatically handles ellipsis for large page counts
- **Items Per Page Selector**: Configurable page size options
- **Item Count Display**: Shows "X-Y of Z items" range
- **Responsive Design**: Mobile-friendly with adaptive button sizes
- **Smooth Animations**: Framer Motion powered transitions
- **Fully Accessible**: ARIA labels, keyboard navigation, focus management
- **Empty State Handling**: Gracefully handles zero items
- **Glassmorphism Theme**: Matches galaxy/space design system

## Basic Usage

```tsx
import { useState } from 'react';
import { Pagination } from './components/common/Pagination';

function MyComponent() {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);

  const totalItems = 247;

  return (
    <div>
      {/* Your content here */}

      <Pagination
        currentPage={currentPage}
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
        onItemsPerPageChange={setItemsPerPage}
        itemLabel="conversations"
      />
    </div>
  );
}
```

## Props API

### Required Props

| Prop | Type | Description |
|------|------|-------------|
| `currentPage` | `number` | Current active page (1-indexed) |
| `totalItems` | `number` | Total number of items across all pages |
| `itemsPerPage` | `number` | Number of items to display per page |
| `onPageChange` | `(page: number) => void` | Callback fired when page changes |
| `onItemsPerPageChange` | `(itemsPerPage: number) => void` | Callback fired when items per page changes |

### Optional Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `pageSizeOptions` | `number[]` | `[10, 25, 50, 100]` | Available page size options |
| `itemLabel` | `string` | `"items"` | Label for items being paginated |

## Examples

### With Conversations

```tsx
<Pagination
  currentPage={page}
  totalItems={247}
  itemsPerPage={25}
  onPageChange={setPage}
  onItemsPerPageChange={setPageSize}
  itemLabel="conversations"
/>
```

### With Custom Page Sizes

```tsx
<Pagination
  currentPage={page}
  totalItems={156}
  itemsPerPage={12}
  onPageChange={setPage}
  onItemsPerPageChange={setPageSize}
  pageSizeOptions={[12, 24, 48, 96]} // Grid-friendly numbers
  itemLabel="agents"
/>
```

### With API Integration

```tsx
function MyComponent() {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [data, setData] = useState([]);
  const [totalItems, setTotalItems] = useState(0);

  const fetchData = async (page: number, limit: number) => {
    const response = await fetch(`/api/items?page=${page}&limit=${limit}`);
    const result = await response.json();

    setData(result.items);
    setTotalItems(result.total);
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    fetchData(newPage, itemsPerPage);

    // Optional: Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleItemsPerPageChange = (newSize: number) => {
    setItemsPerPage(newSize);
    setCurrentPage(1); // Reset to first page
    fetchData(1, newSize);
  };

  return (
    <div>
      {data.map(item => <div key={item.id}>{item.name}</div>)}

      <Pagination
        currentPage={currentPage}
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
        onPageChange={handlePageChange}
        onItemsPerPageChange={handleItemsPerPageChange}
        itemLabel="items"
      />
    </div>
  );
}
```

## Pagination Logic

The component implements smart page number display:

- **7 or fewer pages**: Shows all page numbers
- **More than 7 pages**: Shows first, last, current, and 2 neighbors with ellipsis

### Examples:

- 5 pages: `[1] [2] [3] [4] [5]`
- 10 pages (page 1): `[1] [2] [3] ... [10]`
- 10 pages (page 5): `[1] ... [3] [4] [5] [6] [7] ... [10]`
- 10 pages (page 10): `[1] ... [8] [9] [10]`

## Navigation Controls

The component provides several navigation options:

- **First Page** (`<<`): Jump to page 1
- **Previous** (`<`): Go to previous page
- **Page Numbers**: Direct page selection
- **Next** (`>`): Go to next page
- **Last Page** (`>>`): Jump to last page

## Accessibility

### Keyboard Navigation

- `Tab`: Navigate between controls
- `Shift + Tab`: Navigate backwards
- `Enter` or `Space`: Activate button
- Visual focus indicators show current element

### Screen Reader Support

- ARIA labels on all buttons
- `aria-current="page"` on active page
- Descriptive labels: "Go to page X", "First page", etc.
- Item count announcement

### Motion Preferences

Respects `prefers-reduced-motion` for animations

## Styling

The component uses:

- **Glassmorphism**: `bg-white/5 backdrop-blur-lg border border-white/10`
- **Galaxy Colors**: `galaxy-400`, `galaxy-500`, `galaxy-600`
- **Hover Effects**: Scale, color, shadow transitions
- **Active States**: Highlighted with galaxy gradient
- **Disabled States**: Reduced opacity, no interaction

### CSS Classes

The component inherits these utility classes from your theme:

- `.glass`: Glassmorphism effect
- `.glass-hover`: Hover state transitions
- Focus ring styles from `index.css`

## Performance

- **Memoization**: Page numbers are memoized with `useMemo`
- **Optimized Animations**: Uses Framer Motion's optimized transforms
- **Efficient Re-renders**: Only updates when props change

## Edge Cases

The component handles:

- **Zero items**: Shows "No items found" message
- **Single page**: Hides navigation, shows only count
- **Large datasets**: Uses ellipsis for many pages
- **Disabled states**: Properly disables first/previous on page 1
- **Page size changes**: Automatically adjusts total pages

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Requires JavaScript enabled
- CSS Grid and Flexbox support
- CSS `backdrop-filter` for glassmorphism

## Dependencies

- `react`: ^19.1.1
- `framer-motion`: ^12.23.24
- `lucide-react`: ^0.548.0
- `tailwindcss`: ^3.4.1

## File Structure

```
components/common/
├── Pagination.tsx           # Main component
├── Pagination.example.tsx   # Usage examples
└── README.md               # This file
```

## Testing Checklist

When testing the pagination component:

- [ ] First page disables first/previous buttons
- [ ] Last page disables next/last buttons
- [ ] Page numbers update correctly
- [ ] Ellipsis appears for large page counts
- [ ] Items per page changes reset to page 1
- [ ] Empty state displays correctly
- [ ] Keyboard navigation works
- [ ] Focus indicators are visible
- [ ] Screen reader announces changes
- [ ] Animations are smooth
- [ ] Mobile layout is responsive
- [ ] Touch interactions work on mobile

## Common Issues

### Items per page not resetting page

Always reset to page 1 when changing items per page:

```tsx
onItemsPerPageChange={(newSize) => {
  setItemsPerPage(newSize);
  setCurrentPage(1); // Important!
}}
```

### Total items not updating from API

Ensure you update both data and total count:

```tsx
const result = await fetchData();
setItems(result.items);
setTotalItems(result.total); // Don't forget this!
```

### Focus outline not visible

The component uses custom focus rings. Ensure your CSS includes:

```css
*:focus-visible {
  @apply outline-none ring-2 ring-galaxy-500 ring-offset-2 ring-offset-slate-950;
}
```

## Future Enhancements

Potential improvements:

- [ ] URL parameter synchronization (query strings)
- [ ] Infinite scroll mode
- [ ] Loading states
- [ ] Server-side pagination helpers
- [ ] Customizable page range display (currently 2 neighbors)
- [ ] Jump to page input field

## License

Part of the Virtual Galaxy Conversational AI Dashboard project.

## Support

For issues or questions, please refer to the main project documentation.
