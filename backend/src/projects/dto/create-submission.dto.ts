import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateSubmissionDto {
  @ApiProperty({ description: 'ID of the project to submit' })
  @IsNumber()
  @IsNotEmpty()
  projectId: number;
}
