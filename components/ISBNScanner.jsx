import { Camera } from 'expo-camera';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { searchByISBN } from '../lib/googleBooks';

const ISBNScanner = ({ onBookFound, onClose }) => {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const cameraRef = useRef(null);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleBarCodeScanned = async ({ data }) => {
    setScanned(true);
    // Validate ISBN (EAN-13 barcodes for books start with 978 or 979)
    if (/^97[89]\d{10}$/.test(data)) {
      try {
        const book = await searchByISBN(data);
        if (book) {
          onBookFound(book);
        } else {
          alert('No book found for this ISBN.');
        }
      } catch (e) {
        alert('Error fetching book data.');
      }
    } else {
      alert('Scanned code is not a valid ISBN.');
    }
    onClose();
  };

  if (hasPermission === null) {
    return <Text>Requesting camera permission...</Text>;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  console.log('Camera.Constants:', Camera.Constants);

  return (
    <View style={{ flex: 1 }}>
      <Camera
        ref={cameraRef}
        style={StyleSheet.absoluteFillObject}
        type='back'
        barCodeScannerSettings={{
          barCodeTypes: ['ean13'], // EAN-13 for ISBN
        }}
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
      />
      <TouchableOpacity
        style={{
          position: 'absolute',
          bottom: 40,
          alignSelf: 'center',
          backgroundColor: 'rgba(0,0,0,0.6)',
          padding: 12,
          borderRadius: 8,
        }}
        onPress={onClose}
      >
        <Text style={{ color: '#fff', fontSize: 16 }}>Cancel</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ISBNScanner;
