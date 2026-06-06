// visitor-system/mobile/App.js
import React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from './screens/LoginScreen';
import SignUpScreen from './screens/SignUpScreen';
import SecurityStack from './screens/SecurityStack';
import ReceptionScreen from './screens/ReceptionScreen';
import AdminScreen from './screens/AdminScreen';
import ForgotPasswordScreen from './screens/ForgotPasswordScreen';
import VerifyCodeScreen from './screens/VerifyCodeScreen';
import ResetPasswordScreen from './screens/ResetPasswordScreen';
import OccurrenceBookScreen from './screens/OccurrenceBookScreen';
import MyOccurrenceEntries from './screens/MyOccurrenceEntries';

const Stack = createStackNavigator();

const MyTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#f5f5f5',
  },
};

export default function App() {
  return (
    <NavigationContainer theme={MyTheme}>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{
          headerStyle: { backgroundColor: '#2c3e50' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      >
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} options={{ title: 'Forgot Password' }} />
<Stack.Screen name="VerifyCode" component={VerifyCodeScreen} options={{ title: 'Verify Code' }} />
<Stack.Screen name="ResetPassword" component={ResetPasswordScreen} options={{ title: 'Reset Password' }} />
        <Stack.Screen name="SignUp" component={SignUpScreen} options={{ title: 'Create Account' }} />
        <Stack.Screen name="Security" component={SecurityStack} options={{ headerShown: false }} />
        <Stack.Screen name="Reception" component={ReceptionScreen} options={{ title: 'Reception Panel' }} />
        <Stack.Screen name="Admin" component={AdminScreen} options={{ title: 'Admin Dashboard' }} />
        <Stack.Screen name="OccurrenceBook" component={OccurrenceBookScreen} options={{ title: 'Occurrence Book' }} />
        <Stack.Screen name="MyOccurrenceEntries" component={MyOccurrenceEntries} options={{ title: 'My Entries' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}