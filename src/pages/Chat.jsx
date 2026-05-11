import React, { useState, useRef, useEffect } from 'react';

import OpenAI from 'openai';

import Navigation from '../components/Navigation';
import Footer from '../components/Footer';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '../components/ui/card';

import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { ScrollArea } from '../components/ui/scroll-area';

import {
  Send,
  Bot,
  User,
  Brain,
  Heart,
  Loader2
} from 'lucide-react';

// ======================
// GROQ CONFIG
// ======================

const GROQ_API_KEY = process.env.REACT_APP_GROQ_API_KEY;

const client = new OpenAI({
  apiKey: GROQ_API_KEY,
  baseURL: 'https://api.groq.com/openai/v1',
  dangerouslyAllowBrowser: true
});

// ======================
// COMPONENT
// ======================

const Chat = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content:
        "Hello! I'm your AI Mental Health Assistant. How are you feeling today?",
      timestamp: new Date()
    }
  ]);

  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef(null);

  // ======================
  // MOCK PROFILE
  // ======================

  const mockUserProfile = {
    mbtiType: 'INFP',
    assessmentResults: {
      phq9: {
        score: 8,
        level: 'Mild'
      },
      gad7: {
        score: 12,
        level: 'Moderate'
      }
    }
  };

  // ======================
  // AUTO SCROLL
  // ======================

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth'
    });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // ======================
  // AI RESPONSE (FIXED)
  // ======================

  const generatePersonalizedResponse = async (userMessage) => {
    try {
      if (!GROQ_API_KEY) {
        return 'Groq API key missing in .env file';
      }

      const systemPrompt = `
You are an empathetic AI mental health assistant.

User Profile:
- MBTI Type: ${mockUserProfile.mbtiType}
- PHQ-9: ${mockUserProfile.assessmentResults.phq9.level}
- GAD-7: ${mockUserProfile.assessmentResults.gad7.level}

Rules:
- Be empathetic
- Be supportive
- Keep answers concise
- Avoid medical diagnosis
- Suggest healthy coping mechanisms
`;

      const response = await client.chat.completions.create({
        // 🔥 FIXED MODEL (IMPORTANT)
        model: 'llama-3.1-8b-instant',

        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: userMessage
          }
        ],

        temperature: 0.7,
        max_tokens: 300
      });

      return (
        response.choices?.[0]?.message?.content ||
        'Unable to generate response.'
      );

    } catch (error) {
      console.error('Groq Error:', error);

      if (error?.status === 400) {
        return 'Invalid request. Please check model/API configuration.';
      }

      return 'AI service temporarily unavailable. Please try again later.';
    }
  };

  // ======================
  // SEND MESSAGE
  // ======================

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!inputMessage.trim() || isLoading) return;

    const userText = inputMessage;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: userText,
      timestamp: new Date()
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const botReply = await generatePersonalizedResponse(userText);

      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: botReply,
        timestamp: new Date()
      };

      setMessages((prev) => [...prev, botMessage]);

    } catch (error) {
      console.error(error);

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          type: 'bot',
          content: 'Something went wrong.',
          timestamp: new Date()
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // ======================
  // UI
  // ======================

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />

      <main className="pt-24 pb-4 flex-1 flex flex-col">
        <div className="container mx-auto px-4 max-w-4xl flex-1 flex flex-col">

          {/* HEADER */}
          <div className="text-center mb-6">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Bot className="h-6 w-6 text-blue-500" />
              <h1 className="text-3xl font-bold">
                AI Mental Health Assistant
              </h1>
            </div>

            <p className="text-muted-foreground">
              Personalized emotional support powered by Groq
            </p>
          </div>

          {/* PROFILE */}
          <Card className="mb-6 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Brain className="h-5 w-5" />
                Personalized Session Active
              </CardTitle>
            </CardHeader>

            <CardContent>
              <div className="flex flex-wrap gap-2 mb-3">
                <Badge variant="secondary">
                  MBTI: {mockUserProfile.mbtiType}
                </Badge>

                <Badge variant="outline">
                  Depression: {mockUserProfile.assessmentResults.phq9.level}
                </Badge>

                <Badge variant="outline">
                  Anxiety: {mockUserProfile.assessmentResults.gad7.level}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* CHAT */}
          <Card className="flex-1 flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-red-500" />
                Mental Health Chat
              </CardTitle>

              <CardDescription>
                Talk freely in a supportive environment
              </CardDescription>
            </CardHeader>

            <CardContent className="flex-1 flex flex-col p-0">

              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">

                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.type === 'user'
                          ? 'justify-end'
                          : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg p-3 ${
                          message.type === 'user'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          {message.type === 'bot' ? (
                            <Bot className="h-4 w-4 mt-1" />
                          ) : (
                            <User className="h-4 w-4 mt-1" />
                          )}

                          <div>
                            <p className="text-sm whitespace-pre-wrap">
                              {message.content}
                            </p>

                            <p className="text-xs mt-1 opacity-70">
                              {new Date(
                                message.timestamp
                              ).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 rounded-lg p-3">
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span className="text-sm">Thinking...</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* INPUT */}
              <div className="p-4 border-t">
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <Input
                    value={inputMessage}
                    onChange={(e) =>
                      setInputMessage(e.target.value)
                    }
                    placeholder="Type your message..."
                    className="flex-1"
                    disabled={isLoading}
                  />

                  <Button
                    type="submit"
                    disabled={!inputMessage.trim() || isLoading}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </div>

            </CardContent>
          </Card>

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Chat;