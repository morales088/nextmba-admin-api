import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { AssignmentsService } from '../services/assignments.service';
import { CreateAssignmentDto } from '../dto/create-assignment.dto';
import { UpdateAssignmentDto } from '../dto/update-assignment.dto';
import { AuthGuard } from '@nestjs/passport';
import { StudentGroupService } from '../services/student-group.service';
import { CreateStudentGroupDto } from '../dto/create-student-group.dto';
import { UpdateStudentGroupDto } from '../dto/update-student-group.dto';
import { CreateMemberDto } from '../dto/create-member.dto';

@Controller('stud-group')
@UseGuards(AuthGuard('jwt'))
export class StudentGroupsController {
  constructor(private readonly studentGroupService: StudentGroupService) {}

  @Get('/')
  async getGroups() {
    return await this.studentGroupService.getGroups();
  }

  @Get('/:groupId')
  async getGroup(@Param('groupId') groupId: number) {
    return await this.studentGroupService.getGroup(groupId);
  }

  @Get('/:groupId/members')
  async getGroupMember(
    @Param('groupId') groupId: number,
    @Query('page_number') page_number?: number,
    @Query('per_page') per_page?: number
  ) {
    const pageNumber = page_number ? page_number : 1;
    const perPage = per_page ? per_page : 10;

    return await this.studentGroupService.getGroupMember(groupId, pageNumber, perPage);
  }

  @Post('/')
  async createGroup(@Body() createStudentGroupDto: CreateStudentGroupDto) {
    const groupData = {
      ...createStudentGroupDto,
    };

    return await this.studentGroupService.createGroup(groupData);
  }

  @Put('/:groupId')
  async updateGroup(@Param('groupId') groupId: number, @Body() updateStudentGroupDto: UpdateStudentGroupDto) {
    const groupData = {
      ...updateStudentGroupDto,
    };

    return await this.studentGroupService.updateGroup(groupId, groupData);
  }

  @Post('/member')
  async addMember(@Body() createMemberDto: CreateMemberDto) {
    const memberData = {
      ...createMemberDto,
    };

    return await this.studentGroupService.addMember(memberData);
  }

  @Delete('/member/:memberId')
  async deleteMember(@Param('memberId') memberId: number) {
    return await this.studentGroupService.deleteMember(memberId);
  }
}
