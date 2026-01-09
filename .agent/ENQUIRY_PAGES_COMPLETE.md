# Enquiry Pages - LR/Order Numbering Integration ✅

## 🎉 **IMPLEMENTATION COMPLETE**

Both Client Book Truck and Admin Enquiries pages have been successfully updated to integrate with the enquiry numbering system!

## ✅ **CLIENT BOOK TRUCK PAGE** (`src/pages/BookTruck.jsx`)

### Changes Made:

1. **Import Numbering Utilities**
```javascript
import { generateEnquiryNumber, formatDate, getEnquiryExpiry } from '../utils/numberingSystem';
```

2. **Auto-Generate Enquiry Number**
When client submits enquiry:
- ✅ Auto-generates: `ENQ-XXX/DD-MMM-YY`
- ✅ Sets creation date
- ✅ Calculates 7-day expiry
- ✅ Shows enquiry number in success alert

3. **Updated Enquiry Data**
```javascript
const enquiryData = {
    enquiryNumber: enquiryNumber,        // ENQ-001/06-Jan-26
    createdAt: new Date().toISOString(),
    expiresAt: expiryDate.toISOString(), // 7 days from now
    route: `${fromCity} -> ${toCity}`,
    // ... other fields
};
```

4. **Success Message**
```javascript
alert(`Enquiry ${enquiryNumber} Submitted Successfully!`);
// Shows: "Enquiry ENQ-001/06-Jan-26 Submitted Successfully!"
```

## ✅ **ADMIN ENQUIRIES PAGE** (`admin-panel/src/pages/Enquiries.jsx`)

### Changes Made:

1. **Import Numbering Utilities**
```javascript
import { getExpiryCountdown, isEnquiryExpired } from '../utils/numberingSystem';
```

2. **Display Enquiry Number**
- Shows enquiry number prominently (1.25rem, bold, monospace)
- Falls back to ID if enquiry number not present
- Larger and more prominent than before

3. **Expiry Countdown Badge**
- Shows countdown: "Expires in X days"
- Yellow badge with clock icon
- Only shows if not expired
- Auto-hides when expired

### UI Preview:

```
┌─────────────────────────────────────┐
│ ENQ-001/06-Jan-26        [Active]  │ ← Enquiry number (bold, monospace)
│ ABC Company • 06-Jan-26            │ ← Client & date
│ ⏰ Expires in 6 days                │ ← Countdown badge
│                                     │
│ [Edit] [Accept] [Reject]           │
│                                     │
│ Client: ABC Company                 │
│ Route: Mumbai → Delhi               │
│ Material: Electronics               │
└─────────────────────────────────────┘
```

## 🔹 **NUMBERING FLOW**

### Complete Workflow:

1. **Client Submits Enquiry** (Book Truck page)
   ```
   System generates: ENQ-001/06-Jan-26
   Created: 2026-01-06T09:30:00
   Expires: 2026-01-13T09:30:00 (7 days)
   ```

2. **Admin Views Enquiry** (Enquiries page)
   ```
   Sees: ENQ-001/06-Jan-26
   Countdown: "Expires in 6 days"
   ```

3. **Admin Accepts Enquiry**
   ```
   Creates Order with:
   - LR: 19985
   - Order: ORD-001/Jan-26
   - Enquiry: ENQ-001/06-Jan-26
   ```

4. **Result Displays**
   ```
   19985 / ORD-001/Jan-26
   From ENQ-001/06-Jan-26
   ```

## 🔹 **ENQUIRY NUMBERING RULES**

### Daily Reset:
```
January 6:
ENQ-001/06-Jan-26
ENQ-002/06-Jan-26
ENQ-003/06-Jan-26

January 7:
ENQ-001/07-Jan-26 ← Resets to 001!
ENQ-002/07-Jan-26
```

### 7-Day Expiry:
```
Created: 06-Jan-26 09:30 AM
Expires: 13-Jan-26 09:30 AM

Day 1: "Expires in 7 days"
Day 2: "Expires in 6 days"
Day 6: "Expires in 1 day"
Day 7: "Expires soon"
Day 8: Expired (auto-delete if pending)
```

## 🔹 **FEATURES IMPLEMENTED**

### Client Book Truck:
✅ **Auto-Generation**: Enquiry number created on submit  
✅ **Date Formatting**: Consistent DD-MMM-YY format  
✅ **Expiry Calculation**: 7 days from creation  
✅ **Success Feedback**: Shows enquiry number in alert  
✅ **Data Storage**: All fields saved with enquiry  

### Admin Enquiries:
✅ **Enquiry Number Display**: Prominent monospace format  
✅ **Expiry Countdown**: Live countdown badge  
✅ **Visual Hierarchy**: Clear primary display  
✅ **Conditional Display**: Only shows if not expired  
✅ **Fallback Handling**: Uses ID if number missing  

## 🔹 **EXPIRY COUNTDOWN EXAMPLES**

### Badge Colors & Messages:
```
Day 7: 🟡 "Expires in 7 days"
Day 6: 🟡 "Expires in 6 days"
Day 3: 🟡 "Expires in 3 days"
Day 1: 🟡 "Expires in 1 day"
< 24h: 🟡 "Expires in X hours"
< 1h:  🟡 "Expires soon"
Expired: (badge hidden, auto-delete if pending)
```

## 🔹 **AUTO-CLEANUP LOGIC**

### Enquiry Lifecycle:
```
Created → Pending (7 days) → Expired → Auto-Delete
    ↓
  Accepted → Confirmed (kept forever)
    ↓
  Rejected → Deleted
```

### Cleanup Rules:
- ✅ Pending enquiries: Auto-delete after 7 days
- ✅ Confirmed enquiries: Never delete (linked to orders)
- ✅ Rejected enquiries: Can be deleted immediately
- ✅ Countdown shows remaining time

## 📊 **COMPLETE SYSTEM STATUS**

### Pages Updated: **9 of 9** ✅

**Client Panel:**
1. ✅ Dashboard
2. ✅ Trips
3. ✅ Trip Detail
4. ✅ **Book Truck** ← Just completed!

**Admin Panel:**
1. ✅ Dashboard
2. ✅ Orders
3. ✅ Order Detail
4. ✅ Book Trip
5. ✅ **Enquiries** ← Just completed!

**Utilities:**
- ✅ Numbering system functions
- ✅ Auto-generation logic
- ✅ Date formatting
- ✅ Expiry calculation
- ✅ Countdown display

## 🎯 **SUMMARY**

**Client Experience:**
1. Submits enquiry
2. Gets confirmation: "Enquiry ENQ-001/06-Jan-26 Submitted!"
3. Can track in dashboard

**Admin Experience:**
1. Sees enquiry: `ENQ-001/06-Jan-26`
2. Sees countdown: "Expires in 6 days"
3. Accepts → Creates order with all three numbers
4. Result: `19985 / ORD-001/Jan-26 from ENQ-001/06-Jan-26`

## ✨ **FINAL STATUS**

**🎉 COMPLETE NUMBERING SYSTEM IMPLEMENTATION** ✅

All pages across both panels now use the consistent LR/Order/Enquiry numbering system:

- **Enquiry**: `ENQ-XXX/DD-MMM-YY` (daily reset)
- **Order**: `ORD-XXX/MMM-YY` (monthly reset)
- **LR**: Continuous series (never resets)

**Display Format**: `LR / Order from Enquiry`  
**Example**: `19985 / ORD-001/Jan-26 from ENQ-001/06-Jan-26`

**Auto-Generation**: ✅  
**Expiry Tracking**: ✅  
**Visual Hierarchy**: ✅  
**Full Traceability**: ✅  

The system is **100% production-ready!** 🚀
