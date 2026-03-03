# Phase 1: CSV/Excel Inventory Import

## Priority: HIGHEST
## Status: Not Started
## Goal: Remove the #1 seller objection — "I already have inventory in my POS/spreadsheet"

---

## 1. PROBLEM STATEMENT

During real demos, 70% of sellers said they already have inventory in their POS system or Excel sheets. Asking them to manually re-add 100-500 products in SatyaSell is the biggest barrier to adoption.

**Solution**: Let sellers upload a CSV/Excel file and auto-import all products in one go.

---

## 2. USER STORIES

1. **As a seller**, I want to upload my existing product spreadsheet so I don't have to add products one by one.
2. **As a seller**, I want to map my spreadsheet columns to SatyaSell fields in case my column names are different.
3. **As a seller**, I want to preview imported products before confirming so I can catch errors.
4. **As a seller**, I want to download a sample template so I know the expected format.
5. **As a seller**, I want to see a summary of what was imported (success count, error count, skipped).
6. **As a seller**, I want to import products with variants (sizes, colors) from my spreadsheet.
7. **As a seller**, I want to import products with image URLs from my spreadsheet.
8. **As a seller**, I want to re-import a file and have existing products updated (matched by SKU) instead of duplicated.

---

## 3. UI/UX DESIGN

### 3.1 Entry Point
- **Location**: `/client/products` page — add an "Import Products" button next to "Add Product"
- **Button**: Outline style with upload icon — "Import from CSV/Excel"
- **Navigates to**: `/client/products/import`

### 3.2 Import Page (`/client/products/import`) — 4 Steps

#### Step 1: Upload File
```
┌──────────────────────────────────────────────┐
│  Import Products from CSV/Excel              │
│                                              │
│  ┌────────────────────────────────────────┐  │
│  │                                        │  │
│  │     📄 Drag & drop your file here      │  │
│  │        or click to browse              │  │
│  │                                        │  │
│  │     Supports: .csv, .xlsx, .xls        │  │
│  │     Max: 5000 products per file        │  │
│  │                                        │  │
│  └────────────────────────────────────────┘  │
│                                              │
│  📥 Download sample template (CSV)           │
│  📥 Download sample template (Excel)         │
│                                              │
│  ─────────────────────────────────────────── │
│  TIPS:                                       │
│  - Your file should have columns for:        │
│    Product Name, Price, Category (optional),  │
│    Stock Quantity (optional), Description     │
│    (optional), SKU (optional)                │
│  - First row should be column headers        │
│  - Images can be added after import          │
└──────────────────────────────────────────────┘
```

#### Step 2: Column Mapping
After file is parsed, show column mapping UI:
```
┌──────────────────────────────────────────────┐
│  Map Your Columns                            │
│  We detected 8 columns in your file.         │
│  Match them to SatyaSell fields:             │
│                                              │
│  Your Column          →  SatyaSell Field     │
│  ─────────────────────────────────────────── │
│  "Product Title"      →  [Product Name ▾]    │  ← Auto-matched
│  "MRP"                →  [Base Price   ▾]    │  ← Auto-matched
│  "Item Category"      →  [Category     ▾]    │  ← Auto-matched
│  "Qty Available"      →  [Stock Qty    ▾]    │  ← Auto-matched
│  "Item Code"          →  [SKU          ▾]    │
│  "Brand Name"         →  [Brand        ▾]    │
│  "Details"            →  [Description  ▾]    │
│  "Wholesale Price"    →  [-- Skip --   ▾]    │  ← Not needed
│                                              │
│  Required: Product Name, Base Price          │
│  Optional: Category, Stock, SKU, Brand,      │
│            Description                       │
│                                              │
│       [← Back]              [Preview →]      │
└──────────────────────────────────────────────┘
```

**Auto-matching logic**: Match common column names:
- "name", "product", "title", "item" → Product Name
- "price", "mrp", "cost", "rate" → Base Price
- "category", "type", "group" → Category
- "stock", "qty", "quantity", "available" → Stock Quantity
- "sku", "code", "item code", "barcode" → SKU
- "brand", "manufacturer" → Brand
- "description", "details", "info" → Description
- "image", "photo", "image url", "picture" → Image URL
- "size", "variant", "color", "option" → Variant Name

#### Step 3: Preview & Validate
```
┌──────────────────────────────────────────────┐
│  Preview Import                              │
│                                              │
│  Total: 247 products                         │
│  ✅ Valid: 239  ⚠️ Warnings: 5  ❌ Errors: 3 │
│                                              │
│  ┌────┬──────────┬───────┬─────┬─────┬────┐ │
│  │ #  │ Name     │ Price │ Cat │ Qty │ ⚠  │ │
│  ├────┼──────────┼───────┼─────┼─────┼────┤ │
│  │ 1  │ Red Kurti│ ₹599  │Women│ 50  │ ✅ │ │
│  │ 2  │ Blue Jean│ ₹899  │ Men │ 30  │ ✅ │ │
│  │ 3  │ Watch    │ ₹0    │ Acc │ 10  │ ⚠️  │ │ ← Price is 0
│  │ 4  │          │ ₹299  │ Acc │ 20  │ ❌ │ │ ← No name
│  │ 5  │ Shoes   │ ₹1299 │Foot │ -5  │ ⚠️  │ │ ← Negative stock
│  │... │ ...      │ ...   │ ... │ ... │ .. │ │
│  └────┴──────────┴───────┴─────┴─────┴────┘ │
│                                              │
│  Showing 1-20 of 247 (use pagination)        │
│                                              │
│  ❌ 3 products will be SKIPPED (missing       │
│     required fields)                         │
│  ⚠️ 5 products have WARNINGS (will import     │
│     but please review)                       │
│                                              │
│  [← Back]     [Import 244 Products →]        │
└──────────────────────────────────────────────┘
```

**Validation Rules**:
- **Error (skip)**: Missing product name, missing price, price is not a number
- **Warning (import anyway)**: Price is 0, stock is negative or 0, duplicate SKU, name too long (>200 chars)
- **Auto-fix**: Trim whitespace, remove currency symbols from price, convert "N/A" stock to 0

#### Step 4: Import Result
```
┌──────────────────────────────────────────────┐
│  Import Complete! 🎉                         │
│                                              │
│  ✅ 239 products imported successfully       │
│  ⚠️ 5 products imported with warnings        │
│  ❌ 3 products skipped (errors)              │
│                                              │
│  📥 Download error report (CSV)              │
│                                              │
│  [View Products]    [Import More]            │
└──────────────────────────────────────────────┘
```

---

## 4. DATABASE SCHEMA CHANGES

### No new tables needed!

Existing `Product` table already supports all fields:
```prisma
model Product {
  id                String        @id @default(uuid())
  tenantId          String        @map("tenant_id")
  name              String          ← from CSV
  brand             String?         ← from CSV (optional)
  description       String?         ← from CSV (optional)
  category          String?         ← from CSV (optional)
  basePrice         Decimal         ← from CSV (required)
  sku               String?         ← from CSV (optional)
  stockQuantity     Int             ← from CSV (optional, default 0)
  lowStockThreshold Int             ← default 10
  images            Json            ← empty [] (added later)
  status            ProductStatus   ← default 'active'
}
```

### Optional: Add import tracking
```prisma
model ImportLog {
  id            String   @id @default(uuid())
  tenantId      String   @map("tenant_id")
  fileName      String   @map("file_name")
  totalRows     Int      @map("total_rows")
  successCount  Int      @map("success_count")
  errorCount    Int      @map("error_count")
  warningCount  Int      @map("warning_count")
  errorDetails  Json?    @map("error_details")  // [{row: 4, error: "Missing name"}]
  createdAt     DateTime @default(now()) @map("created_at")

  tenant Tenant @relation(fields: [tenantId], references: [id], onDelete: Cascade)

  @@index([tenantId])
  @@map("import_logs")
}
```

---

## 5. TECHNICAL IMPLEMENTATION

### 5.1 New Files to Create

```
app/client/products/import/page.tsx        # Import wizard page (4 steps)
app/api/client/products/import/route.ts    # POST: Process import
app/api/client/products/import/template/route.ts  # GET: Download sample template
components/import/csv-upload.tsx            # Drag & drop file upload
components/import/column-mapper.tsx         # Column mapping UI
components/import/import-preview.tsx        # Preview table with validation
lib/import/csv-parser.ts                   # Parse CSV/Excel files
lib/import/validators.ts                   # Validation rules
```

### 5.2 Dependencies to Add
```json
{
  "xlsx": "^0.18.5",        // Parse Excel files (.xlsx, .xls)
  "papaparse": "^5.4.1"     // Parse CSV files (browser-side)
}
```

Note: CSV parsing will happen **client-side** (in browser) using PapaParse for instant preview. Excel parsing will use `xlsx` library. Only validated data is sent to the server API.

### 5.3 API Design

#### POST `/api/client/products/import`
```typescript
// Request body
{
  importMode: 'skip_duplicates' | 'update_existing' | 'allow_all';
  products: [
    {
      name: string;          // required
      basePrice: number;     // required
      brand?: string;
      description?: string;
      category?: string;
      sku?: string;
      stockQuantity?: number; // default 0
      imageUrl?: string;     // optional — downloaded in background
      variants?: [           // optional — if variant column mapped
        {
          variantName: string;
          price: number;
          stockQuantity: number;
          attributes: Record<string, string>;  // e.g., {"Size": "M", "Color": "Red"}
        }
      ];
    }
  ]
}

// Response
{
  success: true,
  created: 200,
  updated: 39,       // only when importMode = 'update_existing'
  skipped: 3,
  warnings: 5,
  imagesPending: 180, // images queued for background download
  errors: [
    { row: 4, field: "name", message: "Product name is required" }
  ]
}
```

**Server-side processing**:
- Validate all products again (don't trust client-side validation alone)
- Use `prisma.product.createMany()` for bulk insert (fast)
- Batch in chunks of 100 to avoid timeout
- Check for duplicate SKUs within tenant
- Return detailed error report

### 5.4 Sample Template

CSV template columns:
```csv
Product Name,Price,Category,Stock Quantity,SKU,Brand,Description
Red Cotton Kurti,599,Women's Clothing,50,SKU001,FabIndia,Beautiful red cotton kurti with embroidery
Blue Slim Jeans,899,Men's Clothing,30,SKU002,Levi's,Slim fit blue denim jeans
```

Excel template: Same columns with formatted headers and sample data in first row.

### 5.5 Validation Logic (`lib/import/validators.ts`)

```typescript
interface ValidationResult {
  status: 'valid' | 'warning' | 'error';
  issues: string[];
}

// Rules:
// ERROR (skip row):
//   - name is empty/missing
//   - price is empty/missing or not a number
//   - price is negative

// WARNING (import but flag):
//   - price is 0
//   - stock is negative (set to 0)
//   - name > 200 characters (truncate)
//   - duplicate SKU within file
//   - SKU already exists in tenant's products

// AUTO-FIX:
//   - Trim whitespace from all fields
//   - Remove ₹, Rs, Rs., INR from price
//   - Remove commas from price (1,299 → 1299)
//   - Convert empty stock to 0
//   - Convert "N/A", "NA", "-" stock to 0
```

---

## 6. VARIANT IMPORT HANDLING

### The Problem
Sellers often have spreadsheets where variants are separate rows:
```csv
Product Name,Size,Color,Price,Stock,SKU
Red Kurti,S,Red,599,10,RK-S
Red Kurti,M,Red,599,20,RK-M
Red Kurti,L,Red,649,15,RK-L
Blue Kurti,S,Blue,599,10,BK-S
Blue Kurti,M,Blue,599,25,BK-M
```

### Solution: Smart Grouping

#### Step 1: Detect Variant Columns
If the user maps a column to "Variant Name" (size, color, etc.), enable variant grouping mode.

#### Step 2: Group by Product Name
```
Red Kurti → 3 variants (S, M, L)
Blue Kurti → 2 variants (S, M)
```

#### Step 3: Create Product + Variants
- Base product: `name = "Red Kurti"`, `basePrice = 599` (first variant price)
- Variants: `[{variantName: "S", price: 599, stock: 10}, {variantName: "M", ...}]`

#### Column Mapping for Variants
```
Your Column          →  SatyaSell Field
"Product Name"       →  [Product Name ▾]
"Size"               →  [Variant Name ▾]    ← NEW mapping option
"Color"              →  [Variant Attribute ▾] ← NEW (optional second attribute)
"Price"              →  [Base Price ▾]
"Stock"              →  [Stock Qty ▾]
```

#### Preview with Variants
```
┌─────┬────────────┬──────────────────┬───────┬─────┬────┐
│  #  │ Name       │ Variants         │ Price │ Qty │ ⚠  │
├─────┼────────────┼──────────────────┼───────┼─────┼────┤
│  1  │ Red Kurti  │ S, M, L (3)      │ ₹599  │ 45  │ ✅ │
│  2  │ Blue Kurti │ S, M (2)         │ ₹599  │ 35  │ ✅ │
└─────┴────────────┴──────────────────┴───────┴─────┴────┘
Products: 2  |  Total Variants: 5
```

#### Implementation Note
- Variant grouping is OPTIONAL — if no variant column is mapped, import as flat products (current behavior)
- If different variants of the same product have different prices, use the lowest as `basePrice` and store individual prices on each variant
- Group by exact product name match (case-insensitive, trimmed)

---

## 7. IMAGE URL IMPORT

### Support for Image URLs in CSV

Some sellers' spreadsheets include image URLs:
```csv
Product Name,Price,Image URL
Red Kurti,599,https://example.com/red-kurti.jpg
Blue Jeans,899,https://cdn.shop.com/jeans-1.jpg
```

### Implementation
1. If user maps a column to "Image URL", extract URLs
2. Validate URL format (must start with http/https)
3. Download images **after** products are created (background job)
4. Upload to Supabase Storage and update product `images` field
5. Show progress: "Importing images... 42/244"

### Edge Cases
- Invalid URL → skip image, import product without image
- URL returns 404 → skip, log warning
- URL returns non-image content → skip
- Very large image (>5MB) → resize before uploading
- Multiple image columns → support comma-separated URLs in one cell

### Why Background Processing
Downloading 500 images synchronously would timeout. Instead:
1. Create all products first (fast, via `createMany`)
2. Queue image downloads as background task
3. Show "Products imported! Images are being downloaded..." message
4. Dashboard shows image sync progress

---

## 8. RE-IMPORT / UPDATE EXISTING PRODUCTS

### The Problem
Seller imports 500 products. A week later, prices change and new products are added.
If they import again, should we create 500 duplicates?

### Solution: SKU-Based Matching

#### Import Mode Selection (Step 1 of wizard)
```
┌──────────────────────────────────────────────┐
│  Import Mode:                                │
│                                              │
│  ○ Create new products (skip duplicates)     │  ← Default
│    Products with existing SKUs will be       │
│    skipped to avoid duplicates.              │
│                                              │
│  ○ Update existing + create new              │
│    Products matched by SKU will be UPDATED   │
│    (price, stock, description). New SKUs     │
│    will be created as new products.          │
│                                              │
│  ○ Create all (allow duplicates)             │
│    Every row creates a new product,          │
│    even if SKU already exists.               │
└──────────────────────────────────────────────┘
```

#### Update Logic
When "Update existing + create new" is selected:
1. For each row, check if SKU exists in tenant's products
2. If SKU exists → `prisma.product.update()` with new price, stock, description
3. If SKU doesn't exist → `prisma.product.create()` new product
4. Products without SKU → always created as new

#### Preview Shows Update Status
```
┌────┬──────────┬───────┬─────┬──────────┐
│ #  │ Name     │ Price │ SKU │ Action   │
├────┼──────────┼───────┼─────┼──────────┤
│ 1  │ Red Kurti│ ₹649  │RK01 │ 🔄 UPDATE│ ← Price changed 599→649
│ 2  │ Blue Jean│ ₹899  │BJ01 │ ✅ NO CHG │ ← Same as existing
│ 3  │ New Watch│ ₹1299 │NW01 │ 🆕 CREATE│ ← New product
│ 4  │ Sneakers │ ₹2499 │     │ 🆕 CREATE│ ← No SKU, always new
└────┴──────────┴───────┴─────┴──────────┘

Summary: 1 updated, 1 unchanged, 2 new
```

---

## 9. TESTING REQUIREMENTS

### 9.1 Unit Tests
- CSV parser: handles various delimiters (comma, semicolon, tab)
- CSV parser: handles UTF-8 characters (Hindi product names)
- Validator: catches all error conditions
- Validator: auto-fixes work correctly
- Column mapper: auto-matching logic
- Variant grouping: groups rows by product name correctly
- Variant grouping: handles different prices per variant
- Image URL validation: accepts valid URLs, rejects invalid
- SKU matching: finds existing products by SKU

### 9.2 Integration Tests
- Upload CSV → parse → validate → preview → import → verify in DB
- Upload Excel → same flow
- Large file (5000 rows) performance test
- Duplicate SKU handling (all 3 modes: skip, update, allow)
- Error report download
- Variant import: CSV with size/color columns → product + variants created
- Image URL import: products created → images downloaded in background
- Re-import with "Update existing": prices/stock updated, new products created

### 9.3 Edge Cases to Handle
- Empty file
- File with only headers, no data
- File with 5000+ rows (show error: max 5000)
- Columns in different order
- Extra columns not in our schema (ignore gracefully)
- Mixed encoding (UTF-8, UTF-16, Windows-1252)
- Numbers formatted with Indian comma system (1,00,000)
- Price with currency symbol (₹599, Rs 599, INR 599)
- Variant rows with inconsistent product names ("Red Kurti" vs "red kurti")
- Image URL that returns 404 or non-image content
- Re-import where some SKUs match and some don't
- CSV with comma inside quoted fields ("Cotton Kurti, Embroidered")

---

## 7. UI/UX SPECIFICATIONS

### Colors & Style
- Follow existing SatyaSell dashboard theme
- Success: green-500
- Warning: yellow-500
- Error: red-500
- Upload area: dashed border, light gray background

### Mobile Responsiveness
- Import page should work on mobile (sellers may use phone)
- Column mapper: stack vertically on mobile (Your Column → SatyaSell Field)
- Preview table: horizontal scroll on mobile
- File upload: tap to open file picker (no drag & drop on mobile)

### Loading States
- File parsing: "Analyzing your file..." with spinner
- Import in progress: Progress bar with count (e.g., "Importing 142/244...")
- Large files: Show estimated time

### Error Handling
- Invalid file type: "Please upload a CSV or Excel file (.csv, .xlsx, .xls)"
- File too large: "File exceeds 5MB. Please split into smaller files."
- Too many rows: "Maximum 5000 products per import. Your file has 7200 rows."
- Network error during import: "Import interrupted. 142 of 244 products were imported. You can import the remaining products by uploading again."

---

## 8. ACCEPTANCE CRITERIA

- [ ] Seller can upload .csv, .xlsx, .xls files
- [ ] Columns are auto-matched with manual override option
- [ ] Preview shows all products with validation status
- [ ] Products with errors are skipped with clear error messages
- [ ] Products with warnings are imported with flags
- [ ] Bulk insert completes in under 10 seconds for 500 products
- [ ] Sample template is downloadable
- [ ] Error report is downloadable as CSV
- [ ] Import history is logged
- [ ] Existing products are not duplicated (SKU check)
- [ ] Works on mobile browser
- [ ] Hindi/regional product names are handled correctly
- [ ] Variant import: rows grouped by product name, variants created
- [ ] Image URL import: images downloaded and uploaded to Supabase
- [ ] Re-import mode: existing products updated by SKU match
- [ ] Three import modes available: skip duplicates / update existing / allow all

---

## 9. MODIFIED FILES

### Existing files to modify:
1. `app/client/products/page.tsx` — Add "Import" button
2. `prisma/schema.prisma` — Add ImportLog model (optional)
3. `package.json` — Add xlsx, papaparse dependencies

### New files to create:
1. `app/client/products/import/page.tsx`
2. `app/api/client/products/import/route.ts`
3. `app/api/client/products/import/template/route.ts`
4. `components/import/csv-upload.tsx`
5. `components/import/column-mapper.tsx`
6. `components/import/import-preview.tsx`
7. `lib/import/csv-parser.ts`
8. `lib/import/validators.ts`
