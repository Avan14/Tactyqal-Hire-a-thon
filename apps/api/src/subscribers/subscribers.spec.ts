import { Prisma } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { SubscribersService } from './subscribers';

function serviceWithUpsert(upsert: jest.Mock) {
  return new SubscribersService({
    subscriber: { upsert },
  } as unknown as PrismaService);
}

describe('SubscribersService.subscribe', () => {
  it('treats a concurrent duplicate insert as already subscribed', async () => {
    // Two simultaneous upserts for one email can both try to insert;
    // the loser fails on the unique index with P2002.
    const upsert = jest.fn().mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
        code: 'P2002',
        clientVersion: 'test',
      }),
    );
    await expect(
      serviceWithUpsert(upsert).subscribe('asha@example.com'),
    ).resolves.toBeUndefined();
  });

  it('still surfaces other database errors', async () => {
    const upsert = jest.fn().mockRejectedValue(new Error('connection lost'));
    await expect(
      serviceWithUpsert(upsert).subscribe('asha@example.com'),
    ).rejects.toThrow('connection lost');
  });
});
