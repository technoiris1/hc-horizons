import { ApiProperty } from '@nestjs/swagger';

export class LeaderboardEntry {
  @ApiProperty({ description: 'User first name' })
  firstName: string;

  @ApiProperty({ description: 'Total Hackatime hours' })
  hours: number;

  @ApiProperty({ description: 'Total approved hours' })
  approved: number;
}
