import { View, Text, TouchableOpacity, StyleSheet, I18nManager } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { setStoredLanguage } from '../config/i18n';

export default function Home() {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const [showLanguages, setShowLanguages] = useState(false);

  const languages = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'ar', name: 'العربية', flag: '🇲🇦' },
  ];

  const changeLanguage = async (langCode) => {
    await i18n.changeLanguage(langCode);
    await setStoredLanguage(langCode);
    
    // Handle RTL for Arabic
    const isRTL = langCode === 'ar';
    I18nManager.forceRTL(isRTL);
    
    setShowLanguages(false);
  };

  const currentLang = languages.find(l => l.code === i18n.language);

  return (
    <View style={styles.container}>
      
      {/* Language Selector */}
      <TouchableOpacity 
        style={styles.langButton}
        onPress={() => setShowLanguages(!showLanguages)}
      >
        <Text style={styles.langButtonText}>
          {currentLang?.flag} {currentLang?.name}
        </Text>
      </TouchableOpacity>

      {/* Language Dropdown */}
      {showLanguages && (
        <View style={styles.langDropdown}>
          {languages.map((lang) => (
            <TouchableOpacity
              key={lang.code}
              style={styles.langOption}
              onPress={() => changeLanguage(lang.code)}
            >
              <Text style={styles.langOptionText}>
                {lang.flag} {lang.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Logo and Title */}
      <Text style={styles.logo}>📐</Text>
      <Text style={styles.title}>{t('appName')}</Text>
      <Text style={styles.subtitle}>{t('tagline')}</Text>

      {/* Math Topics Preview */}
      <View style={styles.topicsContainer}>
        <Text style={styles.topicBadge}>{t('mathTopics.algebra')}</Text>
        <Text style={styles.topicBadge}>{t('mathTopics.geometry')}</Text>
        <Text style={styles.topicBadge}>{t('mathTopics.calculus')}</Text>
      </View>

      {/* Start Button */}
      <TouchableOpacity 
        style={styles.button}
        onPress={() => router.push('/chat')}
      >
        <Text style={styles.buttonText}>{t('startChat')}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2C3E50',
    padding: 20,
  },
  langButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  langButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  langDropdown: {
    position: 'absolute',
    top: 100,
    right: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 1000,
  },
  langOption: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  langOptionText: {
    fontSize: 16,
    color: '#2C3E50',
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
  subtitle: {
    fontSize: 20,
    color: '#BDC3C7',
    marginBottom: 40,
  },
  topicsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 40,
    gap: 10,
  },
  topicBadge: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    color: '#FFFFFF',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 15,
    fontSize: 14,
  },
  button: {
    backgroundColor: '#3498DB',
    paddingHorizontal: 50,
    paddingVertical: 18,
    borderRadius: 30,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
});
