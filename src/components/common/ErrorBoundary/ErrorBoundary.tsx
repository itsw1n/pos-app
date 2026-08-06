import React from 'react';
import { Pressable, StyleProp, Text, View, ViewStyle } from 'react-native';
import { errorBoundaryStyles } from './ErrorBoundary.styles';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage: string;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = {
    hasError: false,
    errorMessage: '',
  };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, errorMessage: error.message };
  }

  private handleReset = (): void => {
    this.setState({ hasError: false, errorMessage: '' });
  };

  render(): React.ReactNode {
    if (this.state.hasError) {
      return (
        <View style={[errorBoundaryStyles.container, this.props.style]}>
          <Text style={errorBoundaryStyles.title}>Something went wrong</Text>
          <Text style={errorBoundaryStyles.message}>{this.state.errorMessage}</Text>
          <Pressable
            style={({ pressed }) => [
              errorBoundaryStyles.button,
              pressed ? errorBoundaryStyles.buttonPressed : null,
            ]}
            onPress={this.handleReset}
          >
            <Text style={errorBoundaryStyles.buttonText}>Try Again</Text>
          </Pressable>
        </View>
      );
    }
    return this.props.children;
  }
}