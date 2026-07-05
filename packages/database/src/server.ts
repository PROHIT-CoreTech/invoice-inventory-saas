export * from './index.js';
import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();

/**
 * Returns a Prisma client extended to automatically isolate and filter all queries by tenantId.
 */
export const getTenantPrisma = (tenantId: string) => {
  return prisma.$extends({
    query: {
      client: {
        async $allOperations({ operation, args, query }: any) {
          if (operation === 'findMany' || operation === 'findFirst' || operation === 'findUnique' || operation === 'findUniqueOrThrow' || operation === 'count') {
            args.where = { ...args.where, tenantId };
          } else if (operation === 'create') {
            args.data = { ...args.data, tenantId };
          } else if (operation === 'update' || operation === 'updateMany' || operation === 'delete' || operation === 'deleteMany') {
            args.where = { ...args.where, tenantId };
          }
          return query(args);
        },
      },
      invoice: {
        async $allOperations({ operation, args, query }: any) {
          if (operation === 'findMany' || operation === 'findFirst' || operation === 'findUnique' || operation === 'findUniqueOrThrow' || operation === 'count') {
            args.where = { ...args.where, tenantId };
          } else if (operation === 'create') {
            args.data = { ...args.data, tenantId };
          } else if (operation === 'update' || operation === 'updateMany' || operation === 'delete' || operation === 'deleteMany') {
            args.where = { ...args.where, tenantId };
          }
          return query(args);
        },
      },
      tenantProfile: {
        async $allOperations({ operation, args, query }: any) {
          if (operation === 'findMany' || operation === 'findFirst' || operation === 'findUnique' || operation === 'findUniqueOrThrow' || operation === 'count') {
            args.where = { ...args.where, tenantId };
          } else if (operation === 'create') {
            args.data = { ...args.data, tenantId };
          } else if (operation === 'update' || operation === 'updateMany' || operation === 'delete' || operation === 'deleteMany') {
            args.where = { ...args.where, tenantId };
          }
          return query(args);
        },
      },
    },
  });
};

export type TenantPrismaClient = ReturnType<typeof getTenantPrisma>;
export { PrismaClient };
