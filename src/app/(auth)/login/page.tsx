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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import Image from "next/image";
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ErrorContext } from "@better-fetch/fetch";
import { signInSchema } from "@/schemas/validation/auth-schemas";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import LoadingButton from "@/components/loader/loading-button";
import { FaFacebook, FaGoogle } from "react-icons/fa";
import { Separator } from "@/components/ui/separator";
import { Loader2 } from "lucide-react";
import Header from "@/components/header/header";

function SignIn() {
	const [pendingCredentials, setPendingCredentials] = useState(false);
	const [pendingGoogle, setPendingGoogle] = useState(false);
	// const [pendingFacebook, setPendingFacebook] = useState(false);
	const searchParams = useSearchParams();
	const redirectUrl = searchParams.get('redirect_url');

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
				callbackURL: `${redirectUrl ? `/auth-redirect?redirect_url=${encodeURIComponent(redirectUrl)}` : "/auth-redirect"}`,
			},
			{
				onRequest: () => {
					setPendingCredentials(true);
				},
				onError: (ctx: ErrorContext) => {
					console.log(ctx)
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
				callbackURL: `${redirectUrl ? `/auth-redirect?redirect_url=${encodeURIComponent(redirectUrl)}` : "/auth-redirect"}`,
			},
			{
				onRequest: () => {
					setPendingGoogle(true);
				},
				onError: (ctx: ErrorContext) => {
					console.log(ctx)
					toast.error('Error', {
						description: ctx.error.message ?? "Algo salió mal.",
					});
				},
			}
		);
		setPendingGoogle(false);
	};

	// const handleSignInWithFacebook = async () => {
	// 	await authClient.signIn.social(
	// 		{
	// 			provider: "facebook",
	// 			callbackURL: `${redirectUrl ? `/auth-redirect?redirect_url=${encodeURIComponent(redirectUrl)}` : "/auth-redirect"}`,
	// 		},
	// 		{
	// 			onRequest: () => {
	// 				setPendingFacebook(true);
	// 			},
	// 			onError: (ctx: ErrorContext) => {
	// 				toast.error('Error', {
	// 					description: ctx.error.message ?? "Algo salió mal.",
	// 				});
	// 			},
	// 		}
	// 	);
	// 	setPendingFacebook(false);
	// };

	return (
		<>
			<Header
				breadcrumbs={[
					{ label: 'Inicio', href: '/' },
					{ label: 'Login' },
				]
				} />
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
							Iniciar Sesión
						</CardTitle>
					</CardHeader>
					<CardContent>
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
								pending={false}
								// pending={pendingFacebook}
								onClick={() => toast.info("Esta funcionalidad no está disponible aún")}
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
								href="/registro"
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
		<Suspense fallback={<div className="flex items-center justify-center min-h-screen"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
			<SignIn />
		</Suspense>
	)
}