import { ServiceUnavailableException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { HealthController } from './health.controller';

function controllerWithQuery(queryRaw: jest.Mock) {
  return new HealthController({
    $queryRaw: queryRaw,
  } as unknown as PrismaService);
}

describe('HealthController', () => {
  it('reports ok when the database answers', async () => {
    const res = await controllerWithQuery(
      jest.fn().mockResolvedValue([]),
    ).check();
    expect(res).toMatchObject({ status: 'ok', database: 'up' });
  });

  it('answers 503 with database "down" when the database is unreachable', async () => {
    const check = controllerWithQuery(
      jest.fn().mockRejectedValue(new Error('ECONNREFUSED')),
    ).check();
    await expect(check).rejects.toBeInstanceOf(ServiceUnavailableException);
    await expect(check).rejects.toMatchObject({
      response: { status: 'error', database: 'down' },
    });
  });
});
