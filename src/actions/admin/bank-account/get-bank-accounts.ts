'use server'

import prisma from "@/lib/prisma";
import { ApiHandler } from "@/lib/api-handler";
import { requireAuthorization } from "@/utils/helpers/auth-helper";
import { logActionWithErrorHandling } from "@/services/logging/logging-service";
import { TipoAccionUsuario } from "@/types/actions-logs";

export interface BankAccountForAdmin {
  id: string;
  bankAlias: string;
  accountOwner: string;
  isVerified: boolean;
  verifiedAt: string | null;
  verifiedBy: string | null;
  createdAt: string;
  updatedAt: string;

  // User info
  userId: string;
  userName: string;
  userEmail: string;
  userPhoneNumber: string | null;
}

export interface BankAccountsResponse {
  bankAccounts: BankAccountForAdmin[];
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

interface GetBankAccountsParams {
  page?: number;
  pageSize?: number;
  isVerified?: 'ALL' | 'true' | 'false';
  searchTerm?: string;
}

export async function getBankAccounts(params: GetBankAccountsParams = {}) {
  try {
    const session = await requireAuthorization('admin', 'get-bank-accounts.ts', 'getBankAccounts');

    const {
      page = 1,
      pageSize = 10,
      isVerified = 'ALL',
      searchTerm = '',
    } = params;

    // Build where clause
    const where: any = {};

    // Filter by verification status
    if (isVerified !== 'ALL') {
      where.isVerified = isVerified === 'true';
    }

    // Search filter
    if (searchTerm) {
      where.OR = [
        {
          user: {
            name: {
              contains: searchTerm,
              mode: 'insensitive'
            }
          }
        },
        {
          user: {
            email: {
              contains: searchTerm,
              mode: 'insensitive'
            }
          }
        },
        {
          bankAlias: {
            contains: searchTerm,
            mode: 'insensitive'
          }
        }
      ];
    }

    // Get total count for pagination
    const total = await prisma.bankAccount.count({ where });

    // Get bank accounts with user data
    const bankAccounts = await prisma.bankAccount.findMany({
      where,
      select: {
        id: true,
        bankAlias: true,
        accountOwner: true,
        isVerified: true,
        verifiedAt: true,
        verifiedBy: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phoneNumber: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip: (page - 1) * pageSize,
      take: pageSize
    });

    // Format response
    const formattedBankAccounts: BankAccountForAdmin[] = bankAccounts.map(account => ({
      id: account.id,
      bankAlias: account.bankAlias,
      accountOwner: account.accountOwner,
      isVerified: account.isVerified,
      verifiedAt: account.verifiedAt?.toISOString() || null,
      verifiedBy: account.verifiedBy,
      createdAt: account.createdAt.toISOString(),
      updatedAt: account.updatedAt.toISOString(),
      userId: account.user.id,
      userName: account.user.name,
      userEmail: account.user.email,
      userPhoneNumber: account.user.phoneNumber
    }));

    const totalPages = Math.ceil(total / pageSize);

    // Log successful action
    await logActionWithErrorHandling({
      userId: session.user.id,
      action: TipoAccionUsuario.ADMIN_GET_BANK_ACCOUNTS,
      status: 'SUCCESS',
      details: {
        page,
        pageSize,
        isVerified,
        searchTerm,
        totalResults: total
      }
    }, { fileName: 'get-bank-accounts.ts', functionName: 'getBankAccounts' });

    const response: BankAccountsResponse = {
      bankAccounts: formattedBankAccounts,
      pagination: {
        total,
        page,
        pageSize,
        totalPages
      }
    };

    return ApiHandler.handleSuccess(response, 'Cuentas bancarias obtenidas exitosamente');

  } catch (error) {
    return ApiHandler.handleError(error);
  }
}
