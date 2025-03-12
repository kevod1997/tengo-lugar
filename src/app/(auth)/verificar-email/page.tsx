import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";

// Import shadcn components
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { LoggingService } from "@/services/logging/logging-service";
import { TipoAccionUsuario } from "@/types/actions-logs";

interface EmailVerifiedPageProps {
	searchParams: { [key: string]: string | string[] | undefined };
}

export default async function EmailVerifiedPage({
	searchParams,
}: EmailVerifiedPageProps) {
	const token = await searchParams.token as string | undefined;
	const userId = await searchParams.userId as string | undefined;
	const callbackURL = await searchParams.callbackURL as string | undefined;

	// If there's no token, show an error message
	if (!token) {
		return (
			<div className="flex items-center justify-center min-h-[70vh]">
				<Card className="w-full max-w-md">
					<CardHeader>
						<CardTitle className="text-center text-red-500">Enlace Inválido</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-center text-muted-foreground">
							No se ha proporcionado un token válido para verificar el email.
						</p>
					</CardContent>
					<CardFooter className="flex justify-center">
						<Link
							href="/"
							className={buttonVariants({
								variant: "default",
							})}
						>
							Volver al inicio
						</Link>
					</CardFooter>
				</Card>
			</div>
		);
	}

	// Log the verification if userId is available
	if (userId) {
		await LoggingService.logActionWithErrorHandling(
			{
				userId: userId,
				action: TipoAccionUsuario.VERIFICACION_EMAIL, 
				status: 'SUCCESS',
				details: { message: 'Email verificado correctamente' }
			},
			{
				fileName: 'verificar-email/page.tsx',
				functionName: 'EmailVerifiedPage'
			}
		);
	}

	// Use a meta refresh for client-side redirection after a short delay
	const redirectTo = callbackURL || "/auth-redirect";

	return (
		<>
			<meta httpEquiv="refresh" content={`2;url=${redirectTo}`} />
			<div className="flex items-center justify-center min-h-[70vh]">
				<Card className="w-full max-w-md">
					<CardHeader>
						<CardTitle className="text-center text-green-500">Email Verificado!</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<p className="text-center text-muted-foreground">
							Tu email ha sido verificado correctamente.
						</p>
						<div className="flex flex-col items-center mt-4">
							<Loader2 className="h-8 w-8 animate-spin text-primary" />
							<p className="mt-2 text-sm text-muted-foreground">Redireccionando...</p>
						</div>
					</CardContent>
				</Card>
			</div>
		</>
	);
}