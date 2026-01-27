# Project Update: Implement Product Search & Auto-fill Logic

I have **already updated** `src/data/mockData.ts` with the `export const PRODUCTS = [...]` array containing 20 items.

Now, please modify `src/app/page.tsx` to implement the Product Search feature using this data.

## Task Overview
Remove the static "Bank Sector Essential Check" checkboxes and replace them with a "Product Search" interface that auto-fills the ad content.

## Step 1: UI Modification (Input Section)
In the main form (Step 1 of the workflow):
1. **Import Data:** Import `PRODUCTS` from `@/data/mockData`.
2. **Remove:** The existing "Bank Sector Essential Check" section (the box with checkboxes).
3. **Add:** A new "Product Info" section.
   - **Input 1:** `Product Name` (Read-only, placeholder="Click search to select")
   - **Input 2:** `Product Code` (Read-only)
   - **Button:** A "Search" button (with a search icon) placed next to these inputs.

## Step 2: Search Modal Component
Create a Modal (or Popup) that opens when the "Search" button is clicked.
1. **Search Logic:**
   - Add a search input field inside the modal.
   - Filter `PRODUCTS` by checking if the search query matches `product_name` OR `id` (Case-insensitive, partial match).
2. **List Display:** Show the filtered list (Product Name | Product Code).
3. **Selection Action:** When a user clicks a row:
   - Close the modal.
   - Update the main form's `Product Name` and `Product Code` states.
   - **Trigger the Auto-fill logic (Step 3).**

## Step 3: Content Auto-fill Logic (**Important**)
When a product is selected from the modal, you must **append** the mandatory disclosure text to the existing `Ad Content` textarea.

**Format:**
Retrieve the selected product's data and append these 4 fields with line breaks:

```javascript
// Logic to append text
const mandatoryText = `
${selectedProduct.payout_restrictions}

${selectedProduct.data_access_right}

${selectedProduct.important_notes}

${selectedProduct.deposit_protection}
`;

// If adContent already has text, add newlines before appending.
setAdContent(prev => prev ? `${prev}\n\n${mandatoryText}` : mandatoryText);
