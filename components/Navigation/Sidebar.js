import React from 'react';
import { View, StyleSheet } from 'react-native';

// navigation components or screens
import Home from './Home';
import Map from './Map';
import People from './People';
import Voice from './Voice';

const Sidebar = () => {
  return (
    <View style={styles.sidebar}>
      <Home />
      <Map />
      <People />
      <Voice />
    </View>
  );
};

const styles = StyleSheet.create({
  sidebar: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingVertical: 20,
    paddingHorizontal: 10,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
});

export default Sidebar;
