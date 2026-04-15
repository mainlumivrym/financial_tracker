import { View, StyleSheet } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createStackNavigator, CardStyleInterpolators } from '@react-navigation/stack';
import { AuthProvider } from './src/context/AuthContext';
import 'react-native-gesture-handler';

const DarkTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#4ecca3',
    background: '#1a1a2e',
    card: '#2a2a3e',
    text: '#ffffff',
    border: '#3a3a4e',
    notification: '#4ecca3',
  },
};
import Landing from './src/screens/Landing';
import Login from './src/screens/Login';
import Signup from './src/screens/Signup';
import Dashboard from './src/screens/Dashboard';
import UserInfo from './src/screens/UserInfo';

const Stack = createStackNavigator();

export default function App() {
  return (
    <View style={styles.container}>
      <AuthProvider>
      <NavigationContainer 
        theme={DarkTheme}
        documentTitle={{ enabled: false }}
      >
      <Stack.Navigator 
        initialRouteName="Landing"
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: '#1a1a2e' },
          cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
          gestureEnabled: true,
          gestureDirection: 'horizontal'
        }}
      >
        <Stack.Screen name="Landing" component={Landing} />
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Signup" component={Signup} />
        <Stack.Screen name="Dashboard" component={Dashboard} />
        <Stack.Screen name="UserInfo" component={UserInfo} />
        </Stack.Navigator>
      </NavigationContainer>
      </AuthProvider>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
});
