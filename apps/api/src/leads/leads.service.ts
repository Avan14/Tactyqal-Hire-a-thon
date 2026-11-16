import { randomUUID } from 'node:crypto';
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLeadDto } from './create-lead.dto';

@Injectable()
export class LeadsService {
  private readonly logger = new Logger(LeadsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateLeadDto): Promise<{ id: string; createdAt: Date }> {
    if (dto.website) {
      this.logger.warn('Discarded a lead that filled the honeypot field');
      return { id: randomUUID(), createdAt: new Date() };
    }
    return this.prisma.lead.create({
      data: {
        name: dto.name.trim(),
        email: dto.email.trim().toLowerCase(),
        phone: dto.phone?.trim() || null,
        message: dto.message.trim(),
      },
      select: { id: true, createdAt: true },
    });
  }
}
