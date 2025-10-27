# Creating Test Orders in Firebase Console

This guide will help you manually create test orders in Firebase Console to populate the pipeline.

## Step 1: Access Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your Lorenzo Dry Cleaners project
3. Click **Firestore Database** in the left sidebar

## Step 2: Create Test Customers

Navigate to the `customers` collection (create it if it doesn't exist).

### Customer 1: Rachel Wangare
Click "Add document" and enter:
- **Document ID**: `CUST001` (auto-generate or use this)
- **Fields**:
  ```
  customerId: "CUST001"
  name: "Rachel Wangare"
  phone: "+254712345001"
  email: "rachel.wangare@example.com"
  addresses: [] (array)
  preferences: (map)
    - notifications: true
    - language: "en"
  createdAt: (timestamp) [use current timestamp]
  orderCount: 0
  totalSpent: 0
  ```

### Customer 2: Kelvin Kamau
- **Document ID**: `CUST002`
- **Fields**:
  ```
  customerId: "CUST002"
  name: "Kelvin Kamau"
  phone: "+254723456002"
  email: "kelvin.kamau@example.com"
  addresses: []
  preferences: (map)
    - notifications: true
    - language: "en"
  createdAt: (timestamp) [current timestamp]
  orderCount: 0
  totalSpent: 0
  ```

### Customer 3: Rose Reeves Wangechi
- **Document ID**: `CUST003`
- **Fields**:
  ```
  customerId: "CUST003"
  name: "Rose Reeves Wangechi"
  phone: "+254734567003"
  email: "rose.wangechi@example.com"
  addresses: []
  preferences: (map)
    - notifications: true
    - language: "en"
  createdAt: (timestamp) [current timestamp]
  orderCount: 0
  totalSpent: 0
  ```

**Repeat** for 7-10 more customers with Kenyan names.

---

## Step 3: Create Test Orders

Navigate to the `orders` collection (create it if it doesn't exist).

### Order Template

Here's a template for creating orders. Create 15-20 orders, varying the status, garments, and customers.

#### Order 1 - Status: received
- **Document ID**: `WESTLANDS202510190001`
- **Fields**:
  ```
  orderId: "WESTLANDS202510190001"
  customerId: "CUST001"
  customerName: "Rachel Wangare"
  customerPhone: "+254712345001"
  branchId: "WESTLANDS"
  status: "received"
  garments: (array of maps)
    [0]:
      garmentId: "WESTLANDS202510190001G01"
      type: "Shirt"
      color: "White"
      services: ["Dry Clean", "Iron"]
      price: 300
      status: "received"
    [1]:
      garmentId: "WESTLANDS202510190001G02"
      type: "Pants"
      color: "Black"
      services: ["Dry Clean", "Iron"]
      price: 350
      status: "received"
  totalAmount: 650
  paidAmount: 650
  paymentStatus: "paid"
  paymentMethod: "cash"
  estimatedCompletion: (timestamp) [2 days from now]
  createdAt: (timestamp) [current timestamp]
  createdBy: "seed-user"
  statusHistory: (array of maps)
    [0]:
      status: "received"
      timestamp: (timestamp) [current timestamp]
      updatedBy: "seed-user"
  updatedAt: (timestamp) [current timestamp]
  ```

#### Order 2 - Status: washing
- **Document ID**: `WESTLANDS202510190002`
- Change: `status: "washing"`, `customerName: "Kelvin Kamau"`, `customerId: "CUST002"`
- Add another entry to `statusHistory`:
  ```
  [1]:
    status: "washing"
    timestamp: (timestamp) [current timestamp]
    updatedBy: "seed-user"
  ```

#### Order 3 - Status: drying
- **Document ID**: `WESTLANDS202510190003`
- `status: "drying"`, `customerName: "Rose Reeves Wangechi"`, `customerId: "CUST003"`

#### Order 4 - Status: ironing
- **Document ID**: `WESTLANDS202510190004`
- `status: "ironing"`

#### Order 5 - Status: quality_check
- **Document ID**: `WESTLANDS202510190005`
- `status: "quality_check"`

#### Order 6 - Status: packaging
- **Document ID**: `WESTLANDS202510190006`
- `status: "packaging"`

#### Order 7 - Status: ready
- **Document ID**: `WESTLANDS202510190007`
- `status: "ready"`

#### Order 8 - Status: out_for_delivery
- **Document ID**: `WESTLANDS202510190008`
- `status: "out_for_delivery"`

###  Tips

1. **Vary the garment types**: Shirt, Dress, Suit, Jacket, Pants, Skirt, etc.
2. **Vary the colors**: White, Black, Blue, Navy, Gray, Beige
3. **Vary the services**: "Wash", "Dry Clean", "Iron", "Starch", "Express"
4. **Vary payment status**: "paid", "partial", "pending"
5. **Vary payment methods**: "cash", "mpesa", "card", "credit"
6. **Vary totals**: 500-5000 KES range

### Quick Fill Values

**Service combinations**:
- Dry Clean + Iron = 300 KES
- Wash + Iron = 200 KES
- Dry Clean + Iron + Starch = 350 KES
- Wash Only = 150 KES

**Garment examples**:
1. Shirt (White) - Dry Clean, Iron - 300 KES
2. Dress (Blue) - Dry Clean, Iron, Starch - 400 KES
3. Suit (Navy) - Dry Clean, Iron - 500 KES
4. Pants (Black) - Wash, Iron - 200 KES
5. Jacket (Gray) - Dry Clean - 250 KES

---

## Step 4: Verify in Pipeline

1. Start the development server: `npm run dev`
2. Log in to the app
3. Navigate to the Pipeline page
4. You should see your test orders organized by status!

---

## Notes

- Document IDs cannot contain slashes `/`. Use alphanumeric characters only.
- Timestamps: Use Firebase Console's timestamp picker
- Arrays and Maps: Click "Add field" and select the appropriate type
- Be consistent with customerIds across orders and the customers collection

Happy testing! 🎉
