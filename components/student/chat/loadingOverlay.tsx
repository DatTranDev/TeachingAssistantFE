import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

const LoadingOverlay = ({ visible }:{visible:boolean}) => {
    if (!visible) return null;

    return (
        <View style={styles.overlay}>
            <View style={styles.indicatorContainer}>
                <ActivityIndicator size="large" color="white" />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(200, 200, 200, 0.9)', // Màu nền mờ mờ
        justifyContent: 'center',
        alignItems: 'center',
    },
    indicatorContainer: {
        backgroundColor: 'rgba(0, 0, 0, 0.7)', // Màu nền của vùng chứa ActivityIndicator
        padding: 20,
        borderRadius: 10,
    },
});

export default LoadingOverlay;
