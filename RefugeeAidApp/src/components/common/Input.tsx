import React, { useState, forwardRef } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInputProps,
} from 'react-native';

const T = {
  surfaceAlt:    '#F2EBDF',
  border:        '#E8DECF',
  borderFocus:   '#2B6E6B',
  textPrimary:   '#2C2620',
  textSecondary: '#6E6358',
  textMuted:     '#A89D8E',
  error:         '#B3492E',
  errorMuted:    '#F4DCD3',
};

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  helper?: string;
  required?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconPress?: () => void;
  containerStyle?: any;
  inputStyle?: any;
}

const Input = forwardRef<TextInput, InputProps>((
  { label, error, helper, required, leftIcon, rightIcon, onRightIconPress,
    containerStyle, inputStyle, style, ...props },
  ref
) => {
  const [focused, setFocused] = useState(false);

  const borderColor = error ? T.error : focused ? T.borderFocus : T.border;

  return (
    <View style={[s.container, containerStyle]}>
      {label && (
        <View style={s.labelRow}>
          <Text style={s.label}>{label}</Text>
          {required && <Text style={s.required}> *</Text>}
        </View>
      )}

      <View style={[
        s.inputWrap,
        { borderColor, borderWidth: focused ? 1.5 : 1 },
        inputStyle,
      ]}>
        {leftIcon && <View style={s.iconL}>{leftIcon}</View>}

        <TextInput
          ref={ref}
          style={[s.input, style]}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholderTextColor={T.textMuted}
          selectionColor={T.borderFocus}
          {...props}
        />

        {rightIcon && (
          <TouchableOpacity
            style={s.iconR}
            onPress={onRightIconPress}
            disabled={!onRightIconPress}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            {rightIcon}
          </TouchableOpacity>
        )}
      </View>

      {error  && <Text style={s.errorText}>{error}</Text>}
      {helper && !error && <Text style={s.helperText}>{helper}</Text>}
    </View>
  );
});

Input.displayName = 'Input';
export default Input;

const s = StyleSheet.create({
  container: { marginBottom: 16 },
  labelRow:  { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  label:     { fontSize: 14, fontWeight: '500', color: '#6E6358' },
  required:  { fontSize: 14, color: '#B3492E' },
  inputWrap: {
    flexDirection:   'row',
    alignItems:      'center',
    backgroundColor: T.surfaceAlt,
    borderRadius:    14,
    paddingHorizontal: 14,
    minHeight:       52,
  },
  input: {
    flex:      1,
    fontSize:  16,
    color:     T.textPrimary,
    paddingVertical: 12,
  },
  iconL:      { marginEnd:   10 },
  iconR:      { marginStart: 10, padding: 4 },
  helperText: { marginTop: 5, fontSize: 12, color: T.textSecondary },
  errorText:  { marginTop: 5, fontSize: 12, color: T.error },
});