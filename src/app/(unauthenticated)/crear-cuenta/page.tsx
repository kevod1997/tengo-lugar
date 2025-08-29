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
import { Eye, EyeOff, LogIn, UserPlus } from "lucide-react";
import { FaFacebook, FaGoogle } from "react-icons/fa";
import { Separator } from "@/components/ui/separator";
import { ErrorContext } from "better-auth/react";


export default function SignUp() {
    const [pending, setPending] = useState(false);
    const [pendingGoogle, setPendingGoogle] = useState(false);
    const [pendingFacebook, setPendingFacebook] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
                onError: (ctx: ErrorContext) => {
                    toast.error('Error', {
                        description: ctx.error.status === 422 ? "Este email ya se encuentra en uso." : "Algo salió mal.",
                    });
                },
            }
        );
        setPending(false);
    };

    const handleSignUpWithGoogle = async () => {
        await authClient.signIn.social(
            {
                provider: "google",
                callbackURL: "/api/auth-redirect",
            },
            {
                onRequest: () => {
                    setPendingGoogle(true);
                },
                onError: (ctx: ErrorContext) => {
                    toast.error('Error', {
                        description: ctx.error.message ?? "Algo salió mal.",
                    });
                },
            }
        );
        setPendingGoogle(false);
    };

    const handleSignUpWithFacebook = async () => {
        await authClient.signIn.social(
            {
                provider: "facebook",
                callbackURL: "/api/auth-redirect",
            },
            {
                onRequest: () => {
                    setPendingFacebook(true);
                },
                onError: (ctx: ErrorContext) => {
                    toast.error('Error', {
                        description: ctx.error.message ?? "Algo salió mal.",
                    });
                },
            }
        );
        setPendingFacebook(false);
    };

    return (
        <>
            <Header
                showBackButton={false} />
            <div className="page-content flex items-center justify-center">
                <Card className="w-full max-w-md">
                    <div className="flex justify-center mt-4">
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

                                    // Determinar tipo de input y visibilidad
                                    const getInputType = () => {
                                        if (field === "password") return showPassword ? "text" : "password";
                                        if (field === "confirmPassword") return showConfirmPassword ? "text" : "password";
                                        if (field === "email") return "email";
                                        return "text";
                                    };

                                    const isPasswordField = field.includes("password");

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
                                                        <div className="relative">
                                                            <Input
                                                                type={getInputType()}
                                                                placeholder={placeholderMap[field]}
                                                                {...fieldProps}
                                                                autoComplete="off"
                                                                className={isPasswordField ? "pr-10" : ""}
                                                            />
                                                            {isPasswordField && (
                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                                                    onClick={() => {
                                                                        if (field === "password") {
                                                                            setShowPassword(!showPassword);
                                                                        } else {
                                                                            setShowConfirmPassword(!showConfirmPassword);
                                                                        }
                                                                    }}
                                                                    aria-label={
                                                                        field === "password"
                                                                            ? (showPassword ? "Ocultar contraseña" : "Mostrar contraseña")
                                                                            : (showConfirmPassword ? "Ocultar contraseña" : "Mostrar contraseña")
                                                                    }
                                                                >
                                                                    {((field === "password" && showPassword) ||
                                                                        (field === "confirmPassword" && showConfirmPassword)) ? (
                                                                        <EyeOff className="h-4 w-4 text-gray-500" />
                                                                    ) : (
                                                                        <Eye className="h-4 w-4 text-gray-500" />
                                                                    )}
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    )
                                })}
                                <LoadingButton pending={pending}>
                                    <UserPlus className="h-4 w-4" />
                                    Registrarse</LoadingButton>
                            </form>
                        </Form>

                        <Separator className="mt-6" />

                        <div className="mt-4">
                            <LoadingButton
                                pending={pendingGoogle}
                                onClick={handleSignUpWithGoogle}
                            >
                                <FaGoogle className="w-4 h-4 mr-2" />
                                Registrarse con Google
                            </LoadingButton>
                        </div>

                        <div className="mt-4">
                            <LoadingButton
                                pending={pendingFacebook}
                                onClick={handleSignUpWithFacebook}
                            >
                                <FaFacebook className="w-4 h-4 mr-2" />
                                Registrarse con Facebook
                            </LoadingButton>
                        </div>

                        <Separator className="mt-4" />

                        <div className="mt-4 text-center text-sm ">
                            <Button variant="outline" className="w-full">
                                <LogIn className="h-4 w-4" />
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