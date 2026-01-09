# LR & Order Numbering System - Final Specification

## 🔹 NUMBERING FORMATS

### 1. **Enquiry Number**
```
Format: ENQ-XXX/DD-MMM-YY

Examples:
- ENQ-001/04-Jan-26
- ENQ-002/04-Jan-26
- ENQ-050/04-Jan-26
- ENQ-001/05-Jan-26 ← Resets daily!

Rules:
✅ Resets every day (starts at 001)
✅ Sequential within the day
✅ Date-stamped format
✅ Auto-generated when client submits
```

### 2. **Order Number**
```
Format: ORD-XXX/MMM-YY

Examples:
- ORD-001/Jan-26
- ORD-002/Jan-26
- ORD-150/Jan-26
- ORD-001/Feb-26 ← Resets monthly!

Rules:
✅ Company-wide (not client-specific)
✅ Month-wise sequential
✅ Resets at start of every month
✅ Internal reference only
✅ Auto-generated when order created
```

### 3. **LR Number**
```
Format: Continuous series (e.g., 19985, 19986, 19987...)

Examples:
- 19985
- 19986
- 19987

Rules:
✅ Primary reference for clients
✅ Company's existing LR series
✅ Never resets
✅ Continuous across days/months/years
✅ Manually entered by admin
```

### 4. **Display Priority**
**Always show: `LR Number / Order Number`**

Examples:
- `19985 / ORD-001/Jan-26`
- `19986 / ORD-002/Jan-26`
- `19987 / ORD-003/Jan-26`

## 🔹 COMPLETE WORKFLOW

### Day 1: January 4, 2026

**Morning:**
```
Client A submits enquiry → ENQ-001/04-Jan-26
Client B submits enquiry → ENQ-002/04-Jan-26
Client C submits enquiry → ENQ-003/04-Jan-26
```

**Afternoon (Admin Processing):**
```
Admin reviews ENQ-001/04-Jan-26
↓
Creates 1 Order
↓
LR: 19985
Order: ORD-001/Jan-26
↓
Display: "19985 / ORD-001/Jan-26"

Admin reviews ENQ-002/04-Jan-26
↓
Creates 2 Orders (client needs 2 trucks)
↓
LR: 19986 → ORD-002/Jan-26
LR: 19987 → ORD-003/Jan-26
↓
Display: 
- "19986 / ORD-002/Jan-26"
- "19987 / ORD-003/Jan-26"
```

### Day 2: January 5, 2026

**Morning (Enquiry numbers reset):**
```
Client D submits enquiry → ENQ-001/05-Jan-26 ← Starts at 001 again!
Client A submits enquiry → ENQ-002/05-Jan-26
Client E submits enquiry → ENQ-003/05-Jan-26
```

**Afternoon (Admin Processing):**
```
Admin reviews ENQ-001/05-Jan-26
↓
Creates 1 Order
↓
LR: 19988 ← Continues from previous
Order: ORD-004/Jan-26 ← Continues from previous
↓
Display: "19988 / ORD-004/Jan-26"
```

### New Month: February 1, 2026

**Morning:**
```
Client F submits enquiry → ENQ-001/01-Feb-26 ← New day, starts at 001
```

**Afternoon:**
```
Admin creates Order
↓
LR: 19991 ← Continues from January
Order: ORD-001/Feb-26 ← Resets for new month!
↓
Display: "19991 / ORD-001/Feb-26"
```

## 🔹 NUMBERING RESET SCHEDULE

| Number Type | Reset Frequency | Example |
|-------------|----------------|---------|
| **Enquiry** | **Daily** | ENQ-001/04-Jan-26 → ENQ-001/05-Jan-26 |
| **Order** | **Monthly** | ORD-001/Jan-26 → ORD-001/Feb-26 |
| **LR** | **Never** | 19985 → 19986 → 19987... |

## 🔹 DATA STRUCTURE

### Enquiry Object
```javascript
{
  id: 'ENQ-001-04-Jan-26', // Internal ID
  enquiryNumber: 'ENQ-001/04-Jan-26', // Display number
  clientId: 'CLI-001',
  clientName: 'Client A',
  route: 'Mumbai → Delhi',
  material: 'Electronics',
  status: 'Pending', // Pending, Confirmed, Rejected
  createdAt: '2026-01-04T09:30:00',
  expiresAt: '2026-01-11T09:30:00', // 7 days from creation
  date: '04-Jan-26', // For daily numbering
  linkedOrders: [] // Array of order IDs once confirmed
}
```

### Order Object
```javascript
{
  id: 'ORD-001-Jan-26', // Internal ID
  orderNumber: 'ORD-001/Jan-26', // Display number
  lrNumber: '19985', // Primary reference
  enquiryId: 'ENQ-001-04-Jan-26', // Linked enquiry
  enquiryNumber: 'ENQ-001/04-Jan-26', // For reference
  clientId: 'CLI-001',
  clientName: 'Client A',
  route: 'Mumbai → Delhi',
  tripStatus: 'Pending',
  createdAt: '2026-01-04T14:30:00',
  month: 'Jan-26', // For monthly numbering
  // ... other order details
}
```

### Global Counters
```javascript
{
  enquiry: {
    currentDate: '04-Jan-26',
    count: 3 // Next enquiry will be ENQ-004/04-Jan-26
  },
  order: {
    currentMonth: 'Jan-26',
    count: 6 // Next order will be ORD-007/Jan-26
  },
  lr: {
    lastNumber: 19990 // Next LR will be 19991
  }
}
```

## 🔹 AUTO-GENERATION LOGIC

### Enquiry Number Generation
```javascript
function generateEnquiryNumber() {
  const currentDate = getCurrentDate(); // e.g., "04-Jan-26"
  const lastDate = getLastEnquiryDate();
  
  let enquiryCount;
  if (currentDate !== lastDate) {
    // New day - reset counter
    enquiryCount = 1;
  } else {
    // Same day - increment
    enquiryCount = getLastEnquiryCount() + 1;
  }
  
  const paddedCount = String(enquiryCount).padStart(3, '0');
  return `ENQ-${paddedCount}/${currentDate}`;
}

// Get Current Date
function getCurrentDate() {
  const date = new Date();
  const day = String(date.getDate()).padStart(2, '0');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[date.getMonth()];
  const year = String(date.getFullYear()).slice(-2);
  return `${day}-${month}-${year}`;
}
```

### Order Number Generation
```javascript
function generateOrderNumber() {
  const currentMonth = getCurrentMonth(); // e.g., "Jan-26"
  const lastMonth = getLastOrderMonth();
  
  let orderCount;
  if (currentMonth !== lastMonth) {
    // New month - reset counter
    orderCount = 1;
  } else {
    // Same month - increment
    orderCount = getLastOrderCount() + 1;
  }
  
  const paddedCount = String(orderCount).padStart(3, '0');
  return `ORD-${paddedCount}/${currentMonth}`;
}

// Get Current Month
function getCurrentMonth() {
  const date = new Date();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[date.getMonth()];
  const year = String(date.getFullYear()).slice(-2);
  return `${month}-${year}`;
}
```

## 🔹 COMPLETE EXAMPLE TIMELINE

### January 4, 2026 (Day 1)
```
09:00 - Client A submits → ENQ-001/04-Jan-26
09:30 - Client B submits → ENQ-002/04-Jan-26
10:00 - Client C submits → ENQ-003/04-Jan-26

14:00 - Admin processes ENQ-001/04-Jan-26
        Creates: 19985 / ORD-001/Jan-26

14:30 - Admin processes ENQ-002/04-Jan-26 (needs 2 trucks)
        Creates: 19986 / ORD-002/Jan-26
                 19987 / ORD-003/Jan-26

15:00 - Admin processes ENQ-003/04-Jan-26
        Creates: 19988 / ORD-004/Jan-26
```

### January 5, 2026 (Day 2)
```
09:00 - Client D submits → ENQ-001/05-Jan-26 ← Resets to 001!
09:30 - Client A submits → ENQ-002/05-Jan-26
10:00 - Client E submits → ENQ-003/05-Jan-26

14:00 - Admin processes ENQ-001/05-Jan-26
        Creates: 19989 / ORD-005/Jan-26 ← Order continues

14:30 - Admin processes ENQ-002/05-Jan-26
        Creates: 19990 / ORD-006/Jan-26
```

### January 31, 2026 (End of Month)
```
Last order of January: ORD-150/Jan-26
Last LR: 20135
```

### February 1, 2026 (New Month)
```
09:00 - Client F submits → ENQ-001/01-Feb-26 ← Daily reset
10:00 - Client G submits → ENQ-002/01-Feb-26

14:00 - Admin processes ENQ-001/01-Feb-26
        Creates: 20136 / ORD-001/Feb-26 ← Order resets!
                 ↑ LR continues  ↑ Order resets
```

## 🔹 UI DISPLAY EXAMPLES

### Enquiry Card (Client Panel)
```jsx
┌─────────────────────────────────┐
│ ENQ-001/04-Jan-26              │ ← Bold, primary
│ Mumbai → Delhi                  │
│ Status: Pending                 │
│ Submitted: 04-Jan-26 09:30 AM  │
│ Expires: 11-Jan-26 09:30 AM    │ ← 7 days
└─────────────────────────────────┘
```

### Trip Card (Both Panels)
```jsx
┌─────────────────────────────────┐
│ 19985 / ORD-001/Jan-26         │ ← LR primary
│ Mumbai → Delhi                  │
│ Client: Client A                │
│ Status: In Transit              │
│ From: ENQ-001/04-Jan-26        │ ← Reference
└─────────────────────────────────┘
```

### Admin Orders List
```
┌──────────┬──────────────┬──────────┬─────────┐
│ LR No    │ Order No     │ Enquiry  │ Status  │
├──────────┼──────────────┼──────────┼─────────┤
│ 19985    │ ORD-001/     │ ENQ-001/ │ Transit │
│          │ Jan-26       │ 04-Jan-26│         │
├──────────┼──────────────┼──────────┼─────────┤
│ 19986    │ ORD-002/     │ ENQ-002/ │ Loading │
│          │ Jan-26       │ 04-Jan-26│         │
└──────────┴──────────────┴──────────┴─────────┘
```

## 🔹 ENQUIRY AUTO-CLEANUP

### Rules
- Enquiries **auto-delete after 7 days** from creation
- Only if status is "Pending" or "Rejected"
- Confirmed enquiries remain (linked to Orders)
- Countdown shown on enquiry cards

### Example
```
Created: 04-Jan-26 09:30 AM
Expires: 11-Jan-26 09:30 AM

Status on 10-Jan-26:
"Expires in 1 day" ← Warning

Status on 11-Jan-26 09:31 AM:
Enquiry auto-deleted (if still Pending)
```

## 🔹 IMPLEMENTATION CHECKLIST

### Client Panel
- [ ] Auto-generate enquiry number on submission
- [ ] Display: ENQ-XXX/DD-MMM-YY
- [ ] Show expiry countdown
- [ ] Update all enquiry displays
- [ ] Show linked order numbers on confirmed enquiries

### Admin Panel
- [ ] Display enquiry numbers
- [ ] Auto-generate order numbers
- [ ] Input LR numbers manually
- [ ] Link orders to enquiries
- [ ] Display: LR / Order everywhere
- [ ] Show enquiry reference on orders

### Both Panels
- [ ] Update trip/order cards
- [ ] Update lists and tables
- [ ] Update detail pages
- [ ] Show full traceability (Enquiry → Order → LR)

### Auto-Cleanup System
- [ ] Track enquiry creation date
- [ ] Calculate expiry (7 days)
- [ ] Auto-delete expired pending enquiries
- [ ] Keep confirmed enquiries
- [ ] Show countdown on UI

## 🔹 BENEFITS

✅ **Daily Fresh Start**: Enquiries reset daily for easy tracking  
✅ **Monthly Order Tracking**: See monthly volume at a glance  
✅ **Continuous LR Series**: Maintains company's existing system  
✅ **Full Traceability**: Enquiry → Order → LR linkage  
✅ **Auto Cleanup**: Old enquiries don't clutter system  
✅ **Clear References**: LR is primary, Order is secondary  

## 🔹 SUMMARY

**Enquiry**: `ENQ-XXX/DD-MMM-YY` (resets **daily**)  
**Order**: `ORD-XXX/MMM-YY` (resets **monthly**)  
**LR**: Continuous series (never resets)  

**Display**: `LR Number / Order Number`  
**Example**: `19985 / ORD-001/Jan-26`  
**Reference**: `From ENQ-001/04-Jan-26`  

**Cleanup**: Enquiries auto-delete after 7 days if not confirmed
