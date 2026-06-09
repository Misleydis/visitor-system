import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import SecurityDashboardScreen from './SecurityDashboardScreen';
import AllVisitorsScreen from './AllVisitorsScreen';
import ReturningVisitorsScreen from './ReturningVisitorsScreen';
import RegisterVisitorScreen from './RegisterVisitorScreen';
import OccurrenceBookScreen from './OccurrenceBookScreen';

const Stack = createStackNavigator();

export default function SecurityStack() {
  return (
    <Stack.Navigator screenOptions={{ headerStyle: { backgroundColor: '#2c3e50' }, headerTintColor: '#fff', headerTitleStyle: { fontWeight: 'bold' } }}>
      <Stack.Screen name="Dashboard" component={SecurityDashboardScreen} options={{ title: 'Security Panel' }} />
      <Stack.Screen name="AllVisitors" component={AllVisitorsScreen} options={{ title: 'All Visitors' }} />
      <Stack.Screen name="ReturningVisitors" component={ReturningVisitorsScreen} options={{ title: 'Returning Visitors' }} />
      <Stack.Screen name="RegisterVisitor" component={RegisterVisitorScreen} options={{ title: 'Register Visitor' }} />
      <Stack.Screen name="OccurrenceBook" component={OccurrenceBookScreen} options={{ title: 'Occurrence Book' }} />
    </Stack.Navigator>
  );
}