This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Sidebar Navigation Styling

**🚨 CRITICAL: DO NOT MODIFY WITHOUT EXPLICIT CONSENT 🚨**

**WARNING**: This sidebar navigation system has been carefully implemented and tested. Any modifications to the theme color system, hover states, or helper functions may break the dynamic theming functionality. The current implementation correctly handles:

- Dynamic theme color switching
- Proper hover states that match active states
- Tailwind CSS safelist for dynamic classes
- Consistent visual hierarchy

**DO NOT CHANGE**:
- Helper functions (`getBackgroundClasses`, `getHoverBackgroundClasses`, `getTextColorClasses`)
- Tailwind safelist configuration
- Parent/child navigation styling logic
- Theme color mapping system

The sidebar navigation has specific styling requirements that have been carefully implemented:

### Parent Navigation Items (with children)
- **Active state**: Theme-colored background with white text
- **Hover state**: Theme-colored background with white text (`hover:bg-blue-600 hover:text-white`)
- **Default state**: Gray text

### Child Navigation Items
- **Active state**: Theme-colored text only (`text-blue-600`)
- **Hover state**: Theme-colored text only (`hover:text-blue-600`)
- **Default state**: Gray text (`text-gray-600`)
- **NO background card effects on children**

### Current Implementation (src/components/layout/sidebar.tsx)
```tsx
// Parent items (lines 298-300)
isActiveItem
  ? `${getBackgroundClasses(true)} text-white`
  : `text-gray-700 ${getHoverBackgroundClasses()} hover:text-white`

// Child items (lines 325-327)
isActive(child.href)
  ? getTextColorClasses()
  : `text-gray-600 ${getTextColorClasses(true)}`
```

### Theme Color System
The sidebar uses a dynamic theme system that supports all theme colors:
- **Helper Functions**: `getBackgroundClasses()`, `getHoverBackgroundClasses()`, `getTextColorClasses()`
- **Safelist**: All theme hover classes are included in `tailwind.config.js` safelist
- **Dynamic**: Automatically updates when theme color changes in settings

### Visual Hierarchy
This creates a clear visual hierarchy where:
1. **Parents**: Get full background cards on hover/active (theme color background + white text)
2. **Children**: Only change text color on hover/active (theme color text, no background)
3. **Dynamic**: Both use the currently selected theme color (orange, blue, purple, etc.)
4. **Consistent**: Hover state matches active state styling for parent items

**Last Updated**: December 2024

## Standard Page Layout with AI + Metrics

**IMPORTANT: STANDARD LAYOUT PATTERN FOR ALL PAGES WITH METRICS**

All pages with metrics cards should follow this standardized layout pattern:

### Layout Structure
```tsx
{/* AI Recommendation and Metrics Layout */}
<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
  {/* AI Recommendation Card - Left Side (2/3 width) */}
  <div className="lg:col-span-2">
    <AIRecommendationCard
      title="[Page Name] AI"
      subtitle="Your intelligent assistant for [domain] optimization"
      recommendations={aiRecommendations}
      onRecommendationComplete={handleRecommendationComplete}
    />
  </div>

  {/* Metrics Cards - Right Side (1/3 width) */}
  <div className="grid grid-cols-2 gap-4">
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">[Metric Name]</p>
          <p className="text-xl font-bold text-[color]">[Value]</p>
        </div>
        <div className="p-2 rounded-full bg-[color]-100">
          <[Icon] className="w-5 h-5 text-[color]" />
        </div>
      </div>
    </Card>
    {/* Repeat for 2-4 metrics */}
  </div>
</div>
```

### Implemented Pages
- ✅ **CRM Pages**: Leads, Dashboard, Accounts
- ✅ **Products Page**: Product management with inventory metrics
- ✅ **Inventory Stock Page**: Stock overview with levels and values
- ✅ **Stock Movements Page**: Movement tracking with ins/outs/adjustments
- ✅ **Warehouses Page**: Warehouse management with location metrics
- ✅ **Warehouse Details Page**: Individual warehouse operations with inventory data

### AI Recommendation Requirements
- **No icons/images** in AI cards (removed for cleaner look)
- **Compact design** with 3-column grid for recommendations
- **Consistent titles**: "[Domain] AI" format
- **Standard subtitles**: "Your intelligent assistant for [domain] optimization"

### Metrics Card Requirements
- **2x2 grid** for 4 main metrics in right column
- **Consistent styling**: `p-4` padding, rounded icons, color-coded
- **Standard colors**: Theme primary, green (positive), red (negative), orange (warning), blue (info)
- **Icon placement**: Right side with colored background circle

This pattern ensures consistency across the application and optimal use of space.

## Standardized Table Implementation

### Overview
All tables across the application now use a consistent `DataTable` component with built-in pagination and horizontal scrolling.

### DataTable Component
```tsx
import { DataTable } from "@/components/ui/data-table";

<DataTable
  data={dataArray}
  columns={[
    {
      key: 'columnKey',
      label: 'Column Label',
      render: (item) => <CustomComponent item={item} />
    }
  ]}
  itemsPerPage={10}
/>
```

### Features
- **Consistent Pagination**: 10 items per page by default
- **Horizontal Scrolling**: Tables scroll horizontally on smaller screens
- **Smart Pagination**: Shows page numbers with ellipsis for large datasets
- **Responsive Design**: Adapts to different screen sizes
- **Custom Rendering**: Each column can have custom render functions
- **Loading States**: Built-in loading and empty state handling

### Implemented Pages
- ✅ **Products Page**: Product catalog with images, pricing, and stock levels
- ✅ **Inventory Stock Page**: Stock overview with detailed inventory metrics
- ✅ **Stock Movements Page**: Movement history with type indicators and calculations
- ✅ **Warehouses Page**: Warehouse listing with location and status information
- ✅ **CRM Leads Page**: Lead management with status tracking and scoring
- ✅ **CRM Accounts Page**: Account management with contact and statistics data

### Pagination Controls
- **Previous/Next**: Navigate between pages
- **Page Numbers**: Direct navigation to specific pages
- **Results Counter**: Shows "Showing X to Y of Z results"
- **Ellipsis**: Smart display of page numbers for large datasets

### Benefits
- **Consistent UX**: All tables behave the same way across the application
- **Better Performance**: Only renders visible items, improving page load times
- **Mobile Friendly**: Horizontal scrolling ensures tables work on all devices
- **Maintainable**: Single component to update for all table improvements

## Bulk Stock Movement Upload

### Overview
A comprehensive bulk upload system for stock movements, especially optimized for product receipts and inventory adjustments.

### Features
- **Excel/CSV Support**: Upload .xlsx, .xls, and .csv files
- **Template Download**: Pre-formatted Excel template with instructions
- **Data Validation**: Real-time validation of SKUs, warehouses, and movement types
- **Batch Processing**: Handles up to 1000 movements per upload
- **Error Handling**: Detailed error reporting with row-by-row feedback
- **Cost Tracking**: Automatic average cost calculation for receipts

### Usage
1. Navigate to **Inventory > Stock Movements**
2. Click **"Bulk Upload"** button
3. Download the Excel template
4. Fill in your stock movement data
5. Upload the completed file
6. Review validation results
7. Process valid movements

### Template Fields
| Field | Required | Description |
|-------|----------|-------------|
| SKU | Yes | Product SKU (must exist in system) |
| Product Name | No | Product name (for reference only) |
| Quantity | Yes | Quantity to add/subtract |
| Type | Yes | RECEIPT, ADJUSTMENT, TRANSFER_OUT, TRANSFER_IN |
| Warehouse Code | Yes | Warehouse code (must exist in system) |
| Reference | No | Reference number (PO, invoice, etc.) |
| Reason | No | Reason for movement |
| Notes | No | Additional notes |
| Unit Cost | No | Unit cost for receipt movements |
| Total Cost | No | Total cost (calculated if not provided) |

### Movement Types
- **RECEIPT**: Adding stock (positive quantity)
- **ADJUSTMENT**: Stock corrections (positive or negative)
- **TRANSFER_OUT**: Moving stock out (negative quantity)
- **TRANSFER_IN**: Moving stock in (positive quantity)

### API Endpoint
```
POST /api/stock-movements/bulk
Content-Type: application/json

{
  "movements": [
    {
      "productId": "string",
      "type": "RECEIPT",
      "quantity": 100,
      "warehouseId": "string",
      "reference": "PO-2024-001",
      "reason": "Purchase Order",
      "unitCost": 25.50
    }
  ]
}
```

### Benefits
- **Time Saving**: Process hundreds of movements in minutes
- **Accuracy**: Built-in validation prevents common errors
- **Audit Trail**: All movements tracked with references
- **Cost Management**: Automatic average cost updates
- **Flexibility**: Supports all movement types and scenarios

## SMS & Email Notification Standards

### Overview
All SMS and Email notifications in the system follow a unified configuration and implementation standard. This ensures consistency, reliability, and maintainability across all notification features.

### Configuration Standard
All notification systems (Task Notifications, Communication System, etc.) use **individual database settings** stored in the `SystemSettings` table:

#### SMS Configuration Keys
```
SMS_USERNAME     - Deywuro API username
SMS_PASSWORD     - Deywuro API password  
SMS_SENDER_ID    - SMS sender ID (default: 'AdPools')
```

#### Email Configuration Keys
```
SMTP_HOST        - SMTP server host
SMTP_PORT        - SMTP server port (default: 587)
SMTP_USERNAME    - SMTP username
SMTP_PASSWORD    - SMTP password
SMTP_FROM_ADDRESS - From email address
SMTP_FROM_NAME   - From display name (default: 'AdPools Group')
SMTP_ENCRYPTION  - Encryption type: 'tls' or 'ssl' (default: 'tls')
```

### Implementation Standard

#### SMS Implementation
```typescript
// ✅ CORRECT: Use individual settings
const smsUsername = await getSettingValue('SMS_USERNAME', '');
const smsPassword = await getSettingValue('SMS_PASSWORD', '');
const smsSenderId = await getSettingValue('SMS_SENDER_ID', 'AdPools');

// ✅ CORRECT: Use Deywuro endpoint and format
const response = await fetch('https://deywuro.com/api/sms', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
  },
  body: new URLSearchParams({
    username: smsUsername,
    password: smsPassword,
    destination: phoneNumber,
    source: smsSenderId,
    message: message
  })
});

// ✅ CORRECT: Handle Deywuro response format
const responseText = await response.text();
const result = JSON.parse(responseText);
if (result.code === 0) {
  // Success
} else {
  // Error: result.message
}
```

#### Email Implementation
```typescript
// ✅ CORRECT: Use individual settings
const smtpHost = await getSettingValue('SMTP_HOST', '');
const smtpPort = await getSettingValue('SMTP_PORT', '587');
const smtpUsername = await getSettingValue('SMTP_USERNAME', '');
const smtpPassword = await getSettingValue('SMTP_PASSWORD', '');
const smtpFromAddress = await getSettingValue('SMTP_FROM_ADDRESS', '');
const smtpFromName = await getSettingValue('SMTP_FROM_NAME', 'AdPools Group');
const smtpEncryption = await getSettingValue('SMTP_ENCRYPTION', 'tls');

// ✅ CORRECT: Use nodemailer with standard configuration
const transporter = nodemailer.createTransport({
  host: smtpHost,
  port: parseInt(smtpPort),
  secure: smtpEncryption === 'ssl',
  auth: {
    user: smtpUsername,
    pass: smtpPassword,
  },
});

await transporter.sendMail({
  from: `"${smtpFromName}" <${smtpFromAddress}>`,
  to: recipient,
  subject: subject,
  text: message,
  html: message.replace(/\n/g, '<br>'),
});
```

### Helper Function Standard
All notification systems must use this standard helper function:

```typescript
private static async getSettingValue(key: string, defaultValue: string = ''): Promise<string> {
  try {
    const setting = await prisma.systemSettings.findUnique({
      where: { key },
      select: { value: true }
    });
    return setting?.value || defaultValue;
  } catch (error) {
    console.error(`Error fetching setting ${key}:`, error);
    return defaultValue;
  }
}
```

### ❌ DEPRECATED: Do NOT Use
```typescript
// ❌ WRONG: JSON config approach
const smsSettings = await prisma.systemSettings.findFirst({
  where: { key: 'sms_config' }
});
const config = JSON.parse(smsSettings.value);

// ❌ WRONG: Wrong API endpoint
fetch('https://api.deywuro.com/api/v1/sms/send', ...)

// ❌ WRONG: Wrong format (JSON with Bearer token)
headers: {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${config.apiKey}`,
}
```

### Features Using This Standard
- ✅ **Task Assignment Notifications**: Sends SMS/Email when tasks are assigned
- ✅ **Communication System**: Bulk SMS/Email sending with history
- ✅ **System Notifications**: Low stock, out of stock alerts
- ✅ **User Management**: Account creation, password reset notifications

### Configuration Management
All SMS and Email settings are managed through:
- **Settings Page**: `/settings/notifications`
- **Test Functionality**: Built-in test buttons for SMS and Email
- **Real-time Validation**: Settings are validated before saving
- **Secure Storage**: Passwords are masked in UI but stored securely

### Benefits
- **Consistency**: All notifications work the same way
- **Reliability**: Uses proven endpoints and configurations
- **Maintainability**: Single standard to update across all features
- **Testing**: Easy to test with working communication system
- **Scalability**: Individual settings allow fine-grained control

**Last Updated**: January 2025
