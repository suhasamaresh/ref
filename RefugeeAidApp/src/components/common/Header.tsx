import React, { ReactNode } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

interface HeaderProps {
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  leftElement?: ReactNode;
  rightElement?: ReactNode;
  onBackPress?: () => void;
  backgroundColor?: string;
  titleColor?: string;
}

export default function Header({
  title,
  subtitle,
  showBackButton = true,
  leftElement,
  rightElement,
  onBackPress,
  backgroundColor = '#FFFFFF',
  titleColor = '#2C2620',
}: HeaderProps) {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const handleBack = () => {
    if (onBackPress) onBackPress();
    else if (navigation.canGoBack()) navigation.goBack();
  };

  return (
    <>
      <StatusBar
        backgroundColor={backgroundColor}
        barStyle="dark-content"
        translucent={false}
      />
      <View style={[
        s.header,
        {
          backgroundColor,
          paddingTop: (Platform.OS === 'android' ? insets.top : 0) + 12,
        },
      ]}>
        {/* Left */}
        <View style={s.side}>
          {leftElement || (showBackButton && (
            <TouchableOpacity
              style={s.backBtn}
              onPress={handleBack}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <Ionicons name="arrow-back" size={22} color="#B5651D" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Title */}
        <View style={s.titleWrap}>
          <Text style={[s.title, { color: titleColor }]} numberOfLines={1}>
            {title}
          </Text>
          {subtitle && (
            <Text style={s.subtitle} numberOfLines={1}>{subtitle}</Text>
          )}
        </View>

        {/* Right */}
        <View style={s.side}>{rightElement}</View>
      </View>
      {/* Bottom hairline */}
      <View style={s.divider} />
    </>
  );
}

const s = StyleSheet.create({
  header: {
    flexDirection:   'row',
    alignItems:      'center',
    paddingHorizontal: 20,
    paddingBottom:   14,
    backgroundColor: '#FFFFFF',
    minHeight:       56,
  },
  side: {
    width:      44,
    alignItems: 'flex-start',
  },
  backBtn: {
    width:           44,
    height:          44,
    alignItems:      'center',
    justifyContent:  'center',
    borderRadius:    22,
    backgroundColor: '#F3DCB8',
  },
  titleWrap: {
    flex:       1,
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  title: {
    fontSize:   18,
    fontWeight: '600',
    color:      '#2C2620',
  },
  subtitle: {
    fontSize:  13,
    color:     '#6E6358',
    marginTop:  2,
  },
  divider: {
    height:          1,
    backgroundColor: '#E8DECF',
  },
});