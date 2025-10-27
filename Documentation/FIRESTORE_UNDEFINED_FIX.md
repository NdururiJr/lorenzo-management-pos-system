# Firestore Undefined Fields Fix

**Date:** October 25, 2025
**Issue:** Multiple Firestore errors with undefined field values
**Status:** ✅ Fixed

---

## 🐛 Problems Encountered

### Error 1: Order Creation
```
FirebaseError: Unsupported field value: undefined
(found in field paymentMethod in document orders/ORD-main-branch-20251025-0001)
```

**Location**: `lib/db/orders.ts` - `createOrder()` function

**Cause**: The function was saving `paymentMethod: data.paymentMethod`, but this field is undefined when creating an order from POS (it's only set after payment).

---

### Error 2: Transaction Creation
```
FirebaseError: Unsupported field value: undefined
(found in field pesapalRef in document transactions/TXN-MH5W5VKH-YBMPY)
```

**Location**: `lib/db/transactions.ts` - `createTransaction()` function

**Cause**: The function was saving optional fields like `pesapalRef`, `processedBy`, and `metadata` even when they were undefined.

---

## ✅ Solutions Applied

### Fix 1: Orders (`lib/db/orders.ts`)

**Before**:
```typescript
const order = {
  orderId,
  customerId: data.customerId,
  // ... other fields
  paymentMethod: data.paymentMethod,        // undefined!
  deliveryAddress: data.deliveryAddress,    // undefined!
  specialInstructions: data.specialInstructions, // undefined!
  // ... more fields
};

await setDocument('orders', orderId, order);
```

**After**:
```typescript
// Required fields only
const order: Record<string, any> = {
  orderId,
  customerId: data.customerId,
  // ... other required fields
  // NO undefined fields
};

// Add optional fields conditionally
if (data.paymentMethod !== undefined) {
  order.paymentMethod = data.paymentMethod;
}
if (data.deliveryAddress !== undefined) {
  order.deliveryAddress = data.deliveryAddress;
}
if (data.specialInstructions !== undefined) {
  order.specialInstructions = data.specialInstructions;
}

await setDocument('orders', orderId, order);
```

---

### Fix 2: Transactions (`lib/db/transactions.ts`)

**Before**:
```typescript
const transaction = {
  transactionId,
  orderId: data.orderId,
  // ... other fields
  pesapalRef: data.pesapalRef,      // undefined for cash!
  processedBy: data.processedBy,    // undefined sometimes!
  metadata: data.metadata,          // undefined!
  // ... more fields
};

await setDocument('transactions', transactionId, transaction);
```

**After**:
```typescript
// Required fields only
const transaction: Record<string, any> = {
  transactionId,
  orderId: data.orderId,
  customerId: data.customerId,
  amount: data.amount,
  method: data.method,
  status: data.status || 'pending',
  timestamp: Timestamp.now(),
  // NO undefined fields
};

// Add optional fields conditionally
if (data.pesapalRef !== undefined) {
  transaction.pesapalRef = data.pesapalRef;
}
if (data.processedBy !== undefined) {
  transaction.processedBy = data.processedBy;
}
if (data.metadata !== undefined) {
  transaction.metadata = data.metadata;
}

await setDocument('transactions', transactionId, transaction);
```

---

## 🎯 Key Lesson

### Firestore Rules:
- ✅ **Allowed**: Fields with values (string, number, boolean, object, array, null)
- ❌ **Not Allowed**: Fields with `undefined` value
- ✅ **Solution**: Omit undefined fields entirely

### Pattern to Follow:
```typescript
// ❌ WRONG: Includes undefined
const doc = {
  field1: value1,
  field2: undefined,  // Error!
};

// ✅ CORRECT: Conditional inclusion
const doc: Record<string, any> = {
  field1: value1,
};

if (field2 !== undefined) {
  doc.field2 = field2;
}
```

---

## 🧪 Testing

### Test Case 1: Create Order from POS
**Steps**:
1. Go to POS
2. Select customer
3. Add garments
4. Click "Create Order & Process Payment"

**Expected**: Order created successfully, Payment Modal opens

**Result**: ✅ Fixed

---

### Test Case 2: Process Cash Payment
**Steps**:
1. After creating order
2. In Payment Modal, select "Cash" tab
3. Enter amount
4. Click "Record Cash Payment"

**Expected**: Transaction created, payment recorded

**Result**: ✅ Fixed

---

## 📊 Impact

### Files Modified: 2
1. `lib/db/orders.ts` - `createOrder()` function
2. `lib/db/transactions.ts` - `createTransaction()` function

### Lines Changed: ~40 lines

### Breaking Changes: None
- All existing functionality preserved
- Just filtering out undefined values

---

## 🔄 Related Issues

### Also Added Better Error Logging
Updated `lib/db/index.ts` - `setDocument()` to log detailed errors:
```typescript
catch (error) {
  console.error(`setDocument error for ${collectionName}/${docId}:`, error);
  console.error('Data being saved:', data);
  throw new DatabaseError(/* ... */);
}
```

This helps debug future Firestore issues quickly.

---

## ✅ Status

- ✅ Order creation works
- ✅ Transaction creation works
- ✅ Cash payment workflow complete
- ⏳ Ready to test receipt generation

---

**Next Step**: Test the complete POS → Payment → Receipt workflow!