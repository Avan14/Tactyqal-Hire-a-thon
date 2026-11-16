import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Injectable,
  Module,
  Post,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Transform } from 'class-transformer';
import { IsEmail, MaxLength } from 'class-validator';
import { PrismaService } from '../prisma/prisma.service';

export class SubscribeDto {
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsEmail()
  @MaxLength(254)
  email!: string;
}

@Injectable()
export class SubscribersService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Idempotent: subscribing twice is not an error. The caller always gets the
   * same answer, so the endpoint cannot be used to check who is subscribed.
   */
  async subscribe(email: string): Promise<void> {
    await this.prisma.subscriber.upsert({
      where: { email },
      create: { email },
      update: {},
    });
  }
}

@ApiTags('subscribers')
@Controller('subscribers')
export class SubscribersController {
  constructor(private readonly subscribers: SubscribersService) {}

  /** Newsletter sign-up from the site footer. */
  @Post()
  @HttpCode(HttpStatus.ACCEPTED)
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  async subscribe(@Body() dto: SubscribeDto) {
    await this.subscribers.subscribe(dto.email);
    return { status: 'subscribed' };
  }
}

@Module({
  controllers: [SubscribersController],
  providers: [SubscribersService],
})
export class SubscribersModule {}
