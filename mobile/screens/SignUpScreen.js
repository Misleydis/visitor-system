import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, ActivityIndicator, ScrollView, KeyboardAvoidingView,
  Platform
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';  // <-- add this
import { registerUser } from '../services/api';

export default function SignUpScreen({ navigation }) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }
    if (!termsAccepted) {
      Alert.alert('Error', 'You must agree to the terms & conditions');
      return;
    }
  
    setLoading(true);
    try {
      const fullName = `${firstName} ${lastName}`;
      const response = await registerUser(fullName, email, password, 'security');
      console.log('Registration response:', response.data);
      Alert.alert(
        'Account Created',
        'Your account has been created and is pending admin approval.',
        [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
      );
    } catch (err) {
      console.error('SignUp error full:', err);
      let errorMsg = 'Registration failed. Please try again.';
      if (err.response) {
        // Server responded with an error
        errorMsg = err.response.data?.msg || errorMsg;
        console.log('Server error response:', err.response.data);
      } else if (err.request) {
        errorMsg = 'Network error. Check your connection.';
      }
      Alert.alert('Sign Up Failed', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.card}>
          <Text style={styles.title}>Create an account</Text>
          <View style={styles.loginLinkRow}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLink}>Log in</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.row}>
            <TextInput style={[styles.input, styles.half]} placeholder="First Name" value={firstName} onChangeText={setFirstName} />
            <TextInput style={[styles.input, styles.half]} placeholder="Last Name" value={lastName} onChangeText={setLastName} />
          </View>

          <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />

          <View style={styles.passwordContainer}>
            <TextInput style={styles.passwordInput} placeholder="Enter your password" secureTextEntry={!showPassword} value={password} onChangeText={setPassword} />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
              <Icon name={showPassword ? "visibility" : "visibility-off"} size={22} color="#7f8c8d" />
            </TouchableOpacity>
          </View>

          <View style={styles.passwordContainer}>
            <TextInput style={styles.passwordInput} placeholder="Confirm your password" secureTextEntry={!showConfirmPassword} value={confirmPassword} onChangeText={setConfirmPassword} />
            <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeIcon}>
              <Icon name={showConfirmPassword ? "visibility" : "visibility-off"} size={22} color="#7f8c8d" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.checkboxContainer} onPress={() => setTermsAccepted(!termsAccepted)}>
            <View style={[styles.checkbox, termsAccepted && styles.checkboxChecked]}>
              {termsAccepted && <Icon name="check" size={12} color="#fff" />}
            </View>
            <Text style={styles.checkboxLabel}>I agree to the terms & conditions</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={handleSignUp} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Create account</Text>}
          </TouchableOpacity>

          <View style={styles.socialDivider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>Or register with</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.socialButtonsRow}>
            <TouchableOpacity style={styles.socialButton} onPress={() => Alert.alert('Google', 'Coming soon')}>
              <Ionicons name="logo-google" size={20} color="#db4437" />
              <Text style={styles.socialButtonText}>Google</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialButton} onPress={() => Alert.alert('Apple', 'Coming soon')}>
              <Ionicons name="logo-apple" size={20} color="#000" />
              <Text style={styles.socialButtonText}>Apple</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f2f2f2' },
  scrollContainer: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 30 },
  card: { width: '85%', maxWidth: 400, backgroundColor: '#fff', borderRadius: 24, padding: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 3 },
  title: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 8, color: '#1e1e2f' },
  loginLinkRow: { flexDirection: 'row', justifyContent: 'center', marginBottom: 28 },
  loginText: { fontSize: 14, color: '#6c757d' },
  loginLink: { fontSize: 14, color: '#007aff', fontWeight: '600' },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  half: { width: '48%' },
  input: { borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, padding: 14, fontSize: 16, backgroundColor: '#fff', marginBottom: 16 },
  passwordContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, backgroundColor: '#fff', marginBottom: 16 },
  passwordInput: { flex: 1, padding: 14, fontSize: 16 },
  eyeIcon: { paddingHorizontal: 12 },
  checkboxContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 28 },
  checkbox: { width: 20, height: 20, borderWidth: 2, borderColor: '#007aff', borderRadius: 5, marginRight: 10, justifyContent: 'center', alignItems: 'center' },
  checkboxChecked: { backgroundColor: '#007aff' },
  checkboxLabel: { fontSize: 14, color: '#334155' },
  button: { backgroundColor: '#007aff', borderRadius: 40, padding: 16, alignItems: 'center', marginBottom: 24 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  socialDivider: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#e2e8f0' },
  dividerText: { marginHorizontal: 12, fontSize: 13, color: '#94a3b8' },
  socialButtonsRow: { flexDirection: 'row', justifyContent: 'center', gap: 16 },
  socialButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 40, paddingVertical: 10, paddingHorizontal: 20, backgroundColor: '#fff', marginHorizontal: 6 },
  socialButtonText: { marginLeft: 8, fontSize: 14, fontWeight: '500', color: '#1e293b' },
});