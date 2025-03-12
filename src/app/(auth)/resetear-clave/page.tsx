"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { resetPasswordSchema } from "@/schemas/validation/auth-schemas";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import LoadingButton from "@/components/loader/loading-button";
import { Loader2 } from "lucide-react";

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const error = searchParams.get("error");
  const [isPending, setIsPending] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isTokenValid, setIsTokenValid] = useState(true);

  useEffect(() => {
    // Validate token on mount
    if (!token || error === "invalid_token") {
      setIsTokenValid(false);
    }
    
    // Short delay to ensure state is properly set
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 100);
    
    return () => clearTimeout(timer);
  }, [token, error]);

  const form = useForm<z.infer<typeof resetPasswordSchema>>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof resetPasswordSchema>) => {
    setIsPending(true);
    const { error } = await authClient.resetPassword({
      newPassword: data.password,
      token: token ?? undefined,
    });

    if (error) {
      toast.error('Error', {
        description: error.message,
      });
    } else {
      toast.success('Éxito', {
        description: "Contraseña restablecida correctamente. Inicia sesión para continuar.",
      });
      router.push("/login");
    }
    setIsPending(false);
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="grow flex items-center justify-center p-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Invalid token state
  if (!isTokenValid || error === "invalid_token") {
    return (
      <>
        {/* Meta refresh tag for redirection after 3 seconds */}
        <meta httpEquiv="refresh" content="1;url=/login" />
        <div className="grow flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-3xl font-bold text-center text-gray-800">
                Enlace inválido
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-center text-gray-600">
                  Este enlace para restablecer la contraseña es inválido o ha expirado.
                </p>
                <p className="text-center text-gray-500 text-sm mt-4">
                  Redirigiendo al inicio de sesión...
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  // Valid token state - show form
  return (
    <div className="grow flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center text-gray-800">
            Resetear contraseña
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nueva contraseña</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Ingresa tu nueva contraseña"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirmar contraseña</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Confirma tu nueva contraseña"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <LoadingButton pending={isPending}>Resetear contraseña</LoadingButton>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ResetPassword() {
  return <ResetPasswordContent />;
}