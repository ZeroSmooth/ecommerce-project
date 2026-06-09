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
    
    <h1 style="color:#00ffb3;text-align:center;">
      ✅ Items Delivered!
    </h1>

    <p style="text-align:center;color:#aaa;">
      ${deliveredAt}
    </p>

    <div style="
      background:#1a1a1a;
      border-left:4px solid #00ffb3;
      border-radius:12px;
      padding:20px;
      margin:20px 0;
    ">
      <h3 style="margin:0 0 10px;color:#00ffb3;">
        📍 Delivery Information
      </h3>

      <p style="margin:0 0 8px;">
        <strong>Address:</strong><br>
        ${order.address || "No address provided"}
      </p>

      <p style="margin:0;">
        <strong>Payment Method:</strong>
        ${order.payment || "N/A"}
      </p>
    </div>

    <h3 style="color:#fff;margin-bottom:10px;">
      Items Ordered
    </h3>

    <table
      style="
        width:100%;
        border-collapse:collapse;
        background:#1a1a1a;
        border-radius:12px;
        overflow:hidden;
      "
    >
      <thead>
        <tr style="background:#222;">
          <th style="padding:10px;text-align:left;color:#aaa;">
            Item
          </th>
          <th style="padding:10px;text-align:center;color:#aaa;">
            Qty
          </th>
          <th style="padding:10px;text-align:right;color:#aaa;">
            Price
          </th>
        </tr>
      </thead>

      <tbody>
        ${itemRows}

        <tr>
          <td
            colspan="2"
            style="
              padding:12px 10px;
              font-weight:bold;
              font-size:16px;
            "
          >
            Total
          </td>

          <td
            style="
              padding:12px 10px;
              text-align:right;
              font-weight:bold;
              font-size:18px;
              color:#00ffb3;
            "
          >
            ₱${order.total}
          </td>
        </tr>
      </tbody>
    </table>

    <p
      style="
        text-align:center;
        color:#555;
        font-size:12px;
        margin-top:30px;
      "
    >
      Thank you for shopping with us!
    </p>

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
            name: "ecommerce",
            email: "zerosmoothgtz@gmail.com",
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
