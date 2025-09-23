
import {
  IsString,
  IsNotEmpty,
  IsInt,
  IsOptional,
  Min,
  MaxLength,
  IsBoolean,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CourseUpdateDto {
  @IsNotEmpty({ message: 'Category ID is required.' })
  @IsInt({ message: 'Category ID must be an integer.' })
  @Min(1, { message: 'Category ID must be a positive integer.' })
  @Type(() => Number)
  category_id!: number;

  @IsNotEmpty({ message: 'Course name is required.' })
  @IsString({ message: 'Course name must be a string.' })
  @MaxLength(255, { message: 'Course name cannot exceed 255 characters.' })
  name!: string;

  @IsOptional()
  @IsString({ message: 'Description must be a string.' })
  description?: string;

  @IsOptional()
  @IsString({ message: 'Duration text must be a string.' })
  @MaxLength(50, { message: 'Duration text cannot exceed 50 characters.' })
  duration_text?: string;

  @IsOptional()
  @IsNumber({}, { message: 'Price must be a number.' })
  @Type(() => Number)
  @Min(0, { message: 'Price cannot be negative.' })

  price?: number;

  @IsOptional()
  @IsBoolean({ message: 'Is active must be a boolean.' })
  @Type(() => Boolean)
  is_active?: boolean;
}
