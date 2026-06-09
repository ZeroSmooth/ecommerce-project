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

    const html = `
      <div style="background:#0d0d0d;color:#fff;font-family:Arial,sans-serif;padding:40px;max-width:600px;margin:auto;border-radius:16px;">
        <h1 style="color:#00ffb3;text-align:center;">✅ Items Delivered!</h1>
        <p style="text-align:center;color:#aaa;">${deliveredAt}</p>

        <h3>Items Ordered</h3>
        <table style="width:100%;background:#1a1a1a;color:#fff;">
          <tbody>
            ${itemRows}
          </tbody>
        </table>

        <p style="margin-top:20px;">Total: ₱${order.total}</p>
      </div>
    `;

    try {
      const response = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "api-key": process.env.BREVO_API_KEY,
        },
        body: JSON.stringify({
          sender: {
            name: "Your Shop",
            email: "no-reply@yourdomain.com",
          },
          to: [
            {
              email: order.receiptEmail,
            },
          ],
          subject: "Your Order Has Been Delivered! 🎉",
          htmlContent: html,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(JSON.stringify(data));
      }

      return res.json({ success: true, data });
    } catch (err) {
      console.error("Email error:", err.message);
      return res.json({ success: false, message: err.message });
    }
  });
};
