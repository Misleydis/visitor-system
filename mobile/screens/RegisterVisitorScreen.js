import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { registerVisitor } from '../services/api';   // fixed path

const SITES = ['head office', 'phase I', 'phase II', 'phase III', 'phase IV', 'phase V', 'phase VI', 'phase VII', 'phase VIII', 'phase IX', 'phase X', 'phase XI', 'phase XII', 'the gate', '2 acres'];
const HEAD_OFFICE_OPTIONS = ['IT Department', 'Mr Khumalo', 'Manager', 'Other'];

export default function RegisterVisitorScreen({ navigation }) {
  const [form, setForm] = useState({
    firstName: '', surname: '', nationalId: '', phoneNumber: '', address: '', vehicleReg: '',
    site: '', personToVisit: '', personToVisitOther: '', purpose: ''
  });
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!form.firstName || !form.surname || !form.nationalId || !form.phoneNumber || !form.address || !form.site || !form.purpose) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }
    if (form.site === 'head office') {
      if (!form.personToVisit) {
        Alert.alert('Error', 'Please select person to visit');
        return;
      }
      if (form.personToVisit === 'Other' && !form.personToVisitOther) {
        Alert.alert('Error', 'Please specify other person');
        return;
      }
    }
    setLoading(true);
    try {
      await registerVisitor(form);
      Alert.alert('Success', 'Visitor registered');
      navigation.goBack();
    } catch (err) {
      Alert.alert('Error', err.response?.data?.msg || 'Server error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <ScrollView style={styles.container}>
        <TextInput style={styles.input} placeholder="First Name *" value={form.firstName} onChangeText={t => setForm({...form, firstName: t})} />
        <TextInput style={styles.input} placeholder="Surname *" value={form.surname} onChangeText={t => setForm({...form, surname: t})} />
        <TextInput style={styles.input} placeholder="National ID *" value={form.nationalId} onChangeText={t => setForm({...form, nationalId: t})} />
        <TextInput style={styles.input} placeholder="Phone Number *" value={form.phoneNumber} onChangeText={t => setForm({...form, phoneNumber: t})} keyboardType="phone-pad" />
        <TextInput style={styles.input} placeholder="Address *" value={form.address} onChangeText={t => setForm({...form, address: t})} />
        <TextInput style={styles.input} placeholder="Vehicle Registration (optional)" value={form.vehicleReg} onChangeText={t => setForm({...form, vehicleReg: t})} />

        <Text style={styles.label}>Site *</Text>
        <Picker
  selectedValue={form.site}
  onValueChange={v => setForm({...form, site: v, personToVisit: '', personToVisitOther: ''})}>
  <Picker.Item label="Select site" value="" color="grey" />
  {SITES.map(s => <Picker.Item key={s} label={s} value={s} />)}
</Picker>

      {form.site === 'head office' && (
        <>
          <Text style={styles.label}>Person to Visit *</Text>
          <Picker selectedValue={form.personToVisit} onValueChange={v => setForm({...form, personToVisit: v, personToVisitOther: ''})}>
            <Picker.Item label="Select" value="" color="grey" />
            {HEAD_OFFICE_OPTIONS.map(opt => <Picker.Item key={opt} label={opt} value={opt} />)}
          </Picker>
          {form.personToVisit === 'Other' && (
            <TextInput style={styles.input} placeholder="Specify other person" value={form.personToVisitOther} onChangeText={t => setForm({...form, personToVisitOther: t})} />
          )}
        </>
      )}

      <TextInput style={styles.input} placeholder="Purpose *" value={form.purpose} onChangeText={t => setForm({...form, purpose: t})} multiline />

      <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
        <Text style={styles.buttonText}>Register Visitor</Text>
      </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, marginBottom: 15 },
  label: { fontWeight: 'bold', marginBottom: 5 },
  button: { backgroundColor: '#2ecc71', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  buttonText: { color: '#fff', fontWeight: 'bold' }
});