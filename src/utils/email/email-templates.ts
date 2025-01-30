export function getVerifiedEmailTemplate(documentType: string): string {
  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verificación Exitosa</title>
      <!--[if mso]>
      <style type="text/css">
        table {border-collapse:collapse;border-spacing:0;margin:0;}
        div, td {padding:0;}
        div {margin:0 !important;}
      </style>
      <noscript>
      <xml>
        <o:OfficeDocumentSettings>
          <o:PixelsPerInch>96</o:PixelsPerInch>
        </o:OfficeDocumentSettings>
      </xml>
      </noscript>
      <![endif]-->
    </head>
    <body style="margin:0;padding:0;word-spacing:normal;background-color:#f6f6f6;">
      <div role="article" aria-roledescription="email" lang="es" style="text-size-adjust:100%;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;background-color:#f6f6f6;">
        <table role="presentation" style="width:100%;border:none;border-spacing:0;">
          <tr>
            <td align="center" style="padding:0;">
              <!--[if mso]>
              <table role="presentation" align="center" style="width:600px;">
              <tr>
              <td>
              <![endif]-->
              <table role="presentation" style="width:94%;max-width:600px;border:none;border-spacing:0;text-align:left;font-family:Arial,sans-serif;font-size:16px;line-height:22px;color:#363636;">
                <tr>
                  <td style="padding:40px 30px 30px 30px;text-align:center;font-size:24px;font-weight:bold;">
                    <a href="https://tengolugar.com" style="text-decoration:none;"><img src="https://tengolugar.com/logo.png" width="165" alt="Logo" style="width:165px;max-width:80%;height:auto;border:none;text-decoration:none;color:#ffffff;"></a>
                  </td>
                </tr>
                <tr>
                  <td style="padding:30px;background-color:#ffffff;">
                    <h1 style="margin-top:0;margin-bottom:16px;font-size:26px;line-height:32px;font-weight:bold;letter-spacing:-0.02em;">¡Buenas noticias!</h1>
                    <p style="margin:0;">Tu ${documentType} ha sido verificado con éxito. Ahora puedes proceder a utilizar nuestro servicio de carpooling.</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:0;font-size:24px;line-height:28px;font-weight:bold;">
                    <a href="https://tengolugar.com/dashboard" style="text-decoration:none;"><img src="https://tengolugar.com/images/carpool.jpg" width="600" alt="" style="width:100%;height:auto;display:block;border:none;text-decoration:none;color:#363636;"></a>
                  </td>
                </tr>
                <tr>
                  <td style="padding:35px 30px 11px 30px;font-size:0;background-color:#ffffff;border-bottom:1px solid #f0f0f5;border-color:rgba(201,201,207,.35);">
                    <!--[if mso]>
                    <table role="presentation" width="100%">
                    <tr>
                    <td style="width:145px;" align="left" valign="top">
                    <![endif]-->
                    <div class="col-sml" style="display:inline-block;width:100%;max-width:145px;vertical-align:top;text-align:left;font-family:Arial,sans-serif;font-size:14px;color:#363636;">
                      <img src="https://tengolugar.com/images/icon.png" width="115" alt="" style="width:115px;max-width:80%;margin-bottom:20px;">
                    </div>
                    <!--[if mso]>
                    </td>
                    <td style="width:395px;padding-bottom:20px;" valign="top">
                    <![endif]-->
                    <div class="col-lge" style="display:inline-block;width:100%;max-width:395px;vertical-align:top;padding-bottom:20px;font-family:Arial,sans-serif;font-size:16px;line-height:22px;color:#363636;">
                      <p style="margin-top:0;margin-bottom:12px;">Estamos emocionados de tenerte a bordo. Explora nuestra plataforma y comienza a disfrutar de viajes compartidos seguros y económicos.</p>
                      <p style="margin-top:0;margin-bottom:18px;">¿Listo para empezar?</p>
                      <p style="margin:0;"><a href="https://tengolugar.com/dashboard" style="background: #ff3884; text-decoration: none; padding: 10px 25px; color: #ffffff; border-radius: 4px; display:inline-block; mso-padding-alt:0;text-underline-color:#ff3884"><!--[if mso]><i style="letter-spacing: 25px;mso-font-width:-100%;mso-text-raise:20pt">&nbsp;</i><![endif]--><span style="mso-text-raise:10pt;font-weight:bold;">Ir a mi cuenta</span><!--[if mso]><i style="letter-spacing: 25px;mso-font-width:-100%">&nbsp;</i><![endif]--></a></p>
                    </div>
                    <!--[if mso]>
                    </td>
                    </tr>
                    </table>
                    <![endif]-->
                  </td>
                </tr>
                <tr>
                  <td style="padding:30px;text-align:center;font-size:12px;background-color:#404040;color:#cccccc;">
                    <p style="margin:0 0 8px 0;"><a href="http://www.facebook.com/" style="text-decoration:none;"><img src="https://assets.codepen.io/210284/facebook_1.png" width="40" height="40" alt="f" style="display:inline-block;color:#cccccc;"></a> <a href="http://www.twitter.com/" style="text-decoration:none;"><img src="https://assets.codepen.io/210284/twitter_1.png" width="40" height="40" alt="t" style="display:inline-block;color:#cccccc;"></a></p>
                    <p style="margin:0;font-size:14px;line-height:20px;">&reg; Tengo Lugar, 2023<br><a class="unsub" href="http://www.example.com/" style="color:#cccccc;text-decoration:underline;">Darse de baja</a></p>
                  </td>
                </tr>
              </table>
              <!--[if mso]>
              </td>
              </tr>
              </table>
              <![endif]-->
            </td>
          </tr>
        </table>
      </div>
    </body>
    </html>
  `;
}

export function getFailedEmailTemplate(documentType: string, failureReason?: string): string {
  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verificación Fallida</title>
      <!--[if mso]>
      <style type="text/css">
        table {border-collapse:collapse;border-spacing:0;margin:0;}
        div, td {padding:0;}
        div {margin:0 !important;}
      </style>
      <noscript>
      <xml>
        <o:OfficeDocumentSettings>
          <o:PixelsPerInch>96</o:PixelsPerInch>
        </o:OfficeDocumentSettings>
      </xml>
      </noscript>
      <![endif]-->
    </head>
    <body style="margin:0;padding:0;word-spacing:normal;background-color:#f6f6f6;">
      <div role="article" aria-roledescription="email" lang="es" style="text-size-adjust:100%;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;background-color:#f6f6f6;">
        <table role="presentation" style="width:100%;border:none;border-spacing:0;">
          <tr>
            <td align="center" style="padding:0;">
              <!--[if mso]>
              <table role="presentation" align="center" style="width:600px;">
              <tr>
              <td>
              <![endif]-->
              <table role="presentation" style="width:94%;max-width:600px;border:none;border-spacing:0;text-align:left;font-family:Arial,sans-serif;font-size:16px;line-height:22px;color:#363636;">
                <tr>
                  <td style="padding:40px 30px 30px 30px;text-align:center;font-size:24px;font-weight:bold;">
                    <a href="https://tengolugar.com" style="text-decoration:none;"><img src="https://tengolugar.com/logo.png" width="165" alt="Logo" style="width:165px;max-width:80%;height:auto;border:none;text-decoration:none;color:#ffffff;"></a>
                  </td>
                </tr>
                <tr>
                  <td style="padding:30px;background-color:#ffffff;">
                    <h1 style="margin-top:0;margin-bottom:16px;font-size:26px;line-height:32px;font-weight:bold;letter-spacing:-0.02em;">Lo sentimos</h1>
                    <p style="margin:0;">La verificación de tu ${documentType} ha fallado. Motivo: ${failureReason || 'No especificado'}.</p>
                    <p style="margin:16px 0 0 0;">Por favor, envía un nuevo documento o contacta con soporte para obtener ayuda.</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:0;font-size:24px;line-height:28px;font-weight:bold;">
                    <a href="https://tengolugar.com/support" style="text-decoration:none;"><img src="https://tengolugar.com/images/support.jpg" width="600" alt="" style="width:100%;height:auto;display:block;border:none;text-decoration:none;color:#363636;"></a>
                  </td>
                </tr>
                <tr>
                  <td style="padding:35px 30px 11px 30px;font-size:0;background-color:#ffffff;border-bottom:1px solid #f0f0f5;border-color:rgba(201,201,207,.35);">
                    <!--[if mso]>
                    <table role="presentation" width="100%">
                    <tr>
                    <td style="width:145px;" align="left" valign="top">
                    <![endif]-->
                    <div class="col-sml" style="display:inline-block;width:100%;max-width:145px;vertical-align:top;text-align:left;font-family:Arial,sans-serif;font-size:14px;color:#363636;">
                      <img src="https://tengolugar.com/images/icon.png" width="115" alt="" style="width:115px;max-width:80%;margin-bottom:20px;">
                    </div>
                    <!--[if mso]>
                    </td>
                    <td style="width:395px;padding-bottom:20px;" valign="top">
                    <![endif]-->
                    <div class="col-lge" style="display:inline-block;width:100%;max-width:395px;vertical-align:top;padding-bottom:20px;font-family:Arial,sans-serif;font-size:16px;line-height:22px;color:#363636;">
                      <p style="margin-top:0;margin-bottom:12px;">Nuestro equipo de soporte está listo para ayudarte. No dudes en contactarnos si tienes alguna pregunta o necesitas asistencia adicional.</p>
                      <p style="margin-top:0;margin-bottom:18px;">¿Necesitas ayuda?</p>
                      <p style="margin:0;"><a href="https://tengolugar.com/support" style="background: #ff3884; text-decoration: none; padding: 10px 25px; color: #ffffff; border-radius: 4px; display:inline-block; mso-padding-alt:0;text-underline-color:#ff3884"><!--[if mso]><i style="letter-spacing: 25px;mso-font-width:-100%;mso-text-raise:20pt">&nbsp;</i><![endif]--><span style="mso-text-raise:10pt;font-weight:bold;">Contactar soporte</span><!--[if mso]><i style="letter-spacing: 25px;mso-font-width:-100%">&nbsp;</i><![endif]--></a></p>
                    </div>
                    <!--[if mso]>
                    </td>
                    </tr>
                    </table>
                    <![endif]-->
                  </td>
                </tr>
                <tr>
                  <td style="padding:30px;text-align:center;font-size:12px;background-color:#404040;color:#cccccc;">
                    <p style="margin:0 0 8px 0;"><a href="http://www.facebook.com/" style="text-decoration:none;"><img src="https://assets.codepen.io/210284/facebook_1.png" width="40" height="40" alt="f" style="display:inline-block;color:#cccccc;"></a> <a href="http://www.twitter.com/" style="text-decoration:none;"><img src="https://assets.codepen.io/210284/twitter_1.png" width="40" height="40" alt="t" style="display:inline-block;color:#cccccc;"></a></p>
                    <p style="margin:0;font-size:14px;line-height:20px;">&reg; Tengo Lugar, 2023<br><a class="unsub" href="http://www.example.com/" style="color:#cccccc;text-decoration:underline;">Darse de baja</a></p>
                  </td>
                </tr>
              </table>
              <!--[if mso]>
              </td>
              </tr>
              </table>
              <![endif]-->
            </td>
          </tr>
        </table>
      </div>
    </body>
    </html>
  `;
}