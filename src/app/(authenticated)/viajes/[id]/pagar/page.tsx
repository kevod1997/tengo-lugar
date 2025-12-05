// src/app/(authenticated)/viajes/[id]/pagar/page.tsx
'use client'

import { useEffect, useState } from 'react';

import { useRouter } from 'next/navigation';

import {
  ArrowLeft,
  Copy,
  Check,
  AlertCircle,
  MessageCircle,
  CheckCircle2,
} from 'lucide-react';
import { toast } from 'sonner';

import { getPaymentDetails, type PaymentDetails } from '@/actions/payment/get-payment-details';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { PAYMENT_CONFIG, generateWhatsAppMessage, getWhatsAppUrl } from '@/lib/constants/payment-config';
import { copyToClipboard, formatPaymentDate } from '@/utils/helpers/payment/payment-helpers';

interface DataRowProps {
  label: string;
  value: string;
  copyable?: boolean;
}

function DataRow({ label, value, copyable }: DataRowProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const success = await copyToClipboard(value);
    if (success) {
      setCopied(true);
      toast.success(`${label} copiado al portapapeles`);
      setTimeout(() => setCopied(false), 2000);
    } else {
      toast.error('Error al copiar');
    }
  };

  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm text-slate-600">{label}</span>
      <div className="flex items-center gap-2">
        <span className="font-mono text-sm font-medium">{value}</span>
        {copyable && (
          <Button
            size="sm"
            variant="ghost"
            className="h-7 w-7 p-0"
            onClick={handleCopy}
          >
            {copied ? (
              <Check className="h-3 w-3 text-green-600" />
            ) : (
              <Copy className="h-3 w-3" />
            )}
          </Button>
        )}
      </div>
    </div>
  );
}

export default function PaymentPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [tripId, setTripId] = useState<string>('');

  useEffect(() => {
    async function loadPaymentDetails() {
      try {
        const resolvedParams = await params;
        setTripId(resolvedParams.id);
        const result = await getPaymentDetails(resolvedParams.id);

        if (result.success && result.data) {
          setPaymentDetails(result.data);
        } else {
          toast.error('Error al cargar detalles de pago', {
            description: result.message || 'No se pudieron obtener los detalles del pago'
          });
          router.push(`/viajes/${resolvedParams.id}`);
        }
      } catch {
        toast.error('Error inesperado', {
          description: 'Ocurrió un error al cargar la información de pago'
        });
        const resolvedParams = await params;
        router.push(`/viajes/${resolvedParams.id}`);
      } finally {
        setIsLoading(false);
      }
    }

    loadPaymentDetails();
  }, [params, router]);

  const handleOpenWhatsApp = () => {
    if (!paymentDetails) return;

    const message = generateWhatsAppMessage(
      paymentDetails.reservationId,
      paymentDetails.origin,
      paymentDetails.destination,
      formatPaymentDate(paymentDetails.tripDate),
      paymentDetails.totalAmount
    );

    const whatsappUrl = getWhatsAppUrl(message);
    window.open(whatsappUrl, '_blank');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando información de pago...</p>
        </div>
      </div>
    );
  }

  if (!paymentDetails) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sticky Header con Resumen */}
      <div className="sticky top-0 z-10 bg-white border-b shadow-sm">
        <div className="container max-w-lg px-4 py-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push(`/viajes/${tripId}`)}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex-1">
              <h1 className="font-semibold text-sm">Completar Pago</h1>
              <p className="text-xs text-muted-foreground">
                {paymentDetails.origin} → {paymentDetails.destination}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Total</p>
              <p className="font-bold text-blue-600">${paymentDetails.totalAmount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido Principal - Mobile Optimized */}
      <div className="container max-w-lg px-4 py-6 space-y-6">

        {/* Progress Indicator */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-semibold">
              1
            </div>
            <span className="text-sm font-medium">Transferir</span>
          </div>
          <div className="flex-1 h-0.5 bg-slate-200 mx-2"></div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center text-sm font-semibold">
              2
            </div>
            <span className="text-sm text-muted-foreground">Comprobar</span>
          </div>
          <div className="flex-1 h-0.5 bg-slate-200 mx-2"></div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center text-sm font-semibold">
              3
            </div>
            <span className="text-sm text-muted-foreground">Confirmar</span>
          </div>
        </div>

        {/* PASO 1: Datos Bancarios */}
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                  1
                </div>
                <CardTitle className="text-base">Transferí a esta cuenta</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <DataRow
              label="Alias"
              value={PAYMENT_CONFIG.BANK_INFO.ALIAS}
              copyable
            />
            <DataRow
              label="CBU"
              value={PAYMENT_CONFIG.BANK_INFO.CBU}
              copyable
            />
            <Separator />
            <DataRow
              label="Titular"
              value={PAYMENT_CONFIG.BANK_INFO.RAZON_SOCIAL}
            />
            <DataRow
              label="CUIT"
              value={PAYMENT_CONFIG.BANK_INFO.CUIT}
            />
            <DataRow
              label="Banco"
              value={PAYMENT_CONFIG.BANK_INFO.BANK_NAME}
            />
      
          </CardContent>
        </Card>

        {/* PASO 2: Resumen del Pago */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-slate-600 text-white flex items-center justify-center text-xs font-bold">
                2
              </div>
              <CardTitle className="text-base">Monto a transferir</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Viaje ({paymentDetails.seatsReserved} {paymentDetails.seatsReserved === 1 ? 'asiento' : 'asientos'})</span>
              <span className="font-mono">${paymentDetails.tripPrice}</span>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Tarifa de servicio ({paymentDetails.serviceFeeRate}%)</span>
              <span className="font-mono">${paymentDetails.serviceFee}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span className="font-mono text-blue-600">${paymentDetails.totalAmount}</span>
            </div>
          </CardContent>
        </Card>

        {/* PASO 3: Enviar Comprobante */}
        <Card className="border-green-200 bg-green-50">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-green-600 text-white flex items-center justify-center text-xs font-bold">
                3
              </div>
              <CardTitle className="text-base">Enviá el comprobante</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert className="bg-white border-green-300">
              <AlertCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-xs">
                <strong>Importante:</strong> Envialo desde tu número registrado:{" "}
                <span className="font-mono">{paymentDetails.userPhoneNumber}</span>
              </AlertDescription>
            </Alert>

            <div className="space-y-2 text-sm">
              <p className="flex items-start gap-2">
                <span className="font-semibold text-green-900">1.</span>
                <span>Hace la transferencia bancaria</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="font-semibold text-green-900">2.</span>
                <span>Capturá el comprobante (screenshot o PDF del banco)</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="font-semibold text-green-900">3.</span>
                <span>Tocá el botón de abajo para enviarlo por WhatsApp</span>
              </p>
            </div>

            <Button
              className="w-full bg-green-600 hover:bg-green-700"
              size="lg"
              onClick={handleOpenWhatsApp}
            >
              <MessageCircle className="h-5 w-5 mr-2" />
              Enviar por WhatsApp
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              Se abrirá WhatsApp con un mensaje pre-cargado
            </p>

            <Alert variant="default" className="bg-white">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-xs">
                <strong>Formatos aceptados:</strong> JPG, PNG o PDF
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Info adicional */}
        <Card className="bg-slate-50">
          <CardContent className="pt-6">
            <h4 className="font-medium text-sm mb-3">¿Qué pasa después?</h4>
            <ol className="space-y-2 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0 text-blue-600" />
                <span>Verificamos tu pago</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0 text-blue-600" />
                <span>Te notificamos cuando esté confirmado</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0 text-blue-600" />
                <span>¡Listo para viajar! 🚗</span>
              </li>
            </ol>
          </CardContent>
        </Card>

        {/* Spacer para evitar que el footer tape contenido */}
        <div className="h-20"></div>
      </div>

      {/* Sticky Bottom Action */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4">
        <div className="container max-w-lg">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => router.push(`/viajes/${tripId}`)}
          >
            Volver al viaje
          </Button>
        </div>
      </div>
    </div>
  );
}
