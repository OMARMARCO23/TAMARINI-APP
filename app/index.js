import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useLanguage } from '../context/LanguageContext';
import { SafeAreaView } from 'react-native-safe-area-context';

const languages = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'ar', name: 'العربية', flag: '🇲🇦' },
];

export default function Home() {
  const router = useRouter();
  const { language, changeLanguage, t } = useLanguage();
  const [showModal, setShowModal] = useState(false);

  const currentLang = languages.find((l) => l.code === language);

  return (
    <SafeAreaView style={styles.container}>
      {/* Language Button */}
      <TouchableOpacity
        style={styles.langButton}
        onPress={() => setShowModal(true)}
      >
        <Text style={styles.langButtonText}>
          {currentLang?.flag} {currentLang?.name}
        </Text>
      </TouchableOpacity>

      {/* Logo and Title */}
      <View style={styles.content}>
        <Text style={styles.logo}>📐</Text>
        <Text style={styles.title}>{t('appName')}</Text>
        <Text style={styles.tagline}>{t('tagline')}</Text>

        {/* Math Topics */}
        <View style={styles.topics}>
          <Text style={styles.topic}>➕ Algebra</Text>
          <Text style={styles.topic}>📊 Geometry</Text>
          <Text style={styles.topic}>📈 Calculus</Text>
        </View>

        {/* Start Button */}
        <TouchableOpacity
          style={styles.startButton}
          onPress={() => router.push('/chat')}
        >
          <Text style={styles.startButtonText}>{t('startChat')}</Text>
        </TouchableOpacity>
      </View>

      {/* Language Modal */}
      <Modal
        visible={showModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowModal(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t('selectLanguage')}</Text>
            {languages.map((lang) => (
              <TouchableOpacity
                key={lang.code}
                style={[
                  styles.langOption,
                  language === lang.code && styles.langOptionActive,
                ]}
                onPress={() => {
                  changeLanguage(lang.code);
                  setShowModal(false);
                }}
              >
                <Text style={styles.langOptionText}>
                  {lang.flag} {lang.name}
                </Text>
                {language === lang.code && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2C3E50',
  },
  langButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    zIndex: 10,
  },
  langButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  logo: {
    fontSize: 100,
    marginBottom: 20,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  tagline: {
    fontSize: 20,
    color: '#BDC3C7',
    marginBottom: 40,
  },
  topics: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 40,
  },
  topic: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    color: '#FFFFFF',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 15,
    fontSize: 14,
  },
  startButton: {
    backgroundColor: '#3498DB',
    paddingHorizontal: 50,
    paddingVertical: 18,
    borderRadius: 30,
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    width: '80%',
    maxWidth: 300,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#2C3E50',
  },
  langOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  langOptionActive: {
    backgroundColor: '#EBF5FB',
  },
  langOptionText: {
    fontSize: 16,
    color: '#2C3E50',
  },
  checkmark: {
    fontSize: 18,
    color: '#3498DB',
  },
});
