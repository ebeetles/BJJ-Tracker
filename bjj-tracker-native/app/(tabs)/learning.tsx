import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, KeyboardAvoidingView, Platform, SafeAreaView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
};

export default function LearningScreen() {
  const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hello! I'm your BJJ AI assistant. I can help you with:\n\n• Technique explanations and step-by-step guides\n• Training advice and strategies\n• Competition preparation tips\n• Injury prevention and recovery\n• BJJ philosophy and mindset\n\nWhat would you like to learn about today?",
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const GEMINI_API_KEY = 'AIzaSyCqUAoSkqtmRAP1F9t3iASx8DHebSYtyUQ';

  const fetchGeminiResponse = async (message: string) => {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `You are a Brazilian Jiu-Jitsu (BJJ) black belt and expert instructor. Provide helpful, accurate, and detailed advice about BJJ techniques, training, competition, and general BJJ knowledge. Keep responses informative but concise. Here's the user's question: ${message}`
                  }
                ]
              }
            ]
          })
        }
      );
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      const data = await response.json();
      if (
        data.candidates &&
        data.candidates[0] &&
        data.candidates[0].content &&
        data.candidates[0].content.parts
      ) {
        return data.candidates[0].content.parts[0].text;
      } else {
        throw new Error('Invalid response format from Gemini API');
      }
    } catch (error) {
      console.error('Gemini API Error:', error);
      throw new Error('Failed to get response from AI assistant. Please try again.');
    }
  };

  const sendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputText.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      // Call Gemini API instead of simulating
      const aiText = await fetchGeminiResponse(userMessage.content);
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiText,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsLoading(false);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm sorry, I'm having trouble connecting right now. Please try again later.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      setIsLoading(false);
    }
  };

  const generateAIResponse = (userInput: string): string => {
    const input = userInput.toLowerCase();
    
    if (input.includes('triangle') || input.includes('choke')) {
      return "The triangle choke is a powerful submission from the guard position. Here's how to set it up:\n\n1. Start in closed guard\n2. Break your opponent's posture down\n3. Control one arm and trap it across their body\n4. Lock your legs in a figure-four around their neck and arm\n5. Squeeze your legs together while pulling down on their head\n\nKey points: Keep your legs tight, control their posture, and use your core to finish the choke.";
    }
    
    if (input.includes('armbar') || input.includes('arm bar')) {
      return "The armbar is a fundamental submission that can be applied from various positions:\n\nFrom Guard:\n1. Control your opponent's wrist\n2. Open your guard and hip out\n3. Swing your leg over their head\n4. Keep their arm straight and close to your body\n5. Bridge and extend your hips\n\nFrom Mount:\n1. Trap their arm between your legs\n2. Control their wrist and rotate\n3. Fall to your back while keeping their arm straight\n4. Bridge and finish the submission";
    }
    
    if (input.includes('sweep') || input.includes('guard')) {
      return "Sweeps are essential for getting from bottom to top position. Here are some popular sweeps:\n\nScissor Sweep:\n1. Control both sleeves\n2. Place one foot on their hip, other on their thigh\n3. Scissor your legs while pulling them forward\n4. Follow them to mount or side control\n\nHip Bump Sweep:\n1. From closed guard, break their posture\n2. Bridge your hips up\n3. Use your arms to guide them over\n4. Follow to mount or side control";
    }
    
    if (input.includes('defense') || input.includes('escape')) {
      return "Defense and escapes are crucial in BJJ. Here are some key principles:\n\n1. Stay calm and breathe\n2. Create frames to create space\n3. Bridge and shrimp to escape\n4. Protect your neck at all times\n5. Use your legs to create distance\n\nRemember: Defense is not just about surviving, but about creating opportunities to escape or counter-attack.";
    }
    
    if (input.includes('competition') || input.includes('compete')) {
      return "Competition preparation involves both physical and mental aspects:\n\nPhysical:\n• Increase training intensity 4-6 weeks before\n• Focus on competition-specific techniques\n• Work on your cardio and strength\n• Practice your game plan\n\nMental:\n• Visualize your matches\n• Develop a pre-competition routine\n• Stay focused on your goals\n• Remember to have fun and learn from every experience";
    }
    
    if (input.includes('injury') || input.includes('prevent')) {
      return "Injury prevention is crucial for long-term BJJ practice:\n\n1. Always warm up properly\n2. Tap early and often - there's no shame in it\n3. Listen to your body and rest when needed\n4. Focus on technique over strength\n5. Maintain good posture and alignment\n6. Stretch regularly and work on flexibility\n\nIf you do get injured, rest and seek professional medical advice before returning to training.";
    }
    
    return "That's an interesting question! I'd be happy to help you with BJJ techniques, training advice, competition preparation, or any other aspect of Brazilian Jiu-Jitsu. Could you be more specific about what you'd like to learn?";
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View style={[
      styles.messageContainer,
      item.role === 'user' ? styles.userMessage : styles.assistantMessage
    ]}>
      <Text style={[
        styles.messageText,
        item.role === 'user' ? styles.userMessageText : styles.assistantMessageText
      ]}>
        {item.content}
      </Text>
      <Text style={styles.timestamp}>
        {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </Text>
    </View>
  );

  useEffect(() => {
    if (flatListRef.current && messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8f9fa' }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={item => item.id}
          style={styles.container}
          contentContainerStyle={[styles.messagesContent, { paddingBottom: insets.bottom + 16 }]}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View style={styles.header}>
              <Text style={styles.title}>Learning</Text>
              <Text style={styles.subtitle}>BJJ AI Assistant</Text>
            </View>
          }
          ListFooterComponent={
            <>
              {isLoading && (
                <View style={styles.loadingContainer}>
                  <View style={styles.loadingBubble}>
                    <Text style={styles.loadingText}>AI is thinking...</Text>
                  </View>
                </View>
              )}
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.textInput}
                  value={inputText}
                  onChangeText={setInputText}
                  placeholder="Ask about BJJ techniques, training advice, etc..."
                  multiline
                  maxLength={500}
                  placeholderTextColor="#999"
                />
                <TouchableOpacity
                  style={[styles.sendButton, (!inputText.trim() || isLoading) && styles.sendButtonDisabled]}
                  onPress={sendMessage}
                  disabled={!inputText.trim() || isLoading}
                >
                  <Text style={styles.sendButtonText}>Send</Text>
                </TouchableOpacity>
              </View>
            </>
          }
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: '#f8f9fa', // handled by SafeAreaView
    padding: 16
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    flexWrap: 'wrap',
    gap: 16
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333'
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
    marginLeft: 8
  },
  messagesContent: {
    paddingBottom: 20
  },
  messageContainer: {
    marginBottom: 20,
    maxWidth: '85%'
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#4CAF50',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 12,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4
  },
  assistantMessage: {
    alignSelf: 'flex-start',
    backgroundColor: 'white',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#e0e0e0'
  },
  messageText: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 4
  },
  userMessageText: {
    color: 'white'
  },
  assistantMessageText: {
    color: '#333'
  },
  timestamp: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
    marginTop: 4
  },
  loadingContainer: {
    paddingHorizontal: 20,
    paddingBottom: 10
  },
  loadingBubble: {
    alignSelf: 'flex-start',
    backgroundColor: 'white',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#e0e0e0'
  },
  loadingText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic'
  },
  inputContainer: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
    borderRadius: 8,
    marginTop: 16,
    padding: 12
  },
  textInput: {
    flex: 1,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    maxHeight: 100,
    fontSize: 16,
    backgroundColor: '#fafafa'
  },
  sendButton: {
    backgroundColor: '#667eea',
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4
  },
  sendButtonDisabled: {
    backgroundColor: '#ccc',
    shadowOpacity: 0
  },
  sendButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600'
  },
  addButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600'
  }
}); 