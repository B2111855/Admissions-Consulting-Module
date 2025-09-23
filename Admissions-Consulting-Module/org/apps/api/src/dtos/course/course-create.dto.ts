import {
  IsInt,
  IsString,
  IsOptional,
  MinLength,
  MaxLength,
  IsNotEmpty,
  IsBoolean,
  IsDecimal,
  Min,
  IsEnum,
  IsArray,
  ValidateNested,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';

// Enum cho CourseProgramType - khớp với database schema
export enum CourseProgramType {
  APTECH = 'Aptech',
  ARENA = 'Arena',
  SHORT_TERM_STEAM = 'Short_term___Steam',
}

// DTO cho Course
export class CreateCourseDto {
  @IsString()
  @IsNotEmpty({ message: 'Tên khóa học không được để trống.' })
  @MinLength(3, { message: 'Tên khóa học phải có ít nhất 3 ký tự.' })
  @MaxLength(255, { message: 'Tên khóa học không được vượt quá 255 ký tự.' })
  name!: string;

  @IsString()
  @IsOptional()
  @MaxLength(1000, { message: 'Mô tả không được vượt quá 1000 ký tự.' })
  description?: string;

  @IsString()
  @IsOptional()
  @MaxLength(50, { message: 'Thời lượng không được vượt quá 50 ký tự.' })
  duration_text?: string;

  @IsOptional()
  @Type(() => String)
  @IsDecimal({ decimal_digits: '2', force_decimal: false }, { message: 'Giá phải là một số thập phân hợp lệ với tối đa 2 chữ số sau dấu phẩy.' })
  @Min(0, { message: 'Giá không được là số âm.' })
  price?: string;

  @IsBoolean()
  @IsOptional()
  is_active?: boolean = true;

  @IsEnum(CourseProgramType, { message: 'Loại chương trình không hợp lệ.' })
  @IsOptional()
  program_type?: CourseProgramType = CourseProgramType.SHORT_TERM_STEAM;

  // Optional category_id - nếu có thì sẽ gán course vào category này
  // Nếu không có thì sẽ sử dụng category được tạo mới
  @IsInt({ message: 'ID danh mục phải là số nguyên.' })
  @IsOptional()
  category_id?: number;
}

// DTO cho CourseCategory
export class CreateCourseCategoryDto {
  @IsString()
  @IsNotEmpty({ message: 'Tên danh mục không được để trống.' })
  @MinLength(3, { message: 'Tên danh mục phải có ít nhất 3 ký tự.' })
  @MaxLength(255, { message: 'Tên danh mục không được vượt quá 255 ký tự.' })
  name!: string;

  @IsString()
  @IsOptional()
  @MaxLength(1000, { message: 'Mô tả danh mục không được vượt quá 1000 ký tự.' })
  description?: string;
}

// DTO chính cho việc tạo category với courses
export class CreateCategoryWithCoursesDto {
  @ValidateNested()
  @Type(() => CreateCourseCategoryDto)
  @IsNotEmpty({ message: 'Thông tin danh mục không được để trống.' })
  category!: CreateCourseCategoryDto;

  @IsArray()
  @ArrayMinSize(1, { message: 'Phải có ít nhất 1 khóa học.' })
  @ValidateNested({ each: true })
  @Type(() => CreateCourseDto)
  @IsNotEmpty({ message: 'Danh sách khóa học không được để trống.' })
  courses!: CreateCourseDto[];
}

// DTO alternative - cho trường hợp chỉ muốn tạo courses vào category có sẵn
export class CreateCoursesForExistingCategoryDto {
  @IsInt({ message: 'ID danh mục phải là số nguyên.' })
  @IsNotEmpty({ message: 'ID danh mục không được để trống.' })
  category_id!: number;

  @IsArray()
  @ArrayMinSize(1, { message: 'Phải có ít nhất 1 khóa học.' })
  @ValidateNested({ each: true })
  @Type(() => CreateCourseDto)
  courses!: CreateCourseDto[];
}