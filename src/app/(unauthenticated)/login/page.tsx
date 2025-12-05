"use client";

import { Suspense, useState } from "react";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, AlertCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { FaFacebook, FaGoogle } from "react-icons/fa";
import { toast } from "sonner";


import Header from "@/components/header/header";
import LoadingButton from "@/components/loader/loading-button";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
import { Separator } from "@/components/ui/separator";
import { authClient } from "@/lib/auth-client";
import { signInSchema } from "@/schemas/validation/auth-schemas";

import type { ErrorContext } from "@better-fetch/fetch";
import type { z } from "zod";

function SignIn() {
	const [pendingCredentials, setPendingCredentials] = useState(false);
	const [pendingGoogle, setPendingGoogle] = useState(false);
	const [pendingFacebook, setPendingFacebook] = useState(false);
	const searchParams = useSearchParams();
	const redirectUrl = searchParams.get('redirect_url');

	// Obtener parámetros de error
	const error = searchParams.get('error');
	const errorMessage = searchParams.get('message');

	const form = useForm<z.infer<typeof signInSchema>>({
		resolver: zodResolver(signInSchema),
		defaultValues: {
			email: "",
			password: "",
		},
	});

	const handleCredentialsSignIn = async (
		values: z.infer<typeof signInSchema>
	) => {
		await authClient.signIn.email(
			{
				email: values.email,
				password: values.password,
				callbackURL: redirectUrl
					? `/api/auth-redirect?redirect_url=${encodeURIComponent(redirectUrl)}`
					: "/api/auth-redirect",
			},
			{
				onRequest: () => {
					setPendingCredentials(true);
				},
				onError: (ctx: ErrorContext) => {
					if (ctx.error.status === 401) {
						toast.error('Error', {
							description: "Email o contraseña incorrectos.",
						});
					} else {
						toast.error('Error', {
							description: ctx.error.message ?? "Algo salió mal.",
						});
					}
				},
			}
		);
		setPendingCredentials(false);
	};

	const handleSignInWithGoogle = async () => {
		await authClient.signIn.social(
			{
				provider: "google",
				callbackURL: redirectUrl
					? `/api/auth-redirect?redirect_url=${encodeURIComponent(redirectUrl)}`
					: "/api/auth-redirect",
				errorCallbackURL: "/auth/error",
			},
			{
				onRequest: () => {
					setPendingGoogle(true);
				},
				onError: (ctx: ErrorContext) => {
					toast.error('Error de Autenticación', {
						description: ctx.error.message?.includes('state_not_found') 
							? "La sesión expiró. Intenta nuevamente."
							: ctx.error.message ?? "Algo salió mal.",
					});
				},
			}
		);
		setPendingGoogle(false);
	};

	const handleSignInWithFacebook = async () => {
		await authClient.signIn.social(
			{
				provider: "facebook",
				callbackURL: redirectUrl
					? `/api/auth-redirect?redirect_url=${encodeURIComponent(redirectUrl)}`
					: "/api/auth-redirect",
				errorCallbackURL: "/auth/error",
			},
			{
				onRequest: () => {
					setPendingFacebook(true);
				},
				onError: (ctx: ErrorContext) => {
					toast.error('Error de Autenticación', {
						description: ctx.error.message?.includes('state_not_found') 
							? "La sesión expiró. Intenta nuevamente."
							: ctx.error.message ?? "Algo salió mal.",
					});
				},
			}
		);
		setPendingFacebook(false);
	};

	return (
		<>
			<Header
				showBackButton={false}
			/>
			<div className="page-content flex items-center justify-center">
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
							Iniciar Sesión
						</CardTitle>
					</CardHeader>
					<CardContent>
						{/* Mostrar alerta de error si existe */}
						{error && (
							<Alert variant="destructive" className="mb-6">
								<AlertCircle className="h-4 w-4" />
								<AlertDescription>
									{errorMessage || 'Ocurrió un error durante la autenticación. Por favor, intenta de nuevo.'}
								</AlertDescription>
							</Alert>
						)}

						<Form {...form}>
							<form
								onSubmit={form.handleSubmit(handleCredentialsSignIn)}
								className="space-y-6"
							>
								{["email", "password"].map((field) => {
									const labelMap: Record<string, string> = {
										email: "Email",
										password: "Contraseña"
									};

									const placeholderMap: Record<string, string> = {
										email: "Ingresa tu email",
										password: "Ingresa tu contraseña"
									};

									return (
										<FormField
											control={form.control}
											key={field}
											name={field as keyof z.infer<typeof signInSchema>}
											render={({ field: fieldProps }) => (
												<FormItem>
													<FormLabel>
														{labelMap[field]}
													</FormLabel>
													<FormControl>
														<Input
															type={field === "password" ? "password" : "email"}
															placeholder={placeholderMap[field]}
															{...fieldProps}
															autoComplete={
																field === "password" ? "current-password" : "email"
															}
														/>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
									)
								})}
								<LoadingButton pending={pendingCredentials}>
									Iniciar sesión
								</LoadingButton>
							</form>
						</Form>

						<div className="mt-4">
							<LoadingButton
								pending={pendingGoogle}
								onClick={handleSignInWithGoogle}
							>
								<FaGoogle className="w-4 h-4 mr-2" />
								Continuar con Google
							</LoadingButton>
						</div>

						<div className="mt-4">
							<LoadingButton
								pending={pendingFacebook}
								onClick={handleSignInWithFacebook}
							>
								<FaFacebook className="w-4 h-4 mr-2" />
								Continuar con Facebook
							</LoadingButton>
						</div>

						<Separator className="mt-4" />

						<div className="mt-4 text-center text-sm">
							<Link
								href="/olvide-mi-clave"
								className="text-primary hover:underline"
							>
								¿Olvidaste tu contraseña?
							</Link>
						</div>

						<Separator className="mt-4" />

						<div className="mt-4 text-center text-sm">
							<Link
								href="/crear-cuenta"
								className="text-primary hover:underline"
							>
								¿No tienes cuenta? Regístrate
							</Link>
						</div>
					</CardContent>
				</Card>
			</div>
		</>
	);
}

export default function SignInPage() {
	return (
		<Suspense fallback={
			<div className="flex items-center justify-center min-h-screen">
				<Loader2 className="h-8 w-8 animate-spin text-primary" />
			</div>
		}>
			<SignIn />
		</Suspense>
	)
}