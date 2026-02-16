import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class HackatimeProjectsInfoResponse {
  @ApiProperty({ description: 'Project ID' })
  projectId: number;

  @ApiPropertyOptional({ description: 'Linked Hackatime project names', type: [String] })
  hackatimeProjects: string[];

  @ApiPropertyOptional({ description: 'Total Hackatime hours' })
  hackatimeHours: number;
}
