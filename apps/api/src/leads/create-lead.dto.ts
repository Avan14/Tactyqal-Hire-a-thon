import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';

export class CreateLeadDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name!: string;

  @IsEmail()
  @MaxLength(254)
  email!: string;

  /** Digits, spaces, hyphens and an optional leading +. */
  @IsOptional()
  @IsString()
  @Matches(/^\+?[\d\s-]{7,20}$/, {
    message: 'phone must be a valid phone number',
  })
  phone?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  message!: string;

  /**
   * Honeypot. Hidden from people in the form, so only bots fill it.
   * Filled submissions get a normal-looking response and are discarded.
   */
  @IsOptional()
  @IsString()
  @MaxLength(200)
  website?: string;
}
