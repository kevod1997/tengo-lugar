// "use client";

// import { Suspense } from "react";
// import { useRouter, useSearchParams } from "next/navigation";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
// import Image from "next/image";
// import { Loader2 } from "lucide-react";

// // This component uses useSearchParams, so it needs to be inside a Suspense boundary
// function NotFoundContent() {
//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const from = searchParams.get("from") || "";

//   return (
//     <div className="container flex items-center justify-center min-h-[80vh]">
//       <Card className="w-full max-w-md shadow-lg">
//         <CardHeader className="space-y-1 text-center">
//           <div className="flex justify-center mb-4">
//             <Image
//               src="/imgs/logo.png"
//               alt="Logo"
//               width={80}
//               height={80}
//               className="rounded-full"
//               priority
//             />
//           </div>
//           <CardTitle className="text-3xl font-bold">Página no encontrada</CardTitle>
//         </CardHeader>
//         <CardContent className="text-center space-y-4">
//           <p className="text-muted-foreground">
//             Lo sentimos, la página que estás buscando no existe o ha sido movida.
//           </p>
//           {from && (
//             <p className="text-sm text-muted-foreground">
//               Ruta: <code className="bg-muted px-1 py-0.5 rounded">{from}</code>
//             </p>
//           )}
//           <div className="flex items-center justify-center mt-8">
//             <Image
//               src="/imgs/logo.png"
//               alt="Página no encontrada"
//               width={200}
//               height={150}
//               className="opacity-75"
//             />
//           </div>
//         </CardContent>
//         <CardFooter className="flex flex-col space-y-2">
//           <Button 
//             onClick={() => router.push("/")}
//             className="w-full"
//           >
//             Volver al inicio
//           </Button>
//           <Button 
//             variant="outline" 
//             onClick={() => router.back()}
//             className="w-full"
//           >
//             Volver atrás
//           </Button>
//         </CardFooter>
//       </Card>
//     </div>
//   );
// }

// // Main component with Suspense boundary
// export default function NotFound() {
//   return (
//     <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
//       <NotFoundContent />
//     </Suspense>
//   );
// }

import Link from 'next/link'
 
export default function NotFound() {
  return (
    <div>
      <h2>Not Found</h2>
      <p>Could not find requested resource</p>
      <Link href="/">Return Home</Link>
    </div>
  )
}