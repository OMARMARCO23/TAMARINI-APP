import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function MessageBubble({ message, isUser, isRTL }) {
  return (
    <View
      style={[
        styles.bubble,
        isUser ? styles.userBubble : styles.botBubble,
        isRTL && styles.rtl,
      ]}
    >
      {!isUser && <Text style={styles.botIcon}>📐</Text>}
      <Text
        style={[
          styles.text,
          isUser ? styles.userText : styles.botText,
          isRTL && styles.rtlText,
        ]}
      >
        {message}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  bubble: {
    maxWidth: '80%',
    padding: 15,
    borderRadius: 20,
    marginBottom: 10,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#3498DB',
    borderBottomRightRadius: 5,
  },
  botBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  rtl: {
    flexDirection: 'row-reverse',
  },
  botIcon: {
    fontSize: 20,
    marginBottom: 5,
  },
  text: {
    fontSize: 16,
    lineHeight: 22,
  },
  userText: {
    color: '#FFFFFF',
  },
  botText: {
    color: '#2C3E50',
  },
  rtlText: {
    textAlign: 'right',
  },
});
