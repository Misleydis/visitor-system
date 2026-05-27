import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import SecurityDashboardScreen from './screens/SecurityDashboardScreen';
import AllVisitorsScreen from './screens/AllVisitorsScreen';
import ReturningVisitorsScreen from './ReturningVisitorsScreen';
import RegisterVisitorScreen from './RegisterVisitorScreen';

const Stack = createStackNavigator();

export default function SecurityStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Dashboard" component={SecurityDashboardScreen} options={{ title: 'Security Panel' }} />
      <Stack.Screen name="AllVisitors" component={AllVisitorsScreen} options={{ title: 'All Visitors' }} />
      <Stack.Screen name="ReturningVisitors" component={ReturningVisitorsScreen} options={{ title: 'Returning Visitors' }} />
      <Stack.Screen name="RegisterVisitor" component={RegisterVisitorScreen} options={{ title: 'Register Visitor' }} />
    </Stack.Navigator>
  );
}