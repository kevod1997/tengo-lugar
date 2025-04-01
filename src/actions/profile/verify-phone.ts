'use server'

import { ServerActionError } from '@/lib/exceptions/server-action-error';
import { ApiHandler } from '@/lib/api-handler';
import prisma from '@/lib/prisma';
import { v4 as uuidv4 } from 'uuid';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';

//todo ver si deberiamos usar el get-user para tener la info nueva del usuario con el telefono verificado, o si con el update es suficiente

// Normalmente usarías Redis o una base de datos para esto en producción
// Esto es solo para ejemplo
const otpStorage: Map<string, { code: string, phoneNumber: string, expiresAt: Date, userId: string }> = new Map();

// Función para iniciar la verificación de teléfono
export async function initiatePhoneVerification(phoneNumber: string) {
  try {
       const session = await auth.api.getSession({
        headers: await headers(),
      })
    
    if (!session) {
      throw ServerActionError.AuthenticationFailed(
        'verify-phone.ts',
        'initiatePhoneVerification'
      );
    }
    

    const existingPhone = await prisma.user.findFirst({
      where: {
        phoneNumber,
        phoneNumberVerified: true
      }
    });

    if (existingPhone) {
      throw ServerActionError.ValidationFailed(
        'verify-phone.ts',
        'initiatePhoneVerification',
        'Este número de teléfono ya se encuentra verificado'
      );
    }
    
    // Generar código OTP (6 dígitos)
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpId = uuidv4();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos de validez
    
    // Almacenar OTP
    otpStorage.set(otpId, {
      code: otpCode,
      phoneNumber,
      expiresAt,
      userId: session.user.id
    });
    
    // Enviar mensaje por WhatsApp
    // En un entorno real, aquí enviarías el OTP a través de la API de WhatsApp
    // Por ahora, simularemos que se envió con éxito
    console.log(`OTP ${otpCode} enviado a ${phoneNumber}`);
    
    try {
      // Implementación real:
      await sendWhatsAppMessage(phoneNumber, otpCode);
    } catch (error) {
      console.error('Error al enviar mensaje de WhatsApp:', error);
      // Continuamos aunque falle para propósitos de demo
    }
    
    return ApiHandler.handleSuccess({
      otpId,
      expiresAt
    });
  } catch (error) {
    return ApiHandler.handleError(error);
  }
}

// Función para verificar el código OTP
export async function verifyPhoneWithOTP(otpId: string, code: string) {
  try {
    const session = await auth.api.getSession({
        headers: await headers(),
      })
    
    if (!session) {
      throw ServerActionError.AuthenticationFailed(
        'verify-phone.ts',
        'verifyPhoneWithOTP'
      );
    }
    
    const otpData = otpStorage.get(otpId);
    
    if (!otpData) {
      throw ServerActionError.ValidationFailed(
        'verify-phone.ts',
        'verifyPhoneWithOTP',
        'Código OTP no encontrado o expirado'
      );
    }
    
    // Verificar que el OTP pertenece a este usuario
    if (otpData.userId !== session.user.id) {
      throw ServerActionError.ValidationFailed(
        'verify-phone.ts',
        'verifyPhoneWithOTP',
        'Solicitud de verificación inválida'
      );
    }
    
    if (new Date() > otpData.expiresAt) {
      otpStorage.delete(otpId);
      throw ServerActionError.ValidationFailed(
        'verify-phone.ts',
        'verifyPhoneWithOTP',
        'El código OTP ha expirado'
      );
    }
    
    const isValid = otpData.code === code;
    
    if (isValid) {
      // Eliminar el OTP usado
      const phoneNumber = otpData.phoneNumber;
      otpStorage.delete(otpId);
      
      // Actualizar el usuario con el número de teléfono verificado
      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          phoneNumber: phoneNumber,
          phoneNumberVerified: true
        }
      });
      
      return ApiHandler.handleSuccess({
        verified: true,
        phoneNumber
      });
    }
    
    return ApiHandler.handleSuccess({
      verified: false
    });
  } catch (error) {
    return ApiHandler.handleError(error);
  }
}

// Función para enviar mensajes por WhatsApp (implementación simulada)
async function sendWhatsAppMessage(phoneNumber: string, otpCode: string): Promise<void> {
  // En un entorno real, usarías la API de WhatsApp Business
  // Esta es una implementación de ejemplo
  
  const whatsappApiUrl = process.env.WHATSAPP_API_URL;
  const whatsappToken = process.env.WHATSAPP_API_TOKEN;
  const whatsappPhoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  
  if (!whatsappApiUrl || !whatsappToken || !whatsappPhoneNumberId) {
    console.warn('Configuración de WhatsApp incompleta, simulando envío de mensaje');
    return;
  }
  
  try {
    /*
    // Esta sería la implementación real usando la API de WhatsApp
    await axios.post(
      `${whatsappApiUrl}/${whatsappPhoneNumberId}/messages`,
      {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: phoneNumber,
        type: "template",
        template: {
          name: "phone_verification",
          language: {
            code: "es"
          },
          components: [
            {
              type: "body",
              parameters: [
                {
                  type: "text",
                  text: otpCode
                }
              ]
            }
          ]
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${whatsappToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    */
    
    // Para demo, solo simulamos
    console.log(`Simulating WhatsApp message to ${phoneNumber}: Your verification code is ${otpCode}`);
  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
    throw error;
  }
}