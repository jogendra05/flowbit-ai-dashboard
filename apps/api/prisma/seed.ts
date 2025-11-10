// apps/api/prisma/seed.ts
import { PrismaClient } from '../src/generated/prisma';
import * as fs from 'fs';
import * as path from 'path';
import { dirname } from 'path';
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const prisma = new PrismaClient();

interface RawInvoiceData {
  _id: string;
  name: string;
  filePath?: string;
  fileSize?: { $numberLong?: string };
  fileType?: string;
  status?: string;
  organizationId?: string;
  departmentId?: string;
  createdAt?: { $date?: string };
  updatedAt?: { $date?: string };
  isValidatedByHuman?: boolean;
  uploadedById?: string;
  assignedToId?: string;
  extractedData?: {
    llmData?: any;
  };
}

// Helper function to safely extract values from nested LLM data
function safeGetValue(obj: any): any {
  if (obj && typeof obj === 'object' && 'value' in obj) {
    return obj.value;
  }
  return obj;
}

// Helper function to parse dates
function parseDate(dateObj: any): Date | null {
  if (!dateObj) return null;
  if (typeof dateObj === 'string') return new Date(dateObj);
  if (dateObj.$date) return new Date(dateObj.$date);
  return null;
}

// Helper function to parse numbers
function parseNumber(value: any): number | null {
  if (value === null || value === undefined || value === '') return null;
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return isNaN(num) ? null : num;
}

async function main() {
  console.log('🚀 Starting data migration...');

  // Read JSON file
  const jsonPath = path.join(__dirname, 'Analytics_Test_Data.json');
  if (!fs.existsSync(jsonPath)) {
    console.error(`❌ Could not find data file at ${jsonPath}`);
    process.exit(1);
  }
  const rawData: RawInvoiceData[] = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

  console.log(`📊 Found ${rawData.length} records to process`);

  // Step 1: Create Organizations
  console.log('\n📦 Step 1: Creating Organizations...');
  const orgIds = new Set(rawData.map(r => r.organizationId).filter(Boolean));
  const orgMap = new Map<string, string>();

  for (const orgId of orgIds) {
    const org = await prisma.organization.upsert({
      where: { id: orgId as string },
      update: {},
      create: {
        id: orgId as string,
        name: `Organization ${orgId?.substring(0, 8)}`,
      },
    });
    orgMap.set(orgId as string, org.id);
  }
  console.log(`✓ Created ${orgMap.size} organizations`);

  // Step 2: Create Departments
  console.log('\n📦 Step 2: Creating Departments...');
  const deptIds = new Set(rawData.map(r => r.departmentId).filter(Boolean));
  const deptMap = new Map<string, string>();

  for (const deptId of deptIds) {
    const record = rawData.find(r => r.departmentId === deptId);
    const dept = await prisma.department.upsert({
      where: { id: deptId as string },
      update: {},
      create: {
        id: deptId as string,
        name: `Department ${deptId?.substring(0, 8)}`,
        organizationId: record?.organizationId as string,
      },
    });
    deptMap.set(deptId as string, dept.id);
  }
  console.log(`✓ Created ${deptMap.size} departments`);

  // Step 3: Create Users
  console.log('\n📦 Step 3: Creating Users...');
  const userIds = new Set([
    ...rawData.map(r => r.uploadedById),
    ...rawData.map(r => r.assignedToId),
  ].filter(Boolean));
  const userMap = new Map<string, string>();

  for (const userId of userIds) {
    const user = await prisma.user.upsert({
      where: { id: userId as string },
      update: {},
      create: {
        id: userId as string,
        name: `User ${userId?.substring(0, 8)}`,
        email: `user-${userId?.substring(0, 8)}@example.com`,
      },
    });
    userMap.set(userId as string, user.id);
  }
  console.log(`✓ Created ${userMap.size} users`);

  // Step 4: Create Vendors (safe handling when taxId is null)
  console.log('\n📦 Step 4: Creating Vendors...');
  const vendorMap = new Map<string, string>();

  for (const record of rawData) {
    const llmData = record.extractedData?.llmData;
    if (!llmData || typeof llmData !== 'object') continue;

    const vendorData = llmData.vendor;
    if (!vendorData || typeof vendorData !== 'object') continue;

    const vendorValue = vendorData.value;
    if (!vendorValue || typeof vendorValue !== 'object') continue;

    const vendorName = safeGetValue(vendorValue.vendorName);
    const vendorTaxId = safeGetValue(vendorValue.vendorTaxId);
    const vendorAddress = safeGetValue(vendorValue.vendorAddress);
    const vendorPartyNumber = safeGetValue(vendorValue.vendorPartyNumber);

    if (!vendorName) continue;

    const vendorKey = `${vendorName}|${vendorTaxId ?? 'NO_TAX_ID'}`;

    if (!vendorMap.has(vendorKey)) {
      let vendor;
      if (vendorTaxId == null) {
        // taxId is null — can't use compound upsert with null in `where`
        vendor = await prisma.vendor.findFirst({
          where: { name: vendorName, taxId: null },
        });

        if (!vendor) {
          vendor = await prisma.vendor.create({
            data: {
              name: vendorName,
              address: vendorAddress || null,
              taxId: null,
              partyNumber: vendorPartyNumber || null,
            },
          });
        }
      } else {
        // taxId present — safe to use upsert on the unique compound 'name_taxId'
        vendor = await prisma.vendor.upsert({
          where: {
            name_taxId: {
              name: vendorName,
              taxId: String(vendorTaxId),
            },
          },
          update: {},
          create: {
            name: vendorName,
            address: vendorAddress || null,
            taxId: String(vendorTaxId),
            partyNumber: vendorPartyNumber || null,
          },
        });
      }

      vendorMap.set(vendorKey, vendor.id);
    }
  }
  console.log(`✓ Created ${vendorMap.size} vendors`);

  // Step 5: Create Customers
  console.log('\n📦 Step 5: Creating Customers...');
  const customerMap = new Map<string, string>();

  for (const record of rawData) {
    const llmData = record.extractedData?.llmData;
    if (!llmData || typeof llmData !== 'object') continue;

    const customerData = llmData.customer;
    if (!customerData || typeof customerData !== 'object') continue;

    const customerValue = customerData.value;
    if (!customerValue || typeof customerValue !== 'object') continue;

    const customerName = safeGetValue(customerValue.customerName);
    const customerAddress = safeGetValue(customerValue.customerAddress);

    if (!customerName) continue;

    if (!customerMap.has(customerName)) {
      const customer = await prisma.customer.upsert({
        where: { name: customerName },
        update: {},
        create: {
          name: customerName,
          address: customerAddress || null,
        },
      });
      customerMap.set(customerName, customer.id);
    }
  }
  console.log(`✓ Created ${customerMap.size} customers`);

  // Step 6: Create Invoices, Line Items, and Payments
  console.log('\n📦 Step 6: Creating Invoices with Line Items and Payments...');
  let invoiceCount = 0;
  let lineItemCount = 0;
  let paymentCount = 0;

  for (const record of rawData) {
    const llmData = record.extractedData?.llmData;
    if (!llmData || typeof llmData !== 'object') {
      console.warn(`⚠️  Skipping record ${record._id} - no valid llmData`);
      continue;
    }

    // Extract invoice data
    const invoiceValue = llmData.invoice?.value || {};
    const summaryValue = llmData.summary?.value || {};
    const vendorValue = llmData.vendor?.value || {};
    const customerValue = llmData.customer?.value || {};
    const paymentValue = llmData.payment?.value || {};

    // Get vendor and customer IDs
    const vendorName = safeGetValue(vendorValue.vendorName);
    const vendorTaxId = safeGetValue(vendorValue.vendorTaxId);
    const vendorKey = vendorName ? `${vendorName}|${vendorTaxId ?? 'NO_TAX_ID'}` : null;
    const vendorId = vendorKey ? vendorMap.get(vendorKey) : null;

    const customerName = safeGetValue(customerValue.customerName);
    const customerId = customerName ? customerMap.get(customerName) : null;

    // Map status
    let status = 'PROCESSED';
    if (record.status === 'processed' && record.isValidatedByHuman) {
      status = 'VALIDATED';
    } else if (record.status === 'pending') {
      status = 'PENDING';
    }

    // Create invoice
    const invoice = await prisma.invoice.create({
      data: {
        documentId: record._id,
        fileName: record.name,
        filePath: record.filePath || null,
        fileSize: record.fileSize?.$numberLong ? BigInt(record.fileSize.$numberLong) : null,
        fileType: record.fileType || null,
        status: status as any,
        invoiceNumber: safeGetValue(invoiceValue.invoiceId) || null,
        invoiceDate: parseDate(safeGetValue(invoiceValue.invoiceDate)),
        deliveryDate: parseDate(safeGetValue(invoiceValue.deliveryDate)),
        documentType: safeGetValue(summaryValue.documentType) || null,
        subTotal: parseNumber(safeGetValue(summaryValue.subTotal)),
        totalTax: parseNumber(safeGetValue(summaryValue.totalTax)),
        total: parseNumber(safeGetValue(summaryValue.invoiceTotal)),
        currency: safeGetValue(summaryValue.currencySymbol) || 'EUR',
        isValidated: record.isValidatedByHuman || false,
        organizationId: record.organizationId as string,
        departmentId: record.departmentId as string,
        vendorId: vendorId || null,
        customerId: customerId || null,
        uploadedById: record.uploadedById || null,
        assignedToId: record.assignedToId || null,
        createdAt: parseDate(record.createdAt) || new Date(),
        updatedAt: parseDate(record.updatedAt) || new Date(),
      },
    });
    invoiceCount++;

    // Create line items
    const lineItemsData = llmData.lineItems?.value?.items;
    const items = safeGetValue(lineItemsData);

    if (Array.isArray(items)) {
      for (const item of items) {
        if (typeof item !== 'object') continue;

        // Ensure sachkonto is a string or null (schema expects String | Null)
        const sachkontoRaw = safeGetValue(item.Sachkonto);
        const sachkonto = sachkontoRaw == null ? null : String(sachkontoRaw);

        const srNo = parseNumber(safeGetValue(item.srNo));
        const quantity = parseNumber(safeGetValue(item.quantity));
        const unitPrice = parseNumber(safeGetValue(item.unitPrice));
        const totalPrice = parseNumber(safeGetValue(item.totalPrice));

        await prisma.lineItem.create({
          data: {
            invoiceId: invoice.id,
            srNo: srNo === null ? null : Math.trunc(srNo), // ensure integer if present
            description: safeGetValue(item.description) || null,
            category: safeGetValue(item.description) || null, // Using description as category
            quantity: quantity === null ? null : quantity,
            unitPrice: unitPrice === null ? null : unitPrice,
            totalPrice: totalPrice === null ? null : totalPrice,
            sachkonto: sachkonto,
          },
        });
        lineItemCount++;
      }
    }

    // Create payment record
    const dueDate = parseDate(safeGetValue(paymentValue.dueDate));
    const hasPaymentData = dueDate || safeGetValue(paymentValue.paymentTerms) ||
                          safeGetValue(paymentValue.bankAccountNumber);

    if (hasPaymentData) {
      await prisma.payment.create({
        data: {
          invoiceId: invoice.id,
          dueDate: dueDate,
          paymentTerms: safeGetValue(paymentValue.paymentTerms) || null,
          bankAccountNumber: safeGetValue(paymentValue.bankAccountNumber) || null,
          bic: safeGetValue(paymentValue.BIC) || null,
          accountName: safeGetValue(paymentValue.accountName) || null,
          netDays: parseNumber(safeGetValue(paymentValue.netDays)),
          discountPercentage: parseNumber(safeGetValue(paymentValue.discountPercentage)),
          discountDays: parseNumber(safeGetValue(paymentValue.discountDays)),
          discountDueDate: parseDate(safeGetValue(paymentValue.discountDueDate)),
          discountedTotal: parseNumber(safeGetValue(paymentValue.discountedTotal)),
        },
      });
      paymentCount++;
    }
  }

  console.log(`✓ Created ${invoiceCount} invoices`);
  console.log(`✓ Created ${lineItemCount} line items`);
  console.log(`✓ Created ${paymentCount} payment records`);

  console.log('\n✅ Migration completed successfully!');

  // Print summary statistics
  console.log('\n📊 Database Summary:');
  const stats = await Promise.all([
    prisma.organization.count(),
    prisma.department.count(),
    prisma.user.count(),
    prisma.vendor.count(),
    prisma.customer.count(),
    prisma.invoice.count(),
    prisma.lineItem.count(),
    prisma.payment.count(),
  ]);

  console.log(`   Organizations: ${stats[0]}`);
  console.log(`   Departments: ${stats[1]}`);
  console.log(`   Users: ${stats[2]}`);
  console.log(`   Vendors: ${stats[3]}`);
  console.log(`   Customers: ${stats[4]}`);
  console.log(`   Invoices: ${stats[5]}`);
  console.log(`   Line Items: ${stats[6]}`);
  console.log(`   Payments: ${stats[7]}`);
}

main()
  .catch((e) => {
    console.error('❌ Migration failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
