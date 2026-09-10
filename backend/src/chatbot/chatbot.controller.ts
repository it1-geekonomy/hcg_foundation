import { Body, Controller, Post, Param } from '@nestjs/common';
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
    summary: 'Rebuild chatbot knowledge base (super-admin)',
  })
  async reindexAll() {
    return this.ingestionService.reindexAll();
  }

  @Post('reindex/:table')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Rebuild chatbot KB for one table (super-admin)' })
  async reindexTable(@Param('table') table: string) {
    return this.ingestionService.reindexTable(table);
  }

  @Public()
  @Post('chat')
  @ApiOperation({ summary: 'Ask the NGO chatbot a question' })
  async chat(@Body() dto: AskQuestionDto) {
    return this.chatService.answerQuestion(dto.question);
  }
}
