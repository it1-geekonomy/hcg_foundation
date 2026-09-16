import { Body, Controller, Post, Param, HttpStatus } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../common/decorators/public.decorator';
import { IngestionService } from './services/ingestion.service';
import { ChatService } from './services/chat.service';
import { AskQuestionDto } from './dto/ask-question.dto';

@ApiTags('chatbot')
@Controller('chatbot')
export class ChatbotController {
  constructor(
    private readonly ingestionService: IngestionService,
    private readonly chatService: ChatService,
  ) {}

  @Post('reindex')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Rebuild chatbot knowledge base (CMS / super-admin)',
    description:
      'Pushes all published CMS rows to the AI service, then runs fingerprint sync for static/knowledge files.',
  })
  async reindexAll() {
    const data = await this.ingestionService.reindexAll();
    return {
      statusCode: HttpStatus.OK,
      message: 'Chatbot knowledge base reindex started successfully',
      data,
    };
  }

  @Post('reindex/:table')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Rebuild chatbot KB for one table (CMS / super-admin)' })
  async reindexTable(@Param('table') table: string) {
    const data = await this.ingestionService.reindexTable(table);
    return {
      statusCode: HttpStatus.OK,
      message: `Chatbot knowledge base reindexed for ${table}`,
      data,
    };
  }

  @Public()
  @Post('chat')
  @ApiOperation({
    summary: 'Ask the HCG Foundation chatbot a question',
    description:
      'Public website endpoint. Does not re-sync the index. Pass sessionId for follow-ups.',
  })
  async chat(@Body() dto: AskQuestionDto) {
    const data = await this.chatService.answerQuestion(
      dto.question,
      dto.sessionId,
    );
    return {
      statusCode: HttpStatus.OK,
      message: 'Chatbot reply generated successfully',
      data,
    };
  }
}
