export const signupMail = (customerName) => {
    const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Welcome to Venusa</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f9f9f9;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9f9f9; padding: 30px 0;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 10px; padding: 30px; box-shadow: 0 0 10px rgba(0,0,0,0.05);">
                  <tr>
                    <td align="center" style="font-size: 26px; font-weight: bold; color: #000000; padding-bottom: 10px;">
                      Welcome to Venusa 💌
                    </td>
                  </tr>
                  <tr>
                    <td style="font-size: 16px; color: #333333; line-height: 1.6;">
                      <p>Hey <strong>${customerName}</strong>,</p>
                      <p>We’re so glad you’re here! 💖 You’ve just joined <strong>Venusa</strong> — a space where <em>style meets soul</em> and every piece tells a story.</p>
                      <p>Whether you're here to explore, shop, or simply vibe with us — we’re all about keeping it bold, expressive, and unapologetically you.</p>
                      <p>🔥 Expect exclusive updates, early access to drops, and more coming your way soon!</p>
                      <p>In the meantime, dive into our world:<br>
                        <a href="https://www.instagram.com/venusa.co.in" style="color: #e91e63; text-decoration: none;">@venusa.co.in</a> | 
                        <a href="https://www.venusa.co.in" style="color: #e91e63; text-decoration: none;">venusa.co.in</a>
                      </p>
                      <p style="margin-top: 30px;">Let’s make something unforgettable.<br><strong>– Team Venusa</strong><br><em>Born to stand out.</em></p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
        `

    return html;
}
