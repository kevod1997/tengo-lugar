import { ServerActionError } from "@/lib/exceptions/server-action-error"
import { Prisma, PrismaClient } from "@prisma/client"
import { DefaultArgs } from "@prisma/client/runtime/library"


export const findDriver = async (userId: string, tx: Omit<PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">) => {
    const driver = await tx.driver.findFirst({
        where: {
            userId
        }
    })

    if (!driver) {
        throw ServerActionError.NotFound('find-driver.ts', 'findDriver', 'Conductor no encontrado')
    }
    return driver
}