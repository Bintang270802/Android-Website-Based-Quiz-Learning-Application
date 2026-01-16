import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  RefreshControl,
  Alert 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Trophy, 
  TrendingUp, 
  Calendar, 
  Target,
  Award,
  Star,
  Medal,
  Crown
} from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { quizAPI } from '@/services/api';
import { Skor } from '@/types/api';
import { BlurCard } from '@/components/ui/BlurCard';
import { FloatingCard } from '@/components/ui/FloatingCard';
import { ShinyText } from '@/components/ui/ShinyText';

export default function SkorScreen() {
  const { user } = useAuth();
  const { colors, isDark } = useTheme();
  const [skorList, setSkorList] = useState<Skor[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalQuiz: 0,
    rataRata: 0,
    skorTertinggi: 0,
    skorTerendah: 100
  });

  useEffect(() => {
    loadSkor();
  }, []);

  const loadSkor = async () => {
    try {
      setLoading(true);
      const data = await quizAPI.getSkor();
      
      // Filter skor untuk user saat ini jika diperlukan
      const userSkor = user ? data.filter(s => s.pengguna_id === user.id) : data;
      setSkorList(userSkor);
      
      // Hitung statistik
      if (userSkor.length > 0) {
        const totalQuiz = userSkor.length;
        const rataRata = userSkor.reduce((sum, s) => sum + s.persentase, 0) / totalQuiz;
        const skorTertinggi = Math.max(...userSkor.map(s => s.persentase));
        const skorTerendah = Math.min(...userSkor.map(s => s.persentase));
        
        setStats({
          totalQuiz,
          rataRata,
          skorTertinggi,
          skorTerendah
        });
      }
    } catch (error) {
      Alert.alert('Error', 'Gagal memuat data skor');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadSkor();
    setRefreshing(false);
  };

  const getScoreIcon = (percentage: number) => {
    if (percentage >= 90) return <Crown size={32} color="#FFD700" />; // Gold
    if (percentage >= 80) return <Medal size={32} color="#C0C0C0" />; // Silver
    if (percentage >= 70) return <Award size={32} color="#CD7F32" />; // Bronze
    if (percentage >= 50) return <Star size={32} color="#FF9800" />; // Orange Star
    if (percentage >= 40) return <Target size={32} color="#FF5722" />; // Deep Orange Target
    if (percentage >= 30) return <Target size={32} color="#F44336" />; // Red Target
    return <Target size={32} color="#D32F2F" />; // Dark Red Target
  };

  const getScoreColor = (percentage: number) => {
    if (percentage >= 90) return colors.success;
    if (percentage >= 80) return colors.primary;
    if (percentage >= 70) return colors.warning;
    if (percentage >= 50) return '#FF9800'; // Orange
    if (percentage >= 40) return '#FF5722'; // Deep Orange
    if (percentage >= 30) return '#F44336'; // Red
    return '#D32F2F'; // Dark Red
  };

  const getGradeText = (percentage: number) => {
    if (percentage >= 90) return 'Excellent';
    if (percentage >= 80) return 'Very Good';
    if (percentage >= 70) return 'Good';
    if (percentage >= 60) return 'Average';
    if (percentage >= 50) return 'Fair';
    if (percentage >= 40) return 'Need Improvement';
    if (percentage >= 30) return 'Poor';
    return 'Insufficient';
  };

  if (loading) {
    return (
      <LinearGradient
        colors={isDark ? ['#0F172A', '#1E293B'] : ['#F8FAFC', '#E2E8F0']}
        style={styles.container}
      >
        <View style={styles.loadingContainer}>
          <Trophy size={48} color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.text }]}>
            Memuat skor...
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
      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <BlurCard style={styles.headerCard}>
          <View style={styles.headerContent}>
            <Trophy size={48} color={colors.primary} />
            <View style={styles.headerText}>
              <ShinyText style={{ ...styles.headerTitle, color: colors.text }}>
                Skor Anda
              </ShinyText>
              <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
                Pantau perkembangan hasil quiz Anda
              </Text>
            </View>
          </View>
        </BlurCard>

        {skorList.length === 0 ? (
          <BlurCard style={styles.emptyCard}>
            <View style={styles.emptyContent}>
              <Star size={72} color={colors.textSecondary} />
              <Text style={[styles.emptyTitle, { color: colors.text }]}>
                Belum Ada Skor
              </Text>
              <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                Mulai quiz untuk melihat skor Anda di sini
              </Text>
            </View>
          </BlurCard>
        ) : (
          <>
            {/* Statistics */}
            <View style={styles.statsContainer}>
              <FloatingCard style={styles.statCard}>
                <Target size={32} color={colors.primary} />
                <Text style={[styles.statNumber, { color: colors.text }]}>
                  {stats.totalQuiz}
                </Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                  Total Quiz
                </Text>
              </FloatingCard>

              <FloatingCard style={styles.statCard}>
                <TrendingUp size={32} color={colors.success} />
                <Text style={[styles.statNumber, { color: colors.text }]}>
                  {Math.round(stats.rataRata)}%
                </Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                  Rata-rata
                </Text>
              </FloatingCard>

              <FloatingCard style={styles.statCard}>
                <Crown size={32} color="#FFD700" />
                <Text style={[styles.statNumber, { color: colors.text }]}>
                  {Math.round(stats.skorTertinggi)}%
                </Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                  Tertinggi
                </Text>
              </FloatingCard>

              <FloatingCard style={styles.statCard}>
                <Medal size={32} color={colors.textSecondary} />
                <Text style={[styles.statNumber, { color: colors.text }]}>
                  {Math.round(stats.skorTerendah)}%
                </Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                  Terendah
                </Text>
              </FloatingCard>
            </View>

            {/* Score History */}
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Riwayat Skor
            </Text>

            <View style={styles.scoreList}>
              {skorList
                .sort((a, b) => new Date(b.dibuat_pada).getTime() - new Date(a.dibuat_pada).getTime())
                .map((skor, index) => (
                <BlurCard key={skor._id} style={styles.scoreCard}>
                  <View style={styles.scoreContent}>
                    <View style={styles.scoreHeader}>
                      <View style={styles.scoreInfo}>
                        {getScoreIcon(skor.persentase)}
                        <View style={styles.scoreText}>
                          <Text style={[styles.scoreName, { color: colors.text }]}>
                            Quiz #{skorList.length - index}
                          </Text>
                          <Text style={[styles.scoreDate, { color: colors.textSecondary }]}>
                            {new Date(skor.dibuat_pada).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric'
                            })}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.scoreResult}>
                        <Text style={[
                          styles.scorePercentage,
                          { color: getScoreColor(skor.persentase) }
                        ]}>
                          {Math.round(skor.persentase)}%
                        </Text>
                        <Text style={[
                          styles.scoreGrade,
                          { color: getScoreColor(skor.persentase) }
                        ]}>
                          {getGradeText(skor.persentase)}
                        </Text>
                      </View>
                    </View>
                    
                    <View style={styles.scoreDetails}>
                      <View style={styles.scoreDetailItem}>
                        <Text style={[styles.scoreDetailLabel, { color: colors.textSecondary }]}>
                          Benar:
                        </Text>
                        <Text style={[styles.scoreDetailValue, { color: colors.success }]}>
                          {skor.total_benar}
                        </Text>
                      </View>
                      <View style={styles.scoreDetailItem}>
                        <Text style={[styles.scoreDetailLabel, { color: colors.textSecondary }]}>
                          Salah:
                        </Text>
                        <Text style={[styles.scoreDetailValue, { color: colors.error }]}>
                          {skor.total_salah}
                        </Text>
                      </View>
                      <View style={styles.scoreDetailItem}>
                        <Text style={[styles.scoreDetailLabel, { color: colors.textSecondary }]}>
                          Total:
                        </Text>
                        <Text style={[styles.scoreDetailValue, { color: colors.text }]}>
                          {skor.total_pertanyaan}
                        </Text>
                      </View>
                      <View style={styles.scoreDetailItem}>
                        <Text style={[styles.scoreDetailLabel, { color: colors.textSecondary }]}>
                          Nilai:
                        </Text>
                        <Text style={[styles.scoreDetailValue, { color: colors.primary }]}>
                          {skor.persentase ? skor.persentase : 0}
                        </Text>
                      </View>
                    </View>
                  </View>
                </BlurCard>
              ))}
            </View>
          </>
        )}
      </ScrollView>
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
    fontSize: 20,
    fontWeight: '500',
  },
  headerCard: {
    margin: 16,
    marginTop: 8,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  headerSubtitle: {
    fontSize: 18,
  },
  emptyCard: {
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  emptyContent: {
    alignItems: 'center',
    gap: 20,
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 16,
    marginBottom: 28,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    gap: 12,
    padding: 8,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 14,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginHorizontal: 16,
    marginBottom: 16,
    marginTop: 8,
  },
  scoreList: {
    paddingHorizontal: 16,
    gap: 12,
    paddingBottom: 32,
  },
  scoreCard: {
    marginBottom: 12,
  },
  scoreContent: {
    gap: 20,
  },
  scoreHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  scoreInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flex: 1,
  },
  scoreText: {
    flex: 1,
  },
  scoreName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  scoreDate: {
    fontSize: 14,
  },
  scoreResult: {
    alignItems: 'flex-end',
  },
  scorePercentage: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  scoreGrade: {
    fontSize: 14,
    fontWeight: '600',
  },
  scoreDetails: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 16,
    paddingBottom: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.15)',
  },
  scoreDetailItem: {
    alignItems: 'center',
    gap: 6,
  },
  scoreDetailLabel: {
    fontSize: 13,
  },
  scoreDetailValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});