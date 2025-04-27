import { Controller, Get, Param, UseGuards, BadRequestException, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getUserProfile(@Param('id') id: string) {
    try {
      const userId = parseInt(id);
      if (isNaN(userId)) {
        throw new BadRequestException('User ID must be a valid integer');
      }

      console.log('ℹ️ [UserController] Fetching user profile:', userId);
      const user = await this.userService.getUserById(userId);
      return {
        message: 'User profile fetched successfully',
        data: user,
      };
    } catch (error) {
      console.error('🚨 [UserController] Error fetching user profile:', error.message);
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to fetch user profile: ' + error.message);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/events')
  async getUserEvents(@Param('id') id: string) {
    try {
      const userId = parseInt(id);
      if (isNaN(userId)) {
        throw new BadRequestException('User ID must be a valid integer');
      }

      console.log('ℹ️ [UserController] Fetching events for user:', userId);
      const events = await this.userService.getUserEvents(userId);
      return {
        message: 'User events fetched successfully',
        data: events,
      };
    } catch (error) {
      console.error('🚨 [UserController] Error fetching user events:', error.message);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to fetch user events: ' + error.message);
    }
  }
}