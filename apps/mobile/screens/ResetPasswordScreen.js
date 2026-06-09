import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import axios from 'axios';
import { API_BASE } from '../services/api';

export default function ResetPasswordScreen({ navigation, route }) {
  const { email, code } = route.params;
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    if (!newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please fill in both fields');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      await axios.post(`${API_BASE}/auth/reset-password`, { email, code, newPassword });
      Alert.alert('Success', 'Password reset successfully. Please login.');
      navigation.navigate('Login');
    } catch (err) {
      Alert.alert('Error', err.response?.data?.msg || 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <MaterialIcons name="lock-outline" size={60} color="#e67e22" />
        <Text style={styles.title}>Reset Password</Text>
        <Text style={styles.subtitle}>Enter your new password</Text>
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            placeholder="New Password"
            secureTextEntry={!showPassword}
            value={newPassword}
            onChangeText={setNewPassword}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
            <MaterialIcons name={showPassword ? "visibility" : "visibility-off"} size={22} color="#7f8c8d" />
          </TouchableOpacity>
        </View>
        <TextInput
          style={styles.input}
          placeholder="Confirm New Password"
          secureTextEntry={!showPassword}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />
        <TouchableOpacity style={styles.button} onPress={handleReset} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Reset Password</Text>}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f2f5', padding: 20 },
  card: { backgroundColor: '#fff', width: '100%', maxWidth: 400, padding: 25, borderRadius: 20, alignItems: 'center', elevation: 5 },
  title: { fontSize: 24, fontWeight: 'bold', marginTop: 15, color: '#2c3e50' },
  subtitle: { fontSize: 14, color: '#7f8c8d', textAlign: 'center', marginVertical: 10 },
  input: { width: '100%', borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 12, marginVertical: 8 },
  passwordContainer: { flexDirection: 'row', alignItems: 'center', width: '100%', borderWidth: 1, borderColor: '#ddd', borderRadius: 10, marginVertical: 8 },
  passwordInput: { flex: 1, padding: 12 },
  eyeIcon: { paddingHorizontal: 12 },
  button: { backgroundColor: '#e67e22', padding: 14, borderRadius: 10, width: '100%', alignItems: 'center', marginTop: 10 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});