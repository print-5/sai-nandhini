import Settings from "@/models/Settings";

/**
 * Generate professional invoice HTML for paid orders
 */
export const generateInvoiceHTML = async (order: any) => {
  // Fetch company settings
  let settings = await Settings.findOne();

  const defaultTaxRate = (() => {
    if (settings?.taxRates && settings.taxRates.length > 0) {
      const defaultTax =
        settings.taxRates.find((t: any) => t.isDefault) || settings.taxRates[0];
      return defaultTax.rate;
    }
    return settings?.taxRate || 5;
  })();

  if (!settings) {
    settings = {
      shopName: "Sai Nandhini Tasty World",
      contactEmail: "info@sainandhini.com",
      contactPhone: "+91 96009 16065",
      address:
        "# 3/81, 1st Floor, Kaveri Main Street, SRV Nagar, Thirunagar, Madurai - 625006",
    };
  }

  const invoiceHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Invoice - ${order._id}</title>
      <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 0; color: #333; line-height: 1.5; }
        .invoice-box { max-width: 800px; margin: auto; padding: 30px; border: 1px solid #eee; box-shadow: 0 0 10px rgba(0, 0, 0, 0.15); font-size: 16px; line-height: 24px; color: #555; }
        .invoice-box table { width: 100%; line-height: inherit; text-align: left; }
        .invoice-box table td { padding: 5px; vertical-align: top; }
        .invoice-box table tr td:nth-child(2) { text-align: right; }
        .top-title { font-size: 45px; line-height: 45px; color: #333; }
        .information { padding-bottom: 40px; }
        .heading { background: #eee; border-bottom: 1px solid #ddd; font-weight: bold; }
        .item { border-bottom: 1px solid #eee; }
        .item.last { border-bottom: none; }
        .total { border-top: 2px solid #eee; font-weight: bold; }
        @media only screen and (max-width: 600px) {
            .invoice-box table tr.top table td { width: 100%; display: block; text-align: center; }
            .invoice-box table tr.information table td { width: 100%; display: block; text-align: center; }
        }
      </style>
    </head>
    <body>
      <div class="invoice-box">
        <table cellpadding="0" cellspacing="0">
          <tr class="top">
            <td colspan="2">
              <table>
                <tr>
                  <td class="top-title">
                    ${settings.shopName}
                  </td>
                  <td>
                    Invoice #: ${order._id.toString().slice(-6).toUpperCase()}<br>
                    Date: ${new Date(order.createdAt).toLocaleDateString()}<br>
                    Status: ${order.isPaid ? "PAID" : "PENDING"}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr class="information">
            <td colspan="2">
              <table>
                <tr>
                  <td>
                    ${settings.address}<br>
                    ${settings.contactEmail}<br>
                    ${settings.contactPhone}
                  </td>
                  <td>
                    ${order.shippingAddress.fullName}<br>
                    ${order.shippingAddress.address}<br>
                    ${order.shippingAddress.city} - ${order.shippingAddress.pincode}<br>
                    ${order.shippingAddress.phone}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr class="heading">
            <td>Item</td>
            <td>Price</td>
          </tr>

          ${order.orderItems
            .map(
              (item: any) => `
            <tr class="item">
              <td>${item.name} (x${item.qty})</td>
              <td>₹${(item.price * item.qty).toFixed(2)}</td>
            </tr>
          `,
            )
            .join("")}

          <tr class="item">
            <td>Tax (${defaultTaxRate}%)</td>
            <td>₹${order.taxPrice.toFixed(2)}</td>
          </tr>
          
          <tr class="item">
            <td>Shipping</td>
            <td>₹${order.shippingPrice.toFixed(2)}</td>
          </tr>

          <tr class="total">
            <td></td>
            <td>Total: ₹${order.totalPrice.toFixed(2)}</td>
          </tr>
        </table>
      </div>
    </body>
    </html>
  `;

  return invoiceHTML;
};
