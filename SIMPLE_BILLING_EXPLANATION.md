# Simple Explanation: How Storage Billing Works

Think of Cloud Storage like **Renting a Warehouse**.

## The Deal
- You pay **$25 per month** rent.
- In exchange, you get a warehouse that can hold **100 Boxes** (100 GB).

---

## Year 1 timeline
*   **January**: You put in **4 boxes**. (Warehouse is mostly empty). You pay **$25**.
*   **February**: You put in **4 more boxes** (Total: 8). You pay **$25**.
*   **... by December**: You have **48 boxes** inside.
    *   The warehouse is half full.
    *   You still pay **$25**.

## Does unused space "carry forward"?
**No.** The warehouse size stays the same (100 GB) every month. It does not get bigger just because you didn't fill it.

## When do you pay more?
You only pay extra when your warehouse is **100% Full**.
*   In your case (with 3MB photos), this will happen in **Year 3**.
*   In Year 3, you will have 101 boxes. You need more space.
*   Supabase will say: "Okay, we will store the extra boxes for $0.12 each".

## Summary
*   You pay **$25/month flat fee** as long as your total data is **under 100 GB**.
*   It doesn't matter if you use 1 GB or 99 GB, the price is the same.
