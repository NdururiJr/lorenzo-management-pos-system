# Workstation Management System - User Guide

**Version:** 1.0
**Last Updated:** 2025-10-27
**System Status:** Production Ready

---

## Table of Contents

1. [Overview](#overview)
2. [User Roles & Access](#user-roles--access)
3. [Order Workflow](#order-workflow)
4. [User Guides by Role](#user-guides-by-role)
5. [Common Tasks](#common-tasks)
6. [Troubleshooting](#troubleshooting)
7. [Best Practices](#best-practices)

---

## Overview

### What is the Workstation Management System?

The Workstation Management System is a comprehensive solution for managing garment processing operations at Lorenzo Dry Cleaners. It handles the complete lifecycle of orders from initial inspection through to ready-for-collection.

### Key Features

- **Two-Stage Inspection**: Initial inspection at POS + detailed workstation inspection
- **Batch Processing**: Efficient washing and drying batch management
- **Staff Tracking**: Permanent stage assignments with performance monitoring
- **Real-time Updates**: Live order status and processing updates
- **Performance Metrics**: Staff efficiency scores and analytics
- **Major Issues Workflow**: Manager approval for damaged garments
- **Mobile Responsive**: Full tablet and mobile support

---

## User Roles & Access

### Workstation Manager
**Full system access** - Can perform all operations

**Capabilities:**
- View all workstation tabs (Overview, Inspection, Queue, Active, Staff, Performance, Analytics)
- Create and manage processing batches
- Assign staff to stages
- Approve major issues
- View performance metrics
- Access pipeline view

### Workstation Staff
**Limited to assigned operations**

**Capabilities:**
- Perform inspections
- Process garments at assigned stages
- View own tasks
- Mark garments complete
- Cannot create batches or view analytics

### Store Manager / Director / General Manager
**Same as Workstation Manager** - Full oversight capabilities

### Front Desk / Cashier
**No workstation access** - Handles initial POS inspection only

---

## Order Workflow

### Complete Order Lifecycle

```
1. POS: Order Created (status: received)
   └─ Optional: Initial inspection with damage notes

2. Workstation: Detailed Inspection (status: inspection)
   └─ All garments inspected thoroughly
   └─ Condition assessment + damage documentation
   └─ Photos for major issues

3. Workstation: Queue (status: queued)
   └─ Awaiting batch assignment

4. Workstation: Washing (status: washing)
   └─ Batch processing with assigned staff

5. Workstation: Drying (status: drying)
   └─ Batch processing with assigned staff

6. Workstation: Ironing (status: ironing)
   └─ Individual garment processing

7. Workstation: Quality Check (status: quality_check)
   └─ Final inspection before packaging

8. Workstation: Packaging (status: packaging)
   └─ Prepare for collection/delivery

9. Ready (status: ready)
   └─ Order ready for customer collection or delivery
```

### Auto Status Transitions

The system automatically moves orders to the next stage when all garments complete their current stage. No manual status updates needed!

---

## User Guides by Role

## For Workstation Managers

### Dashboard Overview

Navigate to **Workstation** → **Overview** tab to see:

- **Pending Inspection**: Orders waiting for detailed inspection
- **In Queue**: Orders ready for batch processing
- **Active Batches**: Currently processing batches
- **In Process**: Orders at various processing stages

### Creating Processing Batches

**When to use**: After orders are inspected and in "queued" status

**Steps:**
1. Go to **Queue** tab
2. Select stage (Washing or Drying only)
3. Select orders to batch (use checkboxes)
4. Select staff to assign
5. Click **Create Batch**
6. Batch appears in **Active** tab as "Pending Start"

**Best Practices:**
- Group similar fabric types
- Don't exceed capacity (system tracks this)
- Assign experienced staff to delicate items

### Managing Staff Assignments

**Navigate to:** Workstation → **Staff** tab

**To Assign Staff:**
1. Select staff member from dropdown
2. Select stage (inspection, washing, drying, ironing, quality_check, packaging)
3. Click **Assign**

**To Remove Assignment:**
1. Find staff in current assignments list
2. Click **Remove** button

**Notes:**
- Staff can be assigned to multiple stages
- Assignments are permanent until removed
- Only workstation_staff role can be assigned

### Reviewing Major Issues

**When**: Garments with major damage flagged during inspection

**How to Review:**
1. Toast notification appears when major issue detected
2. Navigate to flagged order
3. Review inspection report:
   - Condition assessment
   - Missing buttons count
   - Stain details (location, type, severity)
   - Rip/tear details
   - Damage photos
   - Inspector name and timestamp
4. Adjust processing time if needed (additional minutes)
5. Click **Approve** to allow processing

**Important:** Major issues require photos. Orders won't proceed without manager approval.

### Viewing Performance Metrics

**Staff Performance Tab:**
- Select individual staff member
- View efficiency score (0-100)
- See orders processed and stages completed
- Review average time per stage
- Read performance insights

**Analytics Tab:**
- Total orders in progress
- Completed orders count
- Average processing time
- Major issues count
- Orders by stage distribution
- Bottleneck detection
- Active batches overview

**Use Cases:**
- Identify training needs
- Recognize top performers
- Optimize staffing allocation
- Address bottlenecks

---

## For Workstation Staff

### Performing Detailed Inspection

**Navigate to:** Workstation → **Inspection** tab

**Steps:**
1. Find your assigned order (shows POS inspection notes if available)
2. Click to expand order
3. Select garment to inspect
4. Fill out inspection form:
   - **Condition Assessment** (Required):
     - Good - No issues
     - Minor Issues - Standard handling
     - Major Issues - Requires manager review
   - **Missing Buttons**: Count and enter
   - **Stain Details**: Add each stain (location, type, severity)
   - **Rip/Tear Details**: Add each rip (location, size)
   - **Photos**: Upload for major issues (REQUIRED)
   - **Recommended Actions**: Check applicable options
   - **Additional Time**: Estimate extra processing time needed
5. Click **Submit Inspection**
6. Repeat for all garments
7. Order auto-moves to "queued" when all garments inspected

**Tips:**
- Be thorough - this affects customer expectations
- Photos are MANDATORY for major issues
- Check POS notes before starting
- Estimate time conservatively

### Processing at Your Assigned Stage

**For Washing & Drying (Batch Stages):**

**Navigate to:** Workstation → **Active** tab

**View your batches:**
- Batches show assigned staff
- See batch status (Pending Start / Processing)

**Start a Batch:**
1. Find batch in "Pending Start"
2. Click **Start Batch**
3. Orders move to stage status (washing/drying)

**Complete a Batch:**
1. Find batch in "In Progress"
2. Verify all items processed
3. Click **Complete Batch**
4. Orders auto-move to next stage

---

**For Ironing, Quality Check, Packaging (Individual Stages):**

**Navigate to:** Workstation → Your stage tab (not visible in main tabs, accessed via station interface)

**Process Garments:**
1. Find orders at your stage
2. Expand order to see garments
3. Review garment details:
   - Type, color, brand
   - Services required
   - Special instructions
   - Inspection notes (if any issues)
4. Complete garment processing
5. Click **Complete [Stage Name]** button
6. Order auto-moves to next stage when all garments done

**Quality Check Specifics:**
- Review inspection notes carefully
- Warning shown for garments with issues
- Verify all problems addressed
- Pass or reject garment

**Packaging Specifics:**
- Final stage before ready
- Check customer delivery address
- Follow packaging checklist:
  - ✓ Garment properly pressed
  - ✓ Protective cover applied
  - ✓ Customer tag attached
  - ✓ Order ID label attached
- Click **Complete Packaging**
- Order moves to READY status

---

## Common Tasks

### Checking Order Status

**Via Workstation Overview:**
1. Go to Overview tab
2. See distribution across all stages
3. Click stage to filter orders

**Via Pipeline (Managers Only):**
1. Navigate to Pipeline page
2. See Kanban board with all stages
3. Use filters for specific orders
4. View detailed order information

### Handling Delays

**If order is behind schedule:**
1. Manager checks Analytics → Bottleneck alerts
2. Identify stage with most orders
3. Assign additional staff to that stage
4. Consider prioritizing urgent orders

### Managing Customer Complaints

**Scenario: Customer says damage wasn't disclosed**

**Resolution:**
1. Manager checks order inspection report
2. Review photos and notes from inspection
3. Check if major issue was approved
4. Show customer timestamp and inspector name
5. Use documentation for transparency

### End-of-Day Operations

**For Staff:**
1. Complete all in-progress garments
2. Mark batches complete if done
3. Leave pending items for next shift
4. Report any issues to manager

**For Managers:**
1. Review Performance metrics
2. Check for bottlenecks
3. Plan next day staffing
4. Address any major issues

---

## Troubleshooting

### Order Not Moving to Next Stage

**Symptoms**: Completed all garments but order still at current stage

**Causes & Fixes:**
- **Not all garments complete**: Check each garment has handler tracked
- **Major issue pending**: Manager must approve before proceeding
- **System error**: Refresh page, check status history

### Cannot Create Batch

**Symptoms**: Create Batch button disabled or error message

**Causes & Fixes:**
- **No orders selected**: Must select at least one order
- **No staff selected**: Must assign staff to batch
- **Wrong stage**: Only washing/drying support batches
- **Orders not in queue**: Orders must be "queued" status
- **Permission denied**: Only managers can create batches

### Performance Metrics Not Showing

**Symptoms**: Empty performance dashboard

**Causes & Fixes:**
- **New staff member**: No data until they process orders
- **Wrong role**: Must be workstation_staff role
- **No stage handlers**: Staff must complete garments (not just be assigned)

### Photos Not Uploading

**Note**: Photo upload is currently a placeholder. Firebase Storage integration coming soon.

**Current Behavior**:
- System tracks photo count but doesn't store files
- Major issues still require photo acknowledgment
- Full functionality in next release

---

## Best Practices

### For Optimal Efficiency

**Batch Management:**
- Create batches in morning for washing
- Process drying batches same day
- Don't mix delicate and regular items
- Keep batch sizes consistent (easier planning)

**Staff Assignment:**
- Assign 2-3 staff per washing/drying batch
- Keep experienced staff on quality check
- Rotate staff across stages for flexibility
- Track performance to identify specialists

**Inspection Quality:**
- Always check POS notes first
- Document everything - better safe than sorry
- Photos prevent disputes later
- Conservative time estimates reduce delays

### Data Hygiene

**Managers Should:**
- Review analytics weekly
- Address bottlenecks immediately
- Remove inactive staff assignments
- Monitor average processing times

**Staff Should:**
- Mark garments complete immediately
- Don't batch complete - do real-time
- Report issues to manager promptly
- Keep inspection notes clear and concise

### Customer Communication

**Be Proactive:**
- Call customers if major issues found
- Set realistic expectations on time
- Document all communications
- Show inspection reports if questioned

**Use System Data:**
- Reference timestamp for transparency
- Show photos of damage
- Explain recommended actions
- Provide accurate completion estimates

---

## Support & Feedback

### Getting Help

**For Technical Issues:**
- Contact system administrator
- Report bugs via support channel
- Check this guide first

**For Process Questions:**
- Ask your manager
- Refer to this documentation
- Suggest improvements

### Feature Requests

Future enhancements tracked in `JERRY_TASKS.md`:
- Communications & Notifications Center
- Photo upload to Firebase Storage
- Receipt and order sheet printing
- Advanced analytics and reporting

---

## Quick Reference Card

### Keyboard Shortcuts
- No custom shortcuts (use browser defaults)

### Status Colors
- 🟡 **Inspection** - Amber
- 🔵 **Queued** - Blue
- 💧 **Washing** - Blue
- 🟠 **Drying** - Orange
- 🟣 **Ironing** - Purple
- 🟢 **Quality Check** - Green
- 🔷 **Packaging** - Indigo
- ✅ **Ready** - Green

### Role Hierarchy (Highest to Lowest)
1. Director
2. General Manager
3. Store Manager
4. Workstation Manager
5. Manager
6. Workstation Staff
7. Front Desk

### Contact Information
- **Technical Support**: [Contact System Admin]
- **Manager on Duty**: [Check shift schedule]
- **Emergency**: [Emergency protocol]

---

**End of User Guide**

*For implementation details and technical documentation, see `WORKSTATION_SYSTEM_PLAN.md`*
