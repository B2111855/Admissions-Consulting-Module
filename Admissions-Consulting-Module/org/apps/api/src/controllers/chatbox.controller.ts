import { JsonController, Post, BodyParam } from 'routing-controllers';
import jsend from '../jsend';
import { answerQuestion } from '../services/chatbox.service';

@JsonController('/chatbox')
export class ChatboxController {
  @Post('/ask')
  async ask(@BodyParam('question') question?: string) {
    if (!question || question.trim() === '') {
      return jsend.fail('Thiếu câu hỏi!');
    }

    try {
      const answer = await answerQuestion(question.trim());
      return jsend.success({ answer });
    } catch (error) {
      console.error('Lỗi xử lý câu hỏi:', error);
      return jsend.error('Đã xảy ra lỗi khi xử lý câu hỏi.');
    }
  }
}
