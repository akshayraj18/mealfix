import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { auth } from '../../config/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { MaterialIcons } from '@expo/vector-icons';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [isValidPassword, setIsValidPassword] = useState(false);

  useEffect(() => {
    setIsValidPassword(password.length >= 6);
  }, [password]);

  const handleSignUp = async () => {
    if (!email || !password) {
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
      console.log('User credential received:', userCredential);
      
      if (userCredential.user) {
        console.log('User created successfully:', userCredential.user.uid);
        Alert.alert(
          '🎉 Welcome to MealFix!',
          'Your account has been created successfully. Please log in to continue.',
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
      console.log('Attempting login for:', email);
      
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('Login successful for user:', userCredential.user.email);
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
    <View style={styles.container}>
      <Text style={styles.title}>{isLogin ? 'Welcome Back!' : 'Create Account'}</Text>
      <Text style={styles.subtitle}>
        {isLogin ? 'Login to continue' : 'Sign up to get started'}
      </Text>
      
      <View style={styles.inputContainer}>
        <MaterialIcons name="email" size={20} color="#666" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          autoComplete="email"
        />
      </View>
      
      <View style={styles.inputContainer}>
        <MaterialIcons name="lock" size={20} color="#666" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoComplete="password"
        />
        {!isLogin && (
          <MaterialIcons 
            name={isValidPassword ? "check-circle" : "cancel"} 
            size={20} 
            color={isValidPassword ? "#4CAF50" : "#666"}
            style={styles.validationIcon}
          />
        )}
      </View>
      
      {!isLogin && (
        <Text style={[
          styles.passwordHint,
          { color: isValidPassword ? "#4CAF50" : "#666" }
        ]}>
          Password must be at least 6 characters
        </Text>
      )}
      
      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" />
      ) : (
        <TouchableOpacity 
          style={[styles.button, !isValidPassword && !isLogin && styles.buttonDisabled]} 
          onPress={isLogin ? handleLogin : handleSignUp}
          disabled={!isLogin && !isValidPassword}
        >
          <Text style={styles.buttonText}>
            {isLogin ? 'Login' : 'Sign Up'}
          </Text>
        </TouchableOpacity>
      )}
      
      <TouchableOpacity
        onPress={() => {
          setIsLogin(!isLogin);
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 15,
    paddingHorizontal: 15,
    height: 50,
  },
  inputIcon: {
    marginRight: 10,
  },
  validationIcon: {
    marginLeft: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
  passwordHint: {
    fontSize: 12,
    marginTop: -10,
    marginBottom: 20,
    marginLeft: 15,
  },
  button: {
    backgroundColor: '#007AFF',
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  toggleButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  toggleText: {
    color: '#007AFF',
    fontSize: 14,
  },
}); 