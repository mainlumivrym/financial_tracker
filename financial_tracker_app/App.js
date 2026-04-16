import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createStackNavigator, CardStyleInterpolators } from '@react-navigation/stack';
import { AuthProvider, useAuth } from './src/context/AuthContext';
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
import AddTransaction from './src/screens/AddTransaction';
import FullTransactionList from './src/screens/FullTransactionList';
import BudgetManagement from './src/screens/BudgetManagement';

const Stack = createStackNavigator();

function Navigation() {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4ecca3" />
      </View>
    );
  }

  return (
    <Stack.Navigator 
      initialRouteName={currentUser ? "Dashboard" : "Landing"}
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: '#1a1a2e' },
        cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
        gestureEnabled: true,
        gestureDirection: 'horizontal'
      }}
    >
      {currentUser ? (
        // Authenticated screens
        <>
          <Stack.Screen name="Dashboard" component={Dashboard} />
          <Stack.Screen name="UserInfo" component={UserInfo} />
          <Stack.Screen name="AddTransaction" component={AddTransaction} />
          <Stack.Screen name="FullTransactionList" component={FullTransactionList} />
          <Stack.Screen name="BudgetManagement" component={BudgetManagement} />
        </>
      ) : (
        // Unauthenticated screens
        <>
          <Stack.Screen name="Landing" component={Landing} />
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen name="Signup" component={Signup} />
        </>
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <View style={styles.container}>
      <AuthProvider>
        <NavigationContainer 
          theme={DarkTheme}
          documentTitle={{ enabled: false }}
        >
          <Navigation />
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
  loadingContainer: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
