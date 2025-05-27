"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { signUpSchema } from "@/schemas/validation/auth-schemas";
import { toast } from "sonner";
import LoadingButton from "@/components/loader/loading-button";
import { useRouter } from "next/navigation";
import { LoggingService } from "@/services/logging/logging-service";
import { TipoAccionUsuario } from "@/types/actions-logs";
import Header from "@/components/header/header";
import { Button } from "@/components/ui/button";


export default function SignUp() {
    const [pending, setPending] = useState(false);
    const router = useRouter();
    const form = useForm<z.infer<typeof signUpSchema>>({
        resolver: zodResolver(signUpSchema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
            confirmPassword: "",
        },
    });

    const onSubmit = async (values: z.infer<typeof signUpSchema>) => {
        await authClient.signUp.email(
            {
                email: values.email,
                password: values.password,
                name: values.name,
                callbackURL: "/login",
                fetchOptions: {
                    onSuccess: async (context: any) => {
                        await LoggingService.logActionWithErrorHandling(
                            {
                                userId: context.data.user.id,
                                action: TipoAccionUsuario.REGISTRO_USUARIO,
                                status: 'SUCCESS',
                            },
                            {
                                fileName: 'registro/page.tsx',
                                functionName: 'onSubmit'
                            }
                        );
                        toast.success('Cuenta creada exitosamente', {
                            description: 'Chequea tu correo para verificar tu email.'
                        });
                        //1 segundo de espera para que se loguee el usuario
                        await new Promise((resolve) => setTimeout(resolve, 2000));
                        router.push("/login");
                    },

                }
            },
            {
                onRequest: () => {
                    setPending(true);
                },
                onError: (ctx: any) => {
                    
                    toast.error('Error', {
                        description: ctx.error.message ?? "Algo salió mal.",
                    });
                },
            }
        );
        setPending(false);
    };

    return (
        <>
            <Header breadcrumbs={[
                { label: 'Inicio', href: '/' },
                { label: 'Registro' },
            ]} />
            <div className="grow flex items-center justify-center p-4">
                <Card className="w-full max-w-md">
                    <div className="flex justify-center mt-6">
                        <Image
                            src="/imgs/logo.png"
                            alt="Logo"
                            width={60}
                            height={20}
                            className="h-auto rounded-full"
                            priority
                        />
                    </div>
                    <CardHeader>
                        <CardTitle className="text-3xl font-bold text-center text-gray-800">
                            Crear Cuenta
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                {["name", "email", "password", "confirmPassword"].map((field) => {
                                    const labelMap: Record<string, string> = {
                                        name: "Nombre",
                                        email: "Email",
                                        password: "Contraseña",
                                        confirmPassword: "Confirmar Contraseña"
                                    };

                                    const placeholderMap: Record<string, string> = {
                                        name: "Ingresa tu nombre",
                                        email: "Ingresa tu email",
                                        password: "Ingresa tu contraseña",
                                        confirmPassword: "Confirma tu contraseña"
                                    };

                                    return (
                                        <FormField
                                            control={form.control}
                                            key={field}
                                            name={field as keyof z.infer<typeof signUpSchema>}
                                            render={({ field: fieldProps }) => (
                                                <FormItem>
                                                    <FormLabel>
                                                        {labelMap[field]}
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type={
                                                                field.includes("password")
                                                                    ? "password"
                                                                    : field === "email"
                                                                        ? "email"
                                                                        : "text"
                                                            }
                                                            placeholder={placeholderMap[field]}
                                                            {...fieldProps}
                                                            autoComplete="off"
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    )
                                })}
                                <LoadingButton pending={pending}>Registrarse</LoadingButton>
                            </form>
                        </Form>
                        <div className="mt-4 text-center text-sm ">
                            <Button variant="outline" className="w-full">
                               <Link href="/login">
                                ¿Ya tienes una cuenta? Inicia sesión
                            </Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}