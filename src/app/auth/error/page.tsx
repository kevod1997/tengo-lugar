"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw, Home } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import Header from "@/components/header/header";

function AuthError() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');

  const getErrorMessage = (errorCode: string | null) => {
    switch (errorCode) {
      case 'state_not_found':
        return {
          title: 'Error de Autenticación',
          message: 'La sesión de autenticación expiró o es inválida. Esto puede ocurrir si el proceso de inicio de sesión tardó demasiado o si hubo un cambio en el navegador.',
          action: 'Por favor, intenta iniciar sesión nuevamente.'
        };
      case 'state_mismatch':
        return {
          title: 'Error de Verificación',
          message: 'Hubo un problema verificando tu solicitud de autenticación.',
          action: 'Por favor, intenta iniciar sesión nuevamente.'
        };
      case 'access_denied':
        return {
          title: 'Acceso Denegado',
          message: 'Se canceló el proceso de autenticación o se denegó el acceso.',
          action: 'Si deseas iniciar sesión, intenta nuevamente.'
        };
      case 'callback_error':
        return {
          title: 'Error de Callback',
          message: 'Hubo un problema procesando la respuesta del proveedor de autenticación.',
          action: 'Por favor, intenta iniciar sesión nuevamente.'
        };
      default:
        return {
          title: 'Error de Autenticación',
          message: 'Ocurrió un error durante el proceso de autenticación.',
          action: 'Por favor, intenta iniciar sesión nuevamente.'
        };
    }
  };

  const errorInfo = getErrorMessage(error);

  const handleRetryLogin = () => {
    // Clear any cached auth state and redirect to login
    router.push('/login');
  };

  return (
    <>
      <Header showBackButton={false} />
      <div className="page-content flex items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-destructive/10 rounded-full">
                <AlertCircle className="h-8 w-8 text-destructive" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-destructive">
              {errorInfo.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>¿Qué pasó?</AlertTitle>
              <AlertDescription className="mt-2">
                {errorInfo.message}
              </AlertDescription>
            </Alert>

            {error && (
              <div className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                <strong>Código de error:</strong> {error}
                {errorDescription && (
                  <>
                    <br />
                    <strong>Descripción:</strong> {errorDescription}
                  </>
                )}
              </div>
            )}

            <div className="space-y-3">
              <p className="text-sm text-muted-foreground text-center">
                {errorInfo.action}
              </p>
              
              <div className="space-y-2">
                <Button 
                  onClick={handleRetryLogin} 
                  className="w-full"
                  size="lg"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Intentar Nuevamente
                </Button>

                <Button 
                  variant="outline" 
                  asChild 
                  className="w-full"
                  size="lg"
                >
                  <Link href="/">
                    <Home className="h-4 w-4 mr-2" />
                    Volver al Inicio
                  </Link>
                </Button>
              </div>
            </div>

            <div className="border-t pt-4 text-center">
              <p className="text-xs text-muted-foreground">
                Si el problema persiste, puedes{' '}
                <Link href="/login" className="text-primary hover:underline">
                  intentar con email y contraseña
                </Link>
                {' '}o contactar soporte.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <AuthError />
    </Suspense>
  );
}