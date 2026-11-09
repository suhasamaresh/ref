import React from 'react';
import {
  View,
  ActivityIndicator,
  StyleSheet,
  Text,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import Modal from './Modal';

interface LoadingProps {
  visible: boolean;
  text?: string;
  overlay?: boolean;
  size?: 'small' | 'large';
  color?: string;
}

export default function Loading({
  visible,
  text,
  overlay = true,
  size = 'large',
  color,
}: LoadingProps) {
  const { theme } = useTheme();

  const styles = StyleSheet.create({
    container: {
      alignItems: 'center',
      justifyContent: 'center',
      padding: 30,
    },
    text: {
      marginTop: 15,
      fontSize: 16,
      color: '#FFFFFF', // White for contrast
      textAlign: 'center',
      letterSpacing: 0.5,
    },
    inline: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20,
    },
    inlineText: {
      marginLeft: 10,
      fontSize: 16,
      color: '#FFFFFF', // White for contrast
      letterSpacing: 0.5,
    },
  });

  const content = (
    <View style={overlay ? styles.container : styles.inline}>
      <ActivityIndicator
        size={size}
        color={color || '#14B8A6'} // Emerald green
      />
      {text && (
        <Text style={overlay ? styles.text : styles.inlineText}>
          {text}
        </Text>
      )}
    </View>
  );

  if (overlay) {
    return (
      <Modal
        visible={visible}
        onClose={() => {}}
        position="center"
        showOverlay={true}
        overlayColor="rgba(0, 0, 0, 0.6)"
        preventClose={true}
      >
        {content}
      </Modal>
    );
  }

  return visible ? content : null;
}