import React, { ReactNode, useEffect } from 'react';
import {
  Modal as RNModal,
  View,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  StatusBar,
  BackHandler,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { borderRadius } from '../../theme';

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  children: ReactNode;
  animationType?: 'slide' | 'fade';
  position?: 'center' | 'bottom';
  fullScreen?: boolean;
  showOverlay?: boolean;
  overlayColor?: string;
  preventClose?: boolean;
}

export default function Modal({
  visible,
  onClose,
  children,
  animationType = 'slide',
  position = 'center',
  fullScreen = false,
  showOverlay = true,
  overlayColor,
  preventClose = false,
}: ModalProps) {
  const { theme } = useTheme();
  const slideAnim = React.useRef(new Animated.Value(0)).current;
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  useEffect(() => {
    const backAction = () => {
      if (visible && !preventClose) {
        onClose();
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

    return () => backHandler.remove();
  }, [visible, preventClose, onClose]);

  const screenHeight = Dimensions.get('window').height;
  
  const getTransform = () => {
    if (position === 'bottom') {
      return [{
        translateY: slideAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [screenHeight, 0],
        }),
      }];
    }
    return [{
      scale: slideAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0.9, 1],
      }),
    }];
  };

  const styles = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: overlayColor || 'rgba(0, 0, 0, 0.6)',
      justifyContent: position === 'bottom' ? 'flex-end' : 'center',
      alignItems: 'center',
    },
    modalContainer: {
      backgroundColor: '#121212', // Deep black
      borderRadius: position === 'bottom' ? 0 : 16,
      margin: fullScreen ? 0 : 20,
      maxHeight: fullScreen ? '100%' : '90%',
      width: fullScreen ? '100%' : '90%',
      shadowColor: '#14B8A6',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 5,
      ...(position === 'bottom' && {
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
      }),
    },
    handle: {
      width: 40,
      height: 4,
      backgroundColor: '#A3A3A3', // Light gray
      borderRadius: 2,
      alignSelf: 'center',
      marginTop: 10,
      marginBottom: 10,
    },
  });

  return (
    <RNModal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={preventClose ? () => {} : onClose}
    >
      <StatusBar backgroundColor="rgba(0, 0, 0, 0.6)" barStyle="light-content" />
      
      <Animated.View 
        style={[
          styles.overlay,
          { opacity: fadeAnim }
        ]}
      >
        {showOverlay && (
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            onPress={preventClose ? () => {} : onClose}
            activeOpacity={1}
          />
        )}
        
        <Animated.View
          style={[
            styles.modalContainer,
            {
              transform: getTransform(),
            },
          ]}
        >
          {position === 'bottom' && <View style={styles.handle} />}
          {children}
        </Animated.View>
      </Animated.View>
    </RNModal>
  );
}