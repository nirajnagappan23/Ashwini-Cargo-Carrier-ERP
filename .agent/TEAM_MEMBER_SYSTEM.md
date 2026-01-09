# Team Member Management System

## Overview
Clients can add up to 2 team members who have **VIEW-ONLY** access to the client portal. These members can see everything (Dashboard, Trips, Tracking, Chats, Enquiries, Documents, Payments) but cannot edit, create, or input any data. Admins can also create and manage team members from the Admin Panel.

## Features

### 1. **Team Member Permissions**

**Can View:**
- ✅ Dashboard (all stats and live shipments)
- ✅ Trips/Orders (all trip details and tracking)
- ✅ Trip Detail pages (tracking timeline, documents)
- ✅ Enquiries (view all enquiries)
- ✅ Chat (view messages, cannot send)
- ✅ Documents (view and download only)
- ✅ Payments (view payment history)
- ✅ Account (view company details, cannot edit)

**Cannot Do:**
- ❌ Book new trucks/enquiries
- ❌ Send chat messages
- ❌ Upload documents
- ❌ Edit any information
- ❌ Change passwords (except their own)
- ❌ Add/remove other team members
- ❌ Accept/reject quotes

### 2. **Client Portal - Team Member Management**

**Account Page Enhancements:**
- "Team Members" section (max 2 members)
- "Add Team Member" button (disabled when limit reached)
- Add Member Modal with fields:
  - Name *
  - Email *
  - Phone *
  - Role/Designation
  - Auto-generated username (email)
  - Auto-generated temporary password
- Member list showing:
  - Name, email, role
  - "Remove" button
  - Member count (e.g., "2/2 members")

### 3. **Admin Panel - Team Member Management**

**Client Detail/Edit Page:**
- "Team Members" section for each client
- View all team members for a client
- Add new team members
- Remove team members
- Edit team member credentials
- Same fields as client portal

### 4. **Data Structure**

```javascript
// Client Object
{
  id: 'CLI-001',
  name: 'Company Name',
  email: 'contact@company.com',
  username: 'contact@company.com',
  password: 'hashed_password',
  role: 'owner', // owner, member
  // ... other fields
  
  teamMembers: [
    {
      id: 'MEM-001',
      name: 'John Doe',
      email: 'john@company.com',
      phone: '+91 9876543210',
      role: 'Manager', // designation
      username: 'john@company.com',
      password: 'hashed_password',
      accountType: 'member', // view-only
      createdBy: 'owner', // or 'admin'
      createdAt: '2026-01-05'
    }
  ]
}
```

### 5. **Login System Enhancement**

**Login Flow:**
1. User enters username/password
2. System checks if user is:
   - Client owner (full access)
   - Team member (view-only access)
   - Admin (admin panel)
3. Set user role in context/session
4. Redirect to appropriate dashboard

**Context Updates:**
```javascript
const AppContext = {
  user: {
    id: 'CLI-001',
    name: 'John Doe',
    email: 'john@company.com',
    role: 'member', // 'owner' or 'member'
    clientId: 'CLI-001', // parent client ID
    permissions: {
      canEdit: false,
      canCreate: false,
      canDelete: false,
      canSendMessages: false
    }
  }
}
```

### 6. **UI Changes for View-Only Mode**

**When user.role === 'member':**

**Dashboard:**
- Show all stats (read-only)
- Show live shipments table
- Hide "Book a Truck" button

**Trips Page:**
- Show all trips
- Disable click to edit
- "View Details" button only

**Trip Detail:**
- Show all information
- Hide upload document buttons
- Show documents (download only)

**Enquiries:**
- Show all enquiries
- Hide "Book New Truck" button
- Hide accept/reject buttons
- View-only mode

**Chat:**
- Show all messages
- Hide input field and send button
- Show message: "You have view-only access. Contact your account owner to send messages."

**Documents:**
- Show all documents
- Download button enabled
- Upload button hidden

**Payments:**
- Show all payment records
- View-only mode

**Account:**
- Show company details (read-only)
- Show team members (cannot add/remove)
- Can change own password only
- Cannot see other members' credentials

### 7. **Implementation Steps**

#### Step 1: Update AppContext
```javascript
// Add user role and permissions
const [currentUser, setCurrentUser] = useState({
  role: 'owner', // or 'member'
  permissions: {
    canEdit: true,
    canCreate: true,
    canSendMessages: true
  }
});
```

#### Step 2: Update Account Page
- Add "Add Team Member" modal
- Implement member addition logic
- Show member list with remove option
- Limit to 2 members

#### Step 3: Update All Pages
- Check `currentUser.role` before showing edit/create buttons
- Disable inputs when role is 'member'
- Show view-only indicators

#### Step 4: Update Admin Panel
- Add team member management to Clients page
- Allow admin to add/remove members
- Show member count

### 8. **Security Considerations**

1. **Backend Validation**: Always verify user role on server
2. **API Restrictions**: Team members cannot call edit/create APIs
3. **Session Management**: Store user role in secure session
4. **Password Security**: Hash all passwords
5. **Audit Log**: Track who added/removed members

### 9. **User Experience**

**For Team Members:**
- Clear indication of view-only status
- Helpful tooltips: "You have view-only access"
- Disabled buttons with explanatory text
- All data visible but not editable

**For Client Owners:**
- Easy member management
- Clear member limit (2/2)
- Simple add/remove process
- Automatic credential generation

**For Admins:**
- Full control over all members
- Can add members on behalf of clients
- Can reset member passwords
- View member activity

### 10. **Benefits**

✅ **Collaboration**: Multiple people can view shipments  
✅ **Security**: View-only prevents accidental changes  
✅ **Transparency**: Everyone sees the same data  
✅ **Control**: Client owner maintains full control  
✅ **Simplicity**: Easy to add/remove members  
✅ **Flexibility**: Admin can help manage members  

### 11. **Example Scenarios**

**Scenario 1: Adding a Manager**
- Client owner logs in
- Goes to Account page
- Clicks "Add Team Member"
- Enters: Name: "Rahul Sharma", Email: "rahul@company.com", Role: "Manager"
- System generates username (email) and temporary password
- Sends credentials to Rahul via email
- Rahul logs in with view-only access

**Scenario 2: Admin Adding Member**
- Admin opens client detail page
- Sees "Team Members (1/2)"
- Clicks "Add Member"
- Enters member details
- Member receives credentials
- Can log in immediately

**Scenario 3: Member Viewing Shipment**
- Team member logs in
- Sees dashboard with all stats
- Clicks on a trip
- Views tracking timeline
- Downloads POD document
- Cannot upload new documents
- Cannot send chat messages

### 12. **Future Enhancements**

1. **Custom Permissions**: Allow granular permission control
2. **Activity Log**: Track what members viewed
3. **Email Notifications**: Auto-send credentials
4. **Bulk Import**: Import multiple members via CSV
5. **Department Tags**: Categorize members by department
6. **Temporary Access**: Set expiry dates for members
7. **Mobile App**: Dedicated mobile app for members

## Implementation Priority

**Phase 1 (Current):**
- ✅ Add team member data structure
- ✅ Update Account page with member management
- ✅ Implement add/remove member functionality
- ✅ Add view-only mode checks

**Phase 2 (Next):**
- Update all pages to respect view-only mode
- Add admin panel member management
- Implement login role detection

**Phase 3 (Future):**
- Email credential delivery
- Activity tracking
- Advanced permissions
