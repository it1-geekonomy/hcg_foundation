import { Body, Controller, Post, Param } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
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
  @ApiOperation({
    summary: 'Rebuild the chatbot knowledge base from all configured CMS tables',
  })
  async reindexAll() {
    return this.ingestionService.reindexAll();
  }

  @Post('reindex/:table')
  @ApiOperation({ summary: 'Rebuild the chatbot knowledge base for a single CMS table' })
  async reindexTable(@Param('table') table: string) {
    return this.ingestionService.reindexTable(table);
  }

  @Post('chat')
  @ApiOperation({ summary: 'Ask the NGO chatbot a question' })
  async chat(@Body() dto: AskQuestionDto) {
    return this.chatService.answerQuestion(dto.question);
  }
}
