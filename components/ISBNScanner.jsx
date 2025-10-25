import { CameraView, useCameraPermissions } from 'expo-camera';
import { useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { searchByISBN } from '../lib/googleBooks';

const ISBNScanner = ({ onBookFound, onClose }) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  const handleBarcodeScanned = async ({ data }) => {
    setScanned(true);
    console.log('Barcode scanned:', data);

    // Validate ISBN (EAN-13 barcodes for books start with 978 or 979)
    if (/^97[89]\d{10}$/.test(data)) {
      try {
        const book = await searchByISBN(data);
        if (book) {
          onBookFound(book);
        } else {
          Alert.alert('Not Found', 'No book found for this ISBN.');
        }
      } catch (e) {
        console.error('Error fetching book data:', e);
        Alert.alert('Error', 'Error fetching book data. Please try again.');
      }
    } else {
      Alert.alert('Invalid ISBN', 'Scanned code is not a valid ISBN.');
    }
    onClose();
  };

  // Handle permission request
  if (!permission) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Requesting camera permission...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Camera permission is required to scan barcodes</Text>
        <TouchableOpacity
          style={styles.permissionButton}
          onPress={requestPermission}
        >
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={onClose}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing="back"
        barcodeScannerSettings={{
          barcodeTypes: ['ean13'], // EAN-13 for ISBN
        }}
        onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
      />
      <View style={styles.overlay}>
        <Text style={styles.instructions}>
          Point your camera at a book barcode
        </Text>
      </View>
      <TouchableOpacity
        style={styles.closeButton}
        onPress={onClose}
      >
        <Text style={styles.closeButtonText}>Cancel</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  message: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  permissionButton: {
    backgroundColor: '#f6a800',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  permissionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  overlay: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  instructions: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  closeButton: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default ISBNScanner;
