import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export default function VerifyCodeScreen({ navigation, route }) {
  const { email } = route.params;
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerify = () => {
    if (!code || code.length !== 6) {
      Alert.alert('Error', 'Please enter the 6-digit code');
      return;
    }
    navigation.navigate('ResetPassword', { email, code });
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <MaterialIcons name="verified" size={60} color="#2ecc71" />
        <Text style={styles.title}>Verify Code</Text>
        <Text style={styles.subtitle}>Enter the 6-digit code sent to {email}</Text>
        <TextInput
          style={styles.input}
          placeholder="6-digit code"
          value={code}
          onChangeText={setCode}
          keyboardType="number-pad"
          maxLength={6}
        />
        <TouchableOpacity style={styles.button} onPress={handleVerify} disabled={loading}>
          <Text style={styles.buttonText}>Verify & Continue</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backLink}>Go back</Text>
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
  input: { width: '100%', borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 12, textAlign: 'center', fontSize: 18, letterSpacing: 4, marginVertical: 10 },
  button: { backgroundColor: '#2ecc71', padding: 14, borderRadius: 10, width: '100%', alignItems: 'center', marginTop: 10 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  backLink: { marginTop: 20, color: '#3498db', fontWeight: '600' },
});