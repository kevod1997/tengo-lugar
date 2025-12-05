"use client";

import { useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import Header from "@/components/header/header";
import LoadingButton from "@/components/loader/loading-button";
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
import { authClient } from "@/lib/auth-client";
import { forgotPasswordSchema } from "@/schemas/validation/auth-schemas";

import type { z } from "zod";


export default function ForgotPassword() {
	const [isPending, setIsPending] = useState(false);

	const form = useForm<z.infer<typeof forgotPasswordSchema>>({
		resolver: zodResolver(forgotPasswordSchema),
		defaultValues: {
			email: "",
		},
	});

	const onSubmit = async (data: z.infer<typeof forgotPasswordSchema>) => {
		setIsPending(true);
		const { error } = await authClient.requestPasswordReset({
			email: data.email,
			redirectTo: "/resetear-clave",
		});

		if (error) {
			toast.error('Error', {
				description: error.message,
			});
		} else {
			toast.success('Exito', {
				description:
					"Si el email ingresado corresponde a una cuenta existente, recibirás un email con instrucciones para resetear tu contraseña.",
			});
		}
		setIsPending(false);
	};

	return (
		<>
			<Header
			/>
			<div className="page-content flex items-center justify-center">
				<Card className="w-full max-w-md">
					<CardHeader>
						<CardTitle className="text-3xl font-bold text-center text-gray-800">
							Olvide mi contraseña
						</CardTitle>
					</CardHeader>
					<CardContent>
						<Form {...form}>
							<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
								<FormField
									control={form.control}
									name="email"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Email</FormLabel>
											<FormControl>
												<Input
													type="email"
													placeholder="Ingresa tu email"
													{...field}
													autoComplete="email"
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<LoadingButton pending={isPending}>Enviar</LoadingButton>
							</form>
						</Form>
					</CardContent>
				</Card>
			</div>
		</>
	);
}