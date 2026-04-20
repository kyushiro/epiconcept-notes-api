import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtGuard } from '../../../shared/guards/jwt.guard';
import { RolesGuard } from '../../../shared/guards/roles.guard';
import { Roles } from '../../../shared/decorators/roles.decorator';
import { TenantId } from '../../../shared/decorators/tenant-id.decorator';
import {
  NOTE_SERVICE_PORT,
  NoteServicePort,
} from '../../application/ports/note-service.port';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';

@Controller('notes')
@UseGuards(JwtGuard, RolesGuard)
export class NotesController {
  constructor(
    @Inject(NOTE_SERVICE_PORT)
    private readonly noteService: NoteServicePort,
  ) {}

  @Get()
  findAll(@TenantId() tenantId: string) {
    return this.noteService.findAll(tenantId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.noteService.findById(id, tenantId);
  }

  @Post()
  create(
    @TenantId() tenantId: string,
    @Body() dto: CreateNoteDto,
    @Req() req: Request,
  ) {
    const user = (req as any).user;
    return this.noteService.create({
      tenantId,
      authorId: user.id,
      title: dto.title,
      content: dto.content,
    });
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @TenantId() tenantId: string,
    @Body() dto: UpdateNoteDto,
  ) {
    return this.noteService.update(id, tenantId, dto);
  }

  @Delete(':id')
  @Roles('admin')
  async remove(
    @Param('id') id: string,
    @TenantId() tenantId: string,
    @Req() req: Request,
  ) {
    const user = (req as any).user;
    await this.noteService.delete(id, tenantId, user.id, user.role);
    return { deleted: true };
  }
}
