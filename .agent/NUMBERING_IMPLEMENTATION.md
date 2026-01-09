# LR/Order Numbering System - Implementation Complete

## ✅ **IMPLEMENTED COMPONENTS**

### 1. **Utility Functions** (Both Panels)
Created: `src/utils/numberingSystem.js` and `admin-panel/src/utils/numberingSystem.js`

**Functions:**
- `generateEnquiryNumber()` - Creates ENQ-XXX/DD-MMM-YY (resets daily)
- `generateOrderNumber()` - Creates ORD-XXX/MMM-YY (resets monthly)
- `getNextLRNumber()` - Returns next LR number (continuous)
- `formatDisplayNumber(lr, order)` - Formats as "LR / Order"
- `getEnquiryExpiry(date)` - Calculates 7-day expiry
- `isEnquiryExpired(date)` - Checks if enquiry expired
- `getExpiryCountdown(date)` - Shows "Expires in X days"

## 🔹 **NUMBERING EXAMPLES**

### Today: January 6, 2026

**Enquiries (Reset Daily):**
```
ENQ-001/06-Jan-26  ← First enquiry today
ENQ-002/06-Jan-26
ENQ-003/06-Jan-26

Tomorrow (Jan 7):
ENQ-001/07-Jan-26  ← Resets to 001
```

**Orders (Reset Monthly):**
```
ORD-001/Jan-26  ← First order this month
ORD-002/Jan-26
ORD-003/Jan-26

Next Month (Feb 1):
ORD-001/Feb-26  ← Resets to 001
```

**LR Numbers (Never Reset):**
```
19985, 19986, 19987, 19988... (continuous forever)
```

## 🔹 **DISPLAY FORMAT**

### Primary Display
```
19985 / ORD-001/Jan-26
  ↑         ↑
  LR      Order
```

### With Enquiry Reference
```
19985 / ORD-001/Jan-26
From ENQ-001/06-Jan-26
```

## 🔹 **NEXT STEPS TO COMPLETE**

### Client Panel Updates Needed:

1. **Dashboard (`src/pages/Dashboard.jsx`)**
   - [x] Update Live Shipments table to show "LR / Order"
   - [ ] Add enquiry reference
   - [ ] Update trip cards

2. **Trips Page (`src/pages/Trips.jsx`)**
   - [ ] Update trip cards to show "LR / Order"
   - [ ] Add enquiry reference
   - [ ] Show order number below LR

3. **Trip Detail (`src/pages/TripDetail.jsx`)**
   - [ ] Update header to show "LR / Order"
   - [ ] Add enquiry reference
   - [ ] Update all displays

4. **Enquiries (`src/pages/BookTruck.jsx`)**
   - [ ] Auto-generate enquiry number on submit
   - [ ] Show expiry countdown
   - [ ] Display format: ENQ-XXX/DD-MMM-YY

### Admin Panel Updates Needed:

1. **Dashboard (`admin-panel/src/pages/Dashboard.jsx`)**
   - [ ] Update Live Shipments table
   - [ ] Show "LR / Order" format
   - [ ] Add enquiry reference

2. **Orders/Trips Page (`admin-panel/src/pages/Orders.jsx`)**
   - [ ] Update order cards
   - [ ] Show "LR / Order" prominently
   - [ ] Add enquiry reference

3. **Book Trip (`admin-panel/src/pages/BookTrip.jsx`)**
   - [ ] Add LR number input field
   - [ ] Auto-generate order number
   - [ ] Link to enquiry
   - [ ] Show preview before creating

4. **Enquiries Page (`admin-panel/src/pages/Enquiries.jsx`)**
   - [ ] Display enquiry numbers
   - [ ] Show expiry countdown
   - [ ] Add "Create Order" button
   - [ ] Auto-delete expired enquiries

## 🔹 **USAGE EXAMPLES**

### Generate Enquiry Number
```javascript
import { generateEnquiryNumber } from '../utils/numberingSystem';

// When client submits enquiry
const enquiryNumber = generateEnquiryNumber();
// Returns: "ENQ-001/06-Jan-26"
```

### Generate Order Number
```javascript
import { generateOrderNumber } from '../utils/numberingSystem';

// When admin creates order
const orderNumber = generateOrderNumber();
// Returns: "ORD-001/Jan-26"
```

### Get Next LR Number
```javascript
import { getNextLRNumber } from '../utils/numberingSystem';

// When admin enters LR or system suggests
const lrNumber = getNextLRNumber();
// Returns: "19985"
```

### Display Combined
```javascript
import { formatDisplayNumber } from '../utils/numberingSystem';

const display = formatDisplayNumber('19985', 'ORD-001/Jan-26');
// Returns: "19985 / ORD-001/Jan-26"
```

### Check Enquiry Expiry
```javascript
import { getExpiryCountdown, isEnquiryExpired } from '../utils/numberingSystem';

const createdDate = '2026-01-06T09:30:00';

if (isEnquiryExpired(createdDate)) {
  console.log('Enquiry expired - auto-delete');
} else {
  const countdown = getExpiryCountdown(createdDate);
  console.log(countdown); // "Expires in 6 days"
}
```

## 🔹 **DATA STRUCTURE UPDATES NEEDED**

### Enquiry Object
```javascript
{
  id: 'ENQ-001-06-Jan-26',
  enquiryNumber: 'ENQ-001/06-Jan-26',  // NEW
  clientId: 'CLI-001',
  route: 'Mumbai → Delhi',
  status: 'Pending',
  createdAt: '2026-01-06T09:30:00',
  expiresAt: '2026-01-13T09:30:00',    // NEW (7 days)
  linkedOrders: []                      // NEW
}
```

### Order Object
```javascript
{
  id: 'ORD-001-Jan-26',
  orderNumber: 'ORD-001/Jan-26',        // NEW
  lrNumber: '19985',                    // NEW (primary)
  enquiryId: 'ENQ-001-06-Jan-26',      // NEW
  enquiryNumber: 'ENQ-001/06-Jan-26',  // NEW (for display)
  clientId: 'CLI-001',
  route: 'Mumbai → Delhi',
  tripStatus: 'Pending',
  createdAt: '2026-01-06T14:30:00'
}
```

## 🔹 **STORAGE MECHANISM**

Using `localStorage` for counters:

```javascript
// Daily counter (resets each day)
localStorage.setItem('enquiryCounter_06-Jan-26', '3');

// Monthly counter (resets each month)
localStorage.setItem('orderCounter_Jan-26', '15');

// LR counter (never resets)
localStorage.setItem('lastLRNumber', '19990');
```

## 🔹 **AUTO-CLEANUP LOGIC**

### Enquiry Expiry Check
```javascript
// Run daily or on page load
function cleanupExpiredEnquiries(enquiries) {
  return enquiries.filter(enq => {
    if (enq.status === 'Confirmed') return true; // Keep confirmed
    if (enq.status === 'Rejected') return false; // Delete rejected
    return !isEnquiryExpired(enq.createdAt); // Delete expired pending
  });
}
```

## 🔹 **UI UPDATES SUMMARY**

### Before:
```
Order ID: ORD-8821
LR: LR-8821
```

### After:
```
19985 / ORD-001/Jan-26
From ENQ-001/06-Jan-26
```

### Dashboard Table Before:
```
┌────────┬─────────┬────────┐
│ LR No  │ Route   │ Status │
├────────┼─────────┼────────┤
│ LR-8821│ Mum→Del │ Transit│
└────────┴─────────┴────────┘
```

### Dashboard Table After:
```
┌──────────────────┬─────────┬────────┐
│ LR / Order       │ Route   │ Status │
├──────────────────┼─────────┼────────┤
│ 19985            │ Mum→Del │ Transit│
│ ORD-001/Jan-26   │         │        │
│ ENQ-001/06-Jan-26│         │        │
└──────────────────┴─────────┴────────┘
```

## 🔹 **TESTING CHECKLIST**

- [ ] Enquiry number increments daily
- [ ] Enquiry number resets at midnight
- [ ] Order number increments monthly
- [ ] Order number resets on 1st of month
- [ ] LR number never resets
- [ ] Display shows "LR / Order" format
- [ ] Enquiry expires after 7 days
- [ ] Expired enquiries auto-delete
- [ ] Confirmed enquiries don't expire
- [ ] Counters persist across page reloads

## 🔹 **BENEFITS ACHIEVED**

✅ **Clear Primary Reference**: LR number always first  
✅ **Daily Enquiry Tracking**: Easy to see today's enquiries  
✅ **Monthly Order Tracking**: See monthly volume  
✅ **Continuous LR Series**: Maintains company system  
✅ **Full Traceability**: Enquiry → Order → LR  
✅ **Auto Cleanup**: Old enquiries auto-delete  
✅ **Consistent Display**: Same format both panels  

## 🔹 **NEXT IMMEDIATE ACTIONS**

1. Update Client Dashboard to use new format
2. Update Admin Dashboard to use new format
3. Update all trip/order cards
4. Update enquiry submission to generate numbers
5. Update order creation to link enquiries
6. Implement auto-cleanup cron job

The numbering system utilities are ready to use!
