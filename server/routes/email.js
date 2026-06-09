const Brevo = require("@getbrevo/brevo");

module.exports = (app) => {
  app.post("/send-receipt", async (req, res) => {
    const { order } = req.body;

    if (!order?.receiptEmail) {
      return res.json({ success: false, message: "No email provided" });
    }

    const deliveredAt = new Date().toLocaleString("en-PH", {
      timeZone: "Asia/Manila",
      dateStyle: "full",
      timeStyle: "short",
    });

    const itemRows = order.items
      .map(
        (item) => `
        <tr>
          <td style="padding:10px;border-bottom:1px solid #2a2a2a;">${item.name}</td>
          <td style="padding:10px;border-bottom:1px solid #2a2a2a;text-align:center;">${item.qty || 1}</td>
          <td style="padding:10px;border-bottom:1px solid #2a2a2a;text-align:right;color:#00ffb3;">₱${item.price}</td>
        </tr>`,
      )
      .join("");

    const voucherRow = order.voucher
      ? `<tr>
          <td colspan="2" style="padding:10px;color:#ff8a80;">Voucher: ${order.voucher}</td>
          <td style="padding:10px;text-align:right;color:#ff8a80;">
            -₱${order.items.reduce((a, i) => a + i.price * (i.qty || 1), 0) - order.total}
          </td>
         </tr>`
      : "";

    const html = `
      <div style="background:#0d0d0d;color:#fff;font-family:Arial,sans-serif;padding:40px;max-width:600px;margin:auto;border-radius:16px;">
        <h1 style="color:#00ffb3;text-align:center;margin-bottom:4px;">✅ Items Delivered!</h1>
        <p style="text-align:center;color:#aaa;margin-top:0;">${deliveredAt}</p>

        <div style="background:#1a1a1a;border-radius:12px;padding:20px;margin:20px 0;">
          <p style="margin:0 0 6px;"><strong>Delivery Address:</strong> ${order.address}</p>
          <p style="margin:0;"><strong>Payment Method:</strong> ${order.payment}</p>
        </div>

        <h3 style="color:#fff;margin-bottom:10px;">Items Ordered</h3>
        <table style="width:100%;border-collapse:collapse;background:#1a1a1a;border-radius:12px;overflow:hidden;">
          <thead>
            <tr style="background:#222;">
              <th style="padding:10px;text-align:left;color:#aaa;">Item</th>
              <th style="padding:10px;text-align:center;color:#aaa;">Qty</th>
              <th style="padding:10px;text-align:right;color:#aaa;">Price</th>
            </tr>
          </thead>
          <tbody>
            ${itemRows}
            ${voucherRow}
            <tr>
              <td colspan="2" style="padding:12px 10px;font-weight:bold;font-size:16px;">Total</td>
              <td style="padding:12px 10px;text-align:right;font-weight:bold;font-size:18px;color:#00ffb3;">₱${order.total}</td>
            </tr>
          </tbody>
        </table>

        <p style="text-align:center;color:#555;font-size:12px;margin-top:30px;">
          Thank you for shopping with us!
        </p>
      </div>
    `;

    try {
      const sendSmtpEmail = new Brevo.SendSmtpEmail();

      // 🔥 FIX: set API key HERE (works across all SDK versions)
      sendSmtpEmail.apiKey = process.env.BREVO_API_KEY;

      sendSmtpEmail.to = [{ email: order.receiptEmail }];
      sendSmtpEmail.sender = {
        email: "no-reply@yourdomain.com",
        name: "Your Shop",
      };

      sendSmtpEmail.subject = "Your Order Has Been Delivered! 🎉";
      sendSmtpEmail.htmlContent = html;

      const apiInstance = new Brevo.TransactionalEmailsApi();
      const result = await apiInstance.sendTransacEmail(sendSmtpEmail);

      return res.json({ success: true, result });
    } catch (err) {
      console.error("Email error:", err);
      return res.json({ success: false, message: err.message });
    }
  });
};
