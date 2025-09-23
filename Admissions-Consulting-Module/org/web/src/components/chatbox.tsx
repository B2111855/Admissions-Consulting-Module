'use client';

import { useState, useRef, useEffect } from 'react';
import {
  IconMessageChatbot,
  IconMessageChatbotFilled,
  IconSchool,
} from '@tabler/icons-react';

type Message = { sender: 'user' | 'bot'; text: string };

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const [rows, setRows] = useState(1);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg: Message = { sender: 'user', text: input };
    setMessages((prev) => [...prev, userMsg]);

    try {
      const res = await fetch('http://localhost:3000/api/chatbox/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: input }),
      });

      const data = await res.json();
      const answer = data.data?.answer || 'Không có câu trả lời.';

      const botMsg: Message = { sender: 'bot', text: answer };
      setMessages((prev) => [...prev, botMsg]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { sender: 'bot', text: 'Lỗi kết nối server.' },
      ]);
    }

    setInput('');
    setRows(1); // reset textarea sau khi gửi
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setInput(text);

    const el = textareaRef.current;
    if (el) {
      el.style.height = 'auto'; // reset để đo chính xác
      const scrollHeight = el.scrollHeight;
      const lineHeight = 24; // điều chỉnh đúng line-height của bạn
      const maxRows = 2;

      const currentRows = Math.min(
        maxRows,
        Math.floor(scrollHeight / lineHeight)
      );

      setRows(currentRows);
      el.style.overflowY = currentRows >= maxRows ? 'auto' : 'hidden';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Nút mở chat */}
      <div className="fixed bottom-4 right-12 z-50">
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded-full shadow"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? (
            <IconMessageChatbot size={30} />
          ) : (
            <IconMessageChatbotFilled size={30} />
          )}
        </button>
      </div>

      {/* Hộp chat */}
      {isOpen && (
        <div className="fixed bottom-17 right-12 w-80 h-96 bg-blue-200 border border-gray-500 rounded-md shadow-ls z-50 flex flex-col">
          <div className="flex-1 bg-gray-50 border border-gray-300 rounded-t-md overflow-hidden flex flex-col">
            <div className="flex-1 overflow-y-auto p-4 flex flex-col-reverse  gap-2">
              <div ref={messagesEndRef} />

              {[...messages].reverse().map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${
                    msg.sender === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {msg.sender === 'bot' && (
                    <div className="mr-1 self-end text-xl">
                      <IconSchool size={20} className="text-gray-500" />
                    </div>
                  )}
                  <div
                    className={`max-w-[70%] px-4 py-2 rounded-xl shadow text-sm ${
                      msg.sender === 'user'
                        ? 'bg-blue-500 text-white rounded-br-none'
                        : 'bg-gray-200 text-black rounded-bl-none'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              {/* Thẻ đánh dấu để cuộn tới cuối */}
            </div>
          </div>

          <div className="p-2 border-t flex">
            <textarea
              ref={textareaRef}
              className="flex-1 border rounded px-2 py-1 bg-gray-100 border-gray-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-300 transition-all duration-200 resize-none"
              placeholder="Nhập tin nhắn..."
              value={input}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              rows={rows}
              style={{
                maxHeight: '4.8rem', // khoảng 2 dòng
                lineHeight: '24px',
                overflowY: rows >= 2 ? 'auto' : 'hidden',
              }}
            />

            <button
              onClick={sendMessage}
              className="ml-2 bg-blue-500 text-white px-3 rounded"
            >
              Gửi
            </button>
          </div>
        </div>
      )}
    </>
  );
}
