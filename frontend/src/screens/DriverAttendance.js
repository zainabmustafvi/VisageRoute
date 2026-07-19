// Attendance feature removed (face recognition + attendance marking).
// Kept as an empty module only to avoid runtime import errors if referenced elsewhere.

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const DriverAttendance = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Attendance removed</Text>
      <Text style={styles.subtitle}>The face recognition attendance feature is no longer available.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#000', padding: 24 },
  title: { color: '#fff', fontSize: 18, fontWeight: '800', marginBottom: 8, textAlign: 'center' },
  subtitle: { color: 'rgba(255,255,255,0.7)', fontSize: 13, textAlign: 'center', lineHeight: 18 },
});

export default DriverAttendance;

