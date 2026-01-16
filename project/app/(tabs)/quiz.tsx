import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Alert,
  Dimensions,
  RefreshControl,
  Image // Tambahkan import Image
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BookOpen, ChevronRight, Play, CircleCheck as CheckCircle, Circle as XCircle, Clock, Brain } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { quizAPI } from '@/services/api';
import { Kategori, Pertanyaan } from '@/types/api';
import { BlurCard } from '@/components/ui/BlurCard';
import { GlareCard } from '@/components/ui/GlareCard';
import { AnimatedButton } from '@/components/ui/AnimatedButton';
import { ShinyText } from '@/components/ui/ShinyText';

const { width } = Dimensions.get('window');

export default function QuizScreen() {
  const { user } = useAuth();
  const { colors, isDark } = useTheme();
  const [kategoris, setKategoris] = useState<Kategori[]>([]);
  const [selectedKategori, setSelectedKategori] = useState<Kategori | null>(null);
  const [pertanyaans, setPertanyaans] = useState<Pertanyaan[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [answers, setAnswers] = useState<string[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadKategoris();
  }, []);

  const loadKategoris = async () => {
    try {
      setLoading(true);
      const data = await quizAPI.getKategori();
      setKategoris(data);
    } catch (error) {
      Alert.alert('Error', 'Gagal memuat kategori');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadKategoris();
    setRefreshing(false);
  };

  const handleSelectKategori = async (kategori: Kategori) => {
    try {
      setLoading(true);
      const data = await quizAPI.getPertanyaan(kategori._id);
      if (data.length === 0) {
        Alert.alert('Info', 'Belum ada pertanyaan untuk kategori ini');
        return;
      }
      setSelectedKategori(kategori);
      setPertanyaans(data);
      setCurrentQuestionIndex(0);
      setAnswers([]);
      setSelectedAnswer('');
      setShowResult(false);
      setScore(0);
    } catch (error) {
      Alert.alert('Error', 'Gagal memuat pertanyaan');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAnswer = (option: string) => {
    setSelectedAnswer(option);
  };

  const handleNextQuestion = async () => {
    if (!selectedAnswer) {
      Alert.alert('Perhatian', 'Silakan pilih jawaban');
      return;
    }

    const newAnswers = [...answers, selectedAnswer];
    setAnswers(newAnswers);

    // Submit jawaban ke server
    if (user && pertanyaans[currentQuestionIndex]) {
      try {
        await quizAPI.submitJawaban(
          user.id,
          pertanyaans[currentQuestionIndex]._id,
          selectedAnswer
        );
      } catch (error) {
        console.error('Error submitting answer:', error);
      }
    }

    if (currentQuestionIndex < pertanyaans.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer('');
    } else {
      // Hitung skor
      let correctCount = 0;
      pertanyaans.forEach((q, index) => {
        if (newAnswers[index] === q.pilihan_benar) {
          correctCount++;
        }
      });
      setScore(correctCount);
      setShowResult(true);
    }
  };

  const handleRestartQuiz = () => {
    setSelectedKategori(null);
    setPertanyaans([]);
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setSelectedAnswer('');
    setShowResult(false);
    setScore(0);
  };

  const renderKategoriList = () => {
    return (
      <ScrollView style={styles.scrollView} contentContainerStyle={{ paddingTop: 8 }}>
        <BlurCard style={styles.headerCard}>
          <View style={styles.headerContent}>
            <View style={{
              width: 70,
              height: 70,
              borderRadius: 20,
              backgroundColor: colors.primary + '15',
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 2,
              borderColor: colors.primary + '30',
            }}>
              <Brain size={40} color={colors.primary} />
            </View>
            <View style={styles.headerText}>
              <Text style={[styles.headerTitle, { color: colors.text }]}>
                Pilih Kategori Quiz
              </Text>
              <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
                Pilih topik yang ingin Anda pelajari
              </Text>
            </View>
          </View>
        </BlurCard>
  
        <View style={styles.kategoriList}>
          {kategoris.map((kategori) => (
            <GlareCard
              key={kategori._id}
              style={styles.kategoriCard}
              onPress={() => handleSelectKategori(kategori)}
            >
              <View style={styles.kategoriContent}>
                <View style={styles.kategoriInfo}>
                  {kategori.url_gambar ? (
                    <Image
                      source={{ uri: kategori.url_gambar }} 
                      style={{
                        width: 90,
                        height: 90,
                        borderRadius: 16,
                        borderWidth: 2,
                        borderColor: colors.primary + '40',
                        shadowColor: colors.primary,
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.3,
                        shadowRadius: 5,
                        elevation: 6,
                      }} 
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={{
                      width: 90,
                      height: 90,
                      borderRadius: 16,
                      backgroundColor: colors.primary + '15',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderWidth: 2,
                      borderColor: colors.primary + '40',
                      shadowColor: colors.primary,
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.3,
                      shadowRadius: 5,
                      elevation: 6,
                    }}>
                      <BookOpen size={50} color={colors.primary} />
                    </View>
                  )}
                  <View style={styles.kategoriText}>
                    <Text style={[styles.kategoriName, { color: colors.text }]}>
                      {kategori.nama}
                    </Text>
                    <Text style={[styles.kategoriDate, { color: colors.textSecondary }]}>
                      {new Date(kategori.dibuat_pada).toLocaleDateString('id-ID', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </Text>
                  </View>
                </View>
                <ChevronRight size={20} color={colors.textSecondary} />
              </View>
            </GlareCard>
          ))}
        </View>
      </ScrollView>
    );
  };

  const renderQuestion = () => {
    const currentQuestion = pertanyaans[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / pertanyaans.length) * 100;

    return (
      <ScrollView style={styles.scrollView}>
        {/* Progress Header */}
        <BlurCard style={styles.progressCard}>
          <View style={styles.progressContent}>
            <Text style={[styles.progressText, { color: colors.text }]}>
              Pertanyaan {currentQuestionIndex + 1} dari {pertanyaans.length}
            </Text>
            <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
              <View 
                style={[
                  styles.progressFill, 
                  { 
                    backgroundColor: colors.primary,
                    width: `${progress}%`
                  }
                ]} 
              />
            </View>
          </View>
        </BlurCard>

        {/* Question */}
        <BlurCard style={styles.questionCard}>
          {currentQuestion.url_gambar && (
            <View style={{
              width: '100%',
              height: 320,
              borderRadius: 20,
              overflow: 'hidden',
              marginBottom: 24,
              borderWidth: 1,
              borderColor: colors.border,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.15,
              shadowRadius: 12,
              elevation: 10,
            }}>
              <Image
                source={{ uri: currentQuestion.url_gambar }}
                style={{ width: '100%', height: '100%' }}
                resizeMode="contain"
              />
            </View>
          )}
          <Text style={[styles.questionText, { color: colors.text }]}>
            {currentQuestion.teks_pertanyaan}
          </Text>
        </BlurCard>

        {/* Answer Options */}
        <View style={styles.optionsContainer}>
          {['A', 'B', 'C'].map((option) => {
            const optionText = currentQuestion[`pilihan_${option.toLowerCase()}` as keyof Pertanyaan] as string;
            const isSelected = selectedAnswer === option;
            
            return (
              <GlareCard
                key={option}
                style={[
                  styles.optionCard,
                  isSelected && { 
                    borderColor: colors.primary,
                    borderWidth: 2 
                  }
                ]}
                onPress={() => handleSelectAnswer(option)}
              >
                <View style={styles.optionContent}>
                  <View style={[
                    styles.optionIndicator,
                    { 
                      backgroundColor: isSelected ? colors.primary : colors.border,
                      borderColor: colors.border 
                    }
                  ]}>
                    <Text style={[
                      styles.optionLetter,
                      { color: isSelected ? '#FFFFFF' : colors.text }
                    ]}>
                      {option}
                    </Text>
                  </View>
                  <Text style={[
                    styles.optionText,
                    { color: colors.text }
                  ]}>
                    {optionText}
                  </Text>
                </View>
              </GlareCard>
            );
          })}
        </View>

        {/* Next Button */}
        <View style={styles.buttonContainer}>
          <AnimatedButton
            title={currentQuestionIndex === pertanyaans.length - 1 ? "Selesai" : "Selanjutnya"}
            onPress={handleNextQuestion}
            disabled={!selectedAnswer}
            icon={<ChevronRight size={20} color="#FFFFFF" />}
          />
        </View>
      </ScrollView>
    );
  };

  const renderResult = () => {
    const percentage = Math.round((score / pertanyaans.length) * 100);
    const isGoodScore = percentage >= 70;

    return (
      <ScrollView style={styles.scrollView}>
        <BlurCard style={styles.resultCard}>
          <View style={styles.resultContent}>
            {isGoodScore ? (
              <CheckCircle size={60} color={colors.success} />
            ) : (
              <XCircle size={60} color={colors.error} />
            )}
            
            <ShinyText style={{ ...styles.resultTitle, color: colors.text }}>
              {isGoodScore ? 'Selamat!' : 'Tetap Semangat!'}
            </ShinyText>
            
            <Text style={[styles.resultScore, { color: colors.text }]}>
              {score}/{pertanyaans.length}
            </Text>
            
            <Text style={[styles.resultPercentage, { color: colors.primary }]}>
              {percentage}%
            </Text>
            
            <Text style={[styles.resultMessage, { color: colors.textSecondary }]}>
              {isGoodScore 
                ? 'Excellent! Anda berhasil menyelesaikan quiz dengan baik.'
                : 'Jangan menyerah, terus belajar dan coba lagi!'
              }
            </Text>
          </View>
        </BlurCard>

        <View style={styles.resultActions}>
          <AnimatedButton
            title="Quiz Lain"
            onPress={handleRestartQuiz}
            icon={<Play size={20} color="#FFFFFF" />}
            style={styles.actionButton}
          />
        </View>
      </ScrollView>
    );
  };

  if (loading) {
    return (
      <LinearGradient
        colors={isDark ? ['#0F172A', '#1E293B'] : ['#F8FAFC', '#E2E8F0']}
        style={styles.container}
      >
        <View style={styles.loadingContainer}>
          <Clock size={40} color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.text }]}>
            Memuat...
          </Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={isDark ? ['#0F172A', '#1E293B'] : ['#F8FAFC', '#E2E8F0']}
      style={styles.container}
    >
      {!selectedKategori && renderKategoriList()}
      {selectedKategori && !showResult && renderQuestion()}
      {showResult && renderResult()}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '500',
  },
  headerCard: {
    margin: 16,
    marginTop: 12,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    padding: 16,
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 18,
    opacity: 0.8,
  },
  kategoriList: {
    paddingHorizontal: 16,
    gap: 24,
    paddingBottom: 32,
  },
  kategoriCard: {
    marginBottom: 12,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  kategoriContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 16,
  },
  kategoriInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    flex: 1,
  },
  kategoriText: {
    flex: 1,
  },
  kategoriName: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
  },
  kategoriDate: {
    fontSize: 16,
    opacity: 0.8,
  },
  progressCard: {
    margin: 16,
    marginTop: 8,
  },
  progressContent: {
    gap: 12,
  },
  progressText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  questionCard: {
    margin: 16,
    marginBottom: 24,
  },
  questionText: {
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 28,
    textAlign: 'center',
  },
  optionsContainer: {
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 24,
  },
  optionCard: {
    marginBottom: 4,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  optionIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionLetter: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  optionText: {
    fontSize: 16,
    flex: 1,
    lineHeight: 24,
  },
  buttonContainer: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  resultCard: {
    margin: 16,
    marginTop: 8,
  },
  resultContent: {
    alignItems: 'center',
    gap: 16,
  },
  resultTitle: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  resultScore: {
    fontSize: 24,
    fontWeight: '600',
  },
  resultPercentage: {
    fontSize: 48,
    fontWeight: 'bold',
  },
  resultMessage: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  resultActions: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  actionButton: {
    marginBottom: 12,
  },
  questionImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 16,
  },
});