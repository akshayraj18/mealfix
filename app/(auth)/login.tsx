import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Platform,
  Animated,
} from 'react-native';
import { router } from 'expo-router';
import { auth } from '../../config/firebase';
import { updateProfile } from 'firebase/auth';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { trackUserSignup } from '../../services/analyticsService';

export default function LoginScreen() {
  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [isValidPassword, setIsValidPassword] = useState(false);
  const [bounceAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    setIsValidPassword(password.length >= 6);
  }, [password]);

  const animateButton = () => {
    Animated.sequence([
      Animated.timing(bounceAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(bounceAnim, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleSignUp = async () => {
    if (!email || !password || !firstName) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }

    try {
      setLoading(true);
      console.log('Starting sign up process for:', email);
      
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log('User credential received:', userCredential.user.uid);

      await updateProfile(userCredential.user, {
        displayName: firstName
      });
      
      // Track the signup and increment the dashboard counter
      await trackUserSignup('email', userCredential.user.uid);
      console.log('Tracked signup event and incremented user counter');
      
      if (userCredential.user) {
        console.log('User created successfully:', userCredential.user.uid);
        Alert.alert(
          '🎉 Welcome to MealFix!',
          `Hi ${firstName}! Your account has been created successfully. Please log in to continue.`,
          [
            {
              text: 'Continue to Login',
              onPress: () => {
                setIsLogin(true);
                setEmail('');
                setPassword('');
              }
            }
          ]
        );
      }
    } catch (error: any) {
      console.error('Detailed sign up error:', {
        code: error.code,
        message: error.message,
        fullError: error
      });
      
      let errorMessage = 'An error occurred during sign up';
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'This email is already registered. Please login instead.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak. Please use a stronger password.';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Network error. Please check your internet connection.';
      } else if (error.code === 'auth/operation-not-allowed') {
        errorMessage = 'Email/password sign up is not enabled. Please contact support.';
      }
      
      Alert.alert('Error', `${errorMessage}\nError Code: ${error.code}`);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // If user doesn't have a displayName set, set it from email (optional)
      if (!userCredential.user.displayName) {
        await updateProfile(userCredential.user, {
          displayName: email.split('@')[0]
        });
      }
      router.replace('/(app)/home');
    } catch (error: any) {
      console.error('Login error details:', {
        code: error.code,
        message: error.message,
        fullError: error
      });
      
      let errorMessage = 'An error occurred during login';
      
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        errorMessage = 'Invalid email or password.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Network error. Please check your internet connection.';
      }
      
      Alert.alert('Error', `${errorMessage}\nError Code: ${error.code}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={['#F7F9FC', '#E8EEF9']}
      style={styles.gradient}
    >
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <Text style={styles.title}>{isLogin ? 'Welcome Back! 👋' : 'Create Account 🎉'}</Text>
          <Text style={styles.subtitle}>
            {isLogin ? 'Login to continue cooking' : 'Sign up to start your culinary journey'}
          </Text>
        </View>
        
        <View style={styles.formContainer}>
          {!isLogin && (
              <View style={styles.inputContainer}>
                <MaterialIcons name="person" size={24} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="First Name"
                  placeholderTextColor="#A0A0A0"
                  value={firstName}
                  onChangeText={setFirstName}
                  autoCapitalize="words"
                />
              </View>
            )}

          <View style={styles.inputContainer}>
            <MaterialIcons name="email" size={24} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#A0A0A0"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
            />
          </View>
          
          <View style={styles.inputContainer}>
            <MaterialIcons name="lock" size={24} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#A0A0A0"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete="password"
            />
            {!isLogin && (
              <MaterialIcons 
                name={isValidPassword ? "check-circle" : "cancel"} 
                size={24} 
                color={isValidPassword ? "#4CAF50" : "#666"}
                style={styles.validationIcon}
              />
            )}
          </View>
          
          {!isLogin && (
            <View style={styles.passwordHintContainer}>
              <MaterialIcons 
                name={isValidPassword ? "check-circle" : "info"} 
                size={16} 
                color={isValidPassword ? "#4CAF50" : "#666"}
              />
              <Text style={[
                styles.passwordHint,
                { color: isValidPassword ? "#4CAF50" : "#666" }
              ]}>
                Password must be at least 6 characters
              </Text>
            </View>
          )}
          
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#FF6B6B" />
              <Text style={styles.loadingText}>
                {isLogin ? 'Logging in...' : 'Creating your account...'}
              </Text>
            </View>
          ) : (
            <Animated.View style={{ transform: [{ scale: bounceAnim }] }}>
              <TouchableOpacity 
                style={[styles.button, !isValidPassword && !isLogin && styles.buttonDisabled]} 
                onPress={() => {
                  animateButton();
                  isLogin ? handleLogin() : handleSignUp();
                }}
                disabled={!isLogin && !isValidPassword}
              >
                <LinearGradient
                  colors={['#FF6B6B', '#FF8B8B']}
                  style={styles.buttonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <MaterialIcons 
                    name={isLogin ? "login" : "person-add"} 
                    size={24} 
                    color="#FFF" 
                    style={styles.buttonIcon}
                  />
                  <Text style={styles.buttonText}>
                    {isLogin ? 'Login' : 'Sign Up'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          )}
          
          <TouchableOpacity
            onPress={() => {
              setIsLogin(!isLogin);
              setFirstName('');
              setEmail('');
              setPassword('');
            }}
            style={styles.toggleButton}
          >
            <Text style={styles.toggleText}>
              {isLogin
                ? "Don't have an account? Sign Up"
                : 'Already have an account? Login'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  headerContainer: {
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
    color: '#1A1A1A',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
  },
  formContainer: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7F9FC',
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 16,
    height: 56,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  inputIcon: {
    marginRight: 12,
  },
  validationIcon: {
    marginLeft: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1A1A1A',
  },
  passwordHintContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: -8,
    marginBottom: 20,
    marginLeft: 16,
  },
  passwordHint: {
    fontSize: 14,
    marginLeft: 8,
  },
  loadingContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  button: {
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#FF6B6B',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 1,
  },
  toggleButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  toggleText: {
    fontSize: 16,
    color: '#FF6B6B',
    fontWeight: '600',
  },
}); 