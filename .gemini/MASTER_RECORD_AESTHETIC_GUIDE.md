# Master Record Aesthetic - Implementation Guide

## Overview
This guide provides the styling changes needed to apply the Master Record page aesthetic to:
1. Client Panel: Transport Enquiries (BookTruck.jsx)
2. Admin Panel: Book New Trip (BookTrip.jsx)

## CSS Variables to Use
```css
--admin-primary: #1e40af;
--admin-accent: #3b82f6;
--admin-success: #10b981;
--admin-danger: #ef4444;
--admin-warning: #f59e0b;
--admin-text: #1e293b;
--admin-text-light: #64748b;
--admin-bg: #f8fafc;
--admin-card-bg: #ffffff;
--admin-border: #e2e8f0;
```

## 1. Header Section

### Replace Current Header With:
```jsx
<div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
    {/* Header */}
    <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <div style={{ 
                width: '48px', 
                height: '48px', 
                borderRadius: '12px', 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white'
            }}>
                <Truck size={24} />
            </div>
            <div>
                <h1 style={{ fontSize: '1.875rem', fontWeight: '700', color: 'var(--admin-primary)', margin: 0 }}>
                    Transport Enquiries
                </h1>
                <p style={{ fontSize: '0.875rem', color: 'var(--admin-text-light)', margin: '0.25rem 0 0 0' }}>
                    Manage your existing enquiries or book a new truck
                </p>
            </div>
        </div>
    </div>
</div>
```

## 2. Card Styling

### Replace `.card` class with:
```jsx
style={{
    background: 'var(--admin-card-bg)',
    borderRadius: '0.75rem',
    padding: '1.5rem',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    border: '1px solid var(--admin-border)',
    marginBottom: '1.5rem'
}}
```

## 3. Section Headers

### Replace section headers with:
```jsx
<h3 style={{
    fontSize: '0.875rem',
    fontWeight: '700',
    color: 'var(--admin-text-light)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: '1rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
}}>
    <MapPin size={14} /> Route Details
</h3>
```

## 4. Form Labels

### Update all labels:
```jsx
<label style={{
    display: 'block',
    fontSize: '0.75rem',
    fontWeight: '600',
    color: 'var(--admin-text-light)',
    marginBottom: '0.5rem',
    textTransform: 'uppercase',
    letterSpacing: '0.025em'
}}>
    Label Text
</label>
```

## 5. Input Fields

### Update input styling:
```jsx
<input style={{
    width: '100%',
    padding: '0.625rem',
    border: '1px solid var(--admin-border)',
    borderRadius: '0.5rem',
    fontSize: '0.875rem',
    background: 'white'
}} />
```

## 6. Buttons

### Primary Button:
```jsx
<button style={{
    padding: '0.75rem 1.5rem',
    background: 'var(--admin-primary)',
    color: 'white',
    border: 'none',
    borderRadius: '0.5rem',
    fontSize: '0.875rem',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
}}>
    <Plus size={16} /> Button Text
</button>
```

### Outline Button:
```jsx
<button style={{
    padding: '0.75rem 1.5rem',
    background: 'white',
    color: 'var(--admin-primary)',
    border: '1px solid var(--admin-border)',
    borderRadius: '0.5rem',
    fontSize: '0.875rem',
    fontWeight: '600',
    cursor: 'pointer'
}}>
    Button Text
</button>
```

## 7. Enquiry/Trip Cards

### Card Layout:
```jsx
<div style={{
    background: 'var(--admin-card-bg)',
    borderRadius: '0.75rem',
    padding: '1.5rem',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    border: '1px solid var(--admin-border)',
    marginBottom: '1rem'
}}>
    {/* Card Header */}
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid var(--admin-border)' }}>
        <div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '700', color: 'var(--admin-primary)', fontFamily: 'monospace', margin: 0 }}>
                ENQ-XXX/DD-MMM-YY
            </h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--admin-text-light)', margin: '0.25rem 0 0 0' }}>
                Date info
            </p>
        </div>
        <span style={{ padding: '0.25rem 0.75rem', background: '#fef3c7', color: '#92400e', borderRadius: '0.375rem', fontSize: '0.75rem', fontWeight: '600' }}>
            Active
        </span>
    </div>

    {/* Card Content Grid */}
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-light)', marginBottom: '0.25rem' }}>Label</div>
            <div style={{ fontWeight: '600', color: 'var(--admin-text)' }}>Value</div>
        </div>
    </div>
</div>
```

## 8. Status Badges

```jsx
// Active/Pending
<span style={{ padding: '0.25rem 0.75rem', background: '#fef3c7', color: '#92400e', borderRadius: '0.375rem', fontSize: '0.75rem', fontWeight: '600' }}>
    Active
</span>

// Success/Confirmed
<span style={{ padding: '0.25rem 0.75rem', background: '#d1fae5', color: '#065f46', borderRadius: '0.375rem', fontSize: '0.75rem', fontWeight: '600' }}>
    Confirmed
</span>

// Danger/Cancelled
<span style={{ padding: '0.25rem 0.75rem', background: '#fee2e2', color: '#991b1b', borderRadius: '0.375rem', fontSize: '0.75rem', fontWeight: '600' }}>
    Cancelled
</span>
```

## 9. Form Sections

### Collapsible/Editable Sections:
```jsx
{/* Editing State */}
<div style={{
    padding: '1rem',
    border: '2px solid #3b82f6',
    borderRadius: '0.5rem',
    background: 'white',
    boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)'
}}>
    {/* Form fields */}
</div>

{/* Collapsed State */}
<div style={{
    padding: '0.75rem',
    border: '1px solid var(--admin-border)',
    borderRadius: '0.5rem',
    background: 'var(--admin-bg)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
}}>
    <div>
        <div style={{ fontWeight: '600', color: 'var(--admin-text)' }}>Value</div>
        <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-light)' }}>Subtext</div>
    </div>
    <button style={{ padding: '0.5rem', background: '#eff6ff', color: '#3b82f6', border: 'none', borderRadius: '50%', cursor: 'pointer' }}>
        <Edit2 size={14} />
    </button>
</div>
```

## 10. Grid Layouts

### Two Column Grid:
```jsx
<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
    {/* Content */}
</div>
```

### Auto-fit Grid:
```jsx
<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
    {/* Content */}
</div>
```

## Implementation Steps

1. **Replace Header** - Update the page header with gradient icon box
2. **Update All Cards** - Apply new card styling to all `.card` elements
3. **Update Section Headers** - Make all section headers uppercase with icons
4. **Update Form Labels** - Apply new label styling
5. **Update Buttons** - Replace button classes with inline styles
6. **Update Inputs** - Apply consistent input styling
7. **Update Status Badges** - Use new badge styles
8. **Test Responsiveness** - Ensure grids work on mobile

## Quick Find & Replace

### In BookTruck.jsx and BookTrip.jsx:

1. Find: `className="card"`
   Replace with: Card style object above

2. Find: `className="btn btn-primary"`
   Replace with: Primary button style above

3. Find: `className="label"`
   Replace with: Label style above

4. Find: `className="input"`
   Replace with: Input style above

## Notes

- Use inline styles for consistency with Master Record page
- Maintain existing functionality, only update visual appearance
- Test all interactive elements after applying changes
- Ensure mobile responsiveness is maintained
