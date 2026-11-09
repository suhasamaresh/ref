import React, { useState, useRef, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
// We will lazy-load expo-av at runtime because some SDKs / devices
// can throw during module initialization if native modules are missing.
// Avoid importing `Audio` at module top-level to prevent a red native crash.
import * as FileSystem from 'expo-file-system';
import config from '../../config/env';

type Message = {
  id: string;
  text: string;
  fromMe?: boolean;
  timestamp?: number;
};

type Props = {
  visible: boolean;
  onClose: () => void;
};

export default function ChatModal({ visible, onClose }: Props) {
  const { theme } = useTheme();
  // Unique id generator to avoid duplicate keys when many messages are created quickly
  const messageCounterRef = useRef<number>(1);
  const generateId = () => `${Date.now()}-${messageCounterRef.current++}`;

  const [messages, setMessages] = useState<Message[]>([
    { id: generateId(), text: 'Hi! How can we help you today?', fromMe: false, timestamp: Date.now() - 60000 },
  ]);
  const [text, setText] = useState('');
  const flatRef = useRef<FlatList<Message> | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const recordingRef = useRef<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const recordingTimerRef = useRef<any>(null);
  const audioModuleRef = useRef<any>(null);
  const [audioAvailable, setAudioAvailable] = useState<boolean>(true);

  // Try to lazy-load expo-av; guard against failures
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const mod = await import('expo-av');
        if (!mounted) return;
        audioModuleRef.current = mod.Audio;
        setAudioAvailable(!!mod?.Audio && !!mod.Audio.Recording && typeof mod.Audio.requestPermissionsAsync === 'function');
      } catch (err) {
        console.warn('[ChatModal] failed to load expo-av dynamically', err);
        audioModuleRef.current = null;
        setAudioAvailable(false);
      }
    })();
    return () => { mounted = false; };
  }, []);
  // (old top-level Audio check removed) audioAvailable is set by the lazy loader above

  useEffect(() => {
    if (visible) {
      setTimeout(() => flatRef.current?.scrollToEnd?.({ animated: true }), 50);
    }
  }, [visible]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
    };
  }, []);

  const send = () => {
    if (!text.trim()) return;
    const msg: Message = {
      id: generateId(),
      text: text.trim(),
      fromMe: true,
      timestamp: Date.now(),
    };
    setMessages(prev => [...prev, msg]);
    setText('');

    // Send typed message to backend /chat and show the reply
    (async () => {
      try {
        const languageHint = detectLanguage(text.trim());
        const resp = await fetch(`${backendBase}/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: 'guest', message: msg.text, language: languageHint }),
        });
        const json = await resp.json();
        const reply = json?.reply || "Sorry, I couldn't process that right now.";
        setMessages(prev => [...prev, { id: generateId(), text: reply, fromMe: false, timestamp: Date.now() }]);
        setTimeout(() => flatRef.current?.scrollToEnd?.({ animated: true }), 50);
      } catch (e) {
        setMessages(prev => [...prev, { id: generateId(), text: "Failed to contact server.", fromMe: false, timestamp: Date.now() }]);
      }
    })();
  };

  const backendBase = config.MULTILINGUAL_CHATBOT_URL || 'http://127.0.0.1:8000'; // multilingual chatbot backend (FastAPI)

  // Simple language detection heuristic based on Unicode ranges and common scripts.
  const detectLanguage = (s: string) => {
    if (!s || s.trim().length === 0) return undefined;
    // Arabic Unicode block
    if (/\p{Script=Arabic}/u.test(s)) return 'ar';
    // Devanagari (Hindi)
    if (/\p{Script=Devanagari}/u.test(s)) return 'hi';
    // Bengali
    if (/\p{Script=Bengali}/u.test(s)) return 'bn';
    // Tamil
    if (/\p{Script=Tamil}/u.test(s)) return 'ta';
    // Telugu
    if (/\p{Script=Telugu}/u.test(s)) return 'te';
    // Kannada
    if (/\p{Script=Kannada}/u.test(s)) return 'kn';
    // Malayalam
    if (/\p{Script=Malayalam}/u.test(s)) return 'ml';
    // CJK -> Chinese
    if (/\p{Script=Han}/u.test(s)) return 'zh';
    // Quick Spanish/Portuguese hint by common words
    if (/\b(que|por|para|gracias|hola|buenos)\b/i.test(s)) return 'es';
    // Fallback: undefined
    return undefined;
  };

  const startRecording = async () => {
    try {
      if (!audioAvailable || !audioModuleRef.current) {
        console.warn('[ChatModal] Audio module unavailable; cannot record.');
        setMessages(prev => [...prev, { id: generateId(), text: 'Audio recording not available on this device or SDK version.', fromMe: false }]);
        return;
      }
      const perm = await audioModuleRef.current.requestPermissionsAsync();
      const granted = (perm as any).granted || (perm as any).status === 'granted';
      if (!granted) {
        setMessages(prev => [...prev, { id: generateId(), text: 'Microphone permission is required to record. Please enable it in your device settings.', fromMe: false }]);
        console.warn('[ChatModal] Microphone permission denied', perm);
        return;
      }

      // Configure audio mode for recording/playback across platforms
      try {
        await audioModuleRef.current.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
          interruptionModeIOS: (audioModuleRef.current as any).INTERRUPTION_MODE_IOS_DO_NOT_MIX,
          shouldDuckAndroid: true,
          interruptionModeAndroid: (audioModuleRef.current as any).INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
          playThroughEarpieceAndroid: false,
        } as any);
      } catch (modeErr) {
        console.warn('[ChatModal] setAudioModeAsync failed', modeErr);
      }

      const recording = new audioModuleRef.current.Recording();
      try {
        await recording.prepareToRecordAsync(audioModuleRef.current.RECORDING_OPTIONS_PRESET_HIGH_QUALITY);
      } catch (prepErr) {
        console.warn('[ChatModal] prepareToRecordAsync failed', prepErr);
        setMessages(prev => [...prev, { id: generateId(), text: 'Unable to prepare recording on this device.', fromMe: false }]);
        return;
      }

      try {
        await recording.startAsync();
      } catch (startErr) {
        console.warn('[ChatModal] startAsync failed', startErr);
        setMessages(prev => [...prev, { id: generateId(), text: 'Failed to start recording.', fromMe: false }]);
        return;
      }

      // reset and start visual timer
      setRecordingSeconds(0);
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
      recordingTimerRef.current = setInterval(() => setRecordingSeconds(s => s + 1), 1000);

      recordingRef.current = recording;
      setIsRecording(true);
    } catch (e) {
      console.warn('startRecording error', e);
      setMessages(prev => [...prev, { id: generateId(), text: 'Failed to start recording.', fromMe: false }]);
    }
  };

  const stopRecordingAndSend = async () => {
    try {
      setIsRecording(false);
      // stop visual timer
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
      const recordedDuration = recordingSeconds;
      setRecordingSeconds(0);
      setIsProcessing(true);
      const recording = recordingRef.current;
      if (!recording) return;
      try {
        await recording.stopAndUnloadAsync();
      } catch (stopErr) {
        console.warn('[ChatModal] stopAndUnloadAsync failed', stopErr);
      }
      const uri = recording.getURI();
      recordingRef.current = null;

      if (!uri) {
        setMessages(prev => [...prev, { id: generateId(), text: 'Recording failed to produce a file.', fromMe: false }]);
        setIsProcessing(false);
        return;
      }

  // Attach a placeholder message while processing
  const processingId = generateId();
  setMessages(prev => [...prev, { id: processingId, text: 'Processing voice message...', fromMe: true }] );

      // Upload file as multipart to /stt endpoint which accepts multipart file
  console.log('[ChatModal] recorded file uri:', uri, 'duration(s)=', recordedDuration);
      const fileInfo = await FileSystem.getInfoAsync(uri);
      console.log('[ChatModal] file info:', fileInfo);
      const formData: any = new FormData();
      let name = uri.split('/').pop() || 'voice.wav';
      // Ensure filename has an allowed extension; append .wav if missing
      if (!name.includes('.')) {
        name = `${name}.wav`;
      }
      // Try to pick a reasonable MIME type from the extension
      const ext = name.split('.').pop()?.toLowerCase() || 'wav';
      const mimeMap: any = { wav: 'audio/wav', m4a: 'audio/mp4', mp3: 'audio/mpeg', caf: 'audio/x-caf', aac: 'audio/aac' };
      const type = mimeMap[ext] || 'audio/wav';
      // @ts-ignore - React Native FormData file
      formData.append('file', { uri, name, type });

      // Upload and handle network errors
      let sttResp;
      try {
        sttResp = await fetch(`${backendBase}/stt`, {
          method: 'POST',
          body: formData,
          // Let fetch set Content-Type including boundary
        } as any);
      } catch (fetchErr) {
        console.warn('[ChatModal] /stt fetch failed', fetchErr);
        setMessages(prev => [...prev, { id: generateId(), text: 'Failed to upload audio to server. Please check your connection.', fromMe: false }]);
        setIsProcessing(false);
        return;
      }

      let sttJson: any = null;
      try {
        sttJson = await sttResp.json();
      } catch (err) {
        console.warn('[ChatModal] failed to parse /stt response', err);
        const textBody = await sttResp.text().catch(() => '<no-body>');
        console.warn('[ChatModal] /stt response text:', textBody);
        sttJson = { error: 'Invalid server response' };
      }
      // remove processing placeholder
      setMessages(prev => prev.filter(m => m.id !== processingId));

      if (!sttResp.ok || sttJson.error) {
        const errMsg = sttJson?.error || sttJson?.message || `Failed to transcribe audio (status ${sttResp.status}).`;
        console.warn('[ChatModal] /stt error', errMsg, sttJson);
        setMessages(prev => [...prev, { id: generateId(), text: errMsg, fromMe: false }]);
        setIsProcessing(false);
        return;
      }

      const recognized = sttJson.text || '';
      // add user's transcribed message
  const userMsg: Message = { id: generateId(), text: recognized, fromMe: true, timestamp: Date.now() };
  setMessages(prev => [...prev, userMsg]);

      // Send to chat endpoint to get reply
      // Forward language hint from STT if available
      const languageHint = sttJson.language || detectLanguage(recognized);
      const chatResp = await fetch(`${backendBase}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: 'guest', message: recognized, language: languageHint }),
      });
      const chatJson = await chatResp.json();
      if (!chatResp.ok) {
        const chatBody = await chatResp.text().catch(() => '<no-body>');
        console.warn('[ChatModal] /chat error status', chatResp.status, 'body', chatBody);
        setMessages(prev => [...prev, { id: generateId(), text: 'Failed to get reply from chatbot.', fromMe: false }]);
        setIsProcessing(false);
        return;
      }

      const replyText = chatJson.reply || chatJson.message || 'Sorry, no reply.';
  setMessages(prev => [...prev, { id: generateId(), text: replyText, fromMe: false, timestamp: Date.now() }]);

      // Try requesting TTS for the reply (optional)
      try {
        const ttsLanguage = chatJson.language || languageHint || 'en';
        const ttsResp = await fetch(`${backendBase}/tts`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: replyText, language: ttsLanguage }),
        });
        const ttsJson = await ttsResp.json();
        if (ttsResp.ok && ttsJson.audio_url) {
            const sound = new audioModuleRef.current.Sound();
            await sound.loadAsync({ uri: ttsJson.audio_url } as any);
            await sound.playAsync();
        }
      } catch (e) {
        // ignore TTS playback errors
        console.warn('TTS playback failed', e);
      }

      setIsProcessing(false);
    } catch (e) {
      console.warn('stopRecording error', e);
      setMessages(prev => [...prev, { id: generateId(), text: 'Failed to process recording. Please try again or check server logs.', fromMe: false }]);
      setIsProcessing(false);
    }
  };

  const renderItem = ({ item }: { item: Message }) => (
    <View style={[styles.messageRow, item.fromMe ? styles.fromMe : styles.fromThem]}>
      <Text style={[styles.messageText, { color: item.fromMe ? '#FFFFFF' : '#A3A3A3' }]}>{item.text}</Text>
    </View>
  );

  // Format seconds as MM:SS
  const formatTime = (s: number) => {
    const mm = Math.floor(s / 60);
    const ss = s % 60;
    return `${mm}:${ss.toString().padStart(2, '0')}`;
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.modalWrap}>
        <SafeAreaKeyboardAvoiding onClose={onClose}>
          <View style={styles.header}>
            <Text style={styles.title}>Support</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} accessibilityLabel="Close chat">
              <Ionicons name="close" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <View style={styles.listWrap}>
            <FlatList
              ref={instance => { flatRef.current = instance as any; }}
              data={messages}
              keyExtractor={m => m.id}
              renderItem={renderItem}
              contentContainerStyle={styles.list}
            />
          </View>

          <View style={styles.inputRow}> 
            <TextInput
              placeholder="Type a message..."
              placeholderTextColor="#A3A3A3"
              value={text}
              onChangeText={(value) => {
                if (value.endsWith('\n')) {
                  const cleaned = value.replace(/\n+$/, '');
                  setText(cleaned);
                  setTimeout(() => send(), 0);
                  return;
                }
                setText(value);
              }}
              style={styles.input}
              multiline
              blurOnSubmit={true}
              returnKeyType="send"
              onSubmitEditing={() => send()}
              onKeyPress={({ nativeEvent }) => {
                if (nativeEvent.key === 'Enter') {
                  if (!text.endsWith('\n')) {
                    setTimeout(() => send(), 0);
                  }
                }
              }}
            />
            <TouchableOpacity
              onPress={() => {
                if (isRecording) {
                  stopRecordingAndSend();
                } else {
                  startRecording();
                }
              }}
              style={[styles.micBtn, isRecording ? styles.micBtnActive : null]}
              accessibilityLabel={isRecording ? 'Stop recording' : 'Start voice recording'}
              disabled={!audioAvailable || isProcessing}
            >
              <Ionicons name={isRecording ? 'stop' : 'mic'} size={20} color="#FFFFFF" />
            </TouchableOpacity>
            {!audioAvailable ? (
              <View style={{ justifyContent: 'center', alignItems: 'center', marginRight: 8 }}>
                <Text style={{ color: '#FFB4B4', fontSize: 12 }}>Voice unavailable</Text>
              </View>
            ) : null}
            {/* Recording duration display */}
            {isRecording ? (
              <View style={{ justifyContent: 'center', alignItems: 'center', marginRight: 8 }}>
                <Text style={{ color: '#FFFFFF', fontSize: 12 }}>{formatTime(recordingSeconds)}</Text>
              </View>
            ) : null}
            <TouchableOpacity onPress={send} style={styles.sendBtn} accessibilityLabel="Send message">
              <Ionicons name="send" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </SafeAreaKeyboardAvoiding>
      </SafeAreaView>
    </Modal>
  );
}

function SafeAreaKeyboardAvoiding({ children, onClose }: any) {
  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      {children}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  modalWrap: {
    flex: 1,
    backgroundColor: '#121212', // Deep black background
  },
  listWrap: {
    flex: 1,
  },
  header: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)', // Subtle white border
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF', // White for contrast
    letterSpacing: 0.5,
  },
  closeBtn: {
    position: 'absolute',
    right: 20,
    top: 18,
  },
  list: {
    flexGrow: 1,
    padding: 20,
    paddingBottom: 10,
  },
  messageRow: {
    marginBottom: 15,
    maxWidth: '80%',
    padding: 12,
    borderRadius: 12,
  },
  fromMe: {
    alignSelf: 'flex-end',
    backgroundColor: '#14B8A6', // Emerald green
  },
  fromThem: {
    alignSelf: 'flex-start',
    backgroundColor: '#1E1E1E', // Slightly lighter black
  },
  messageText: {
    fontSize: 14,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)', // Subtle white border
  },
  input: {
    flex: 1,
    minHeight: 48,
    maxHeight: 120,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#1E1E1E', // Slightly lighter black
    color: '#FFFFFF', // White for contrast
    marginRight: 10,
  },
  sendBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#14B8A6', // Emerald green
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#14B8A6',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  micBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#334155', // muted slate
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  micBtnActive: {
    backgroundColor: '#ef4444', // red when recording
  },
});