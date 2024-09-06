import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import * as Location from 'expo-location';
import ngeohash from 'ngeohash';
import { open } from '@op-engineering/op-sqlite';

const MainComponent = () => {
  const [location, setLocation] = useState(null);
  const [displayName, setDisplayName] = useState('');
  const [geohash, setGeohash] = useState('');
  const [errorMsg, setErrorMsg] = useState(null);
  const [dbResult, setDbResult] = useState([]);

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setErrorMsg('Permiso para acceder a la ubicación denegado');
          return;
        }

        let { coords } = await Location.getCurrentPositionAsync({});
        setLocation(coords);

        const geo = ngeohash.encode(coords.latitude, coords.longitude);
        setGeohash(geo);

        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.latitude}&lon=${coords.longitude}`);
        const data = await response.json();

        const displayNameArray = data.display_name.split(',');
        let locationElement = displayNameArray.find(element => 
          element.trim().startsWith('Partido de') || 
          element.trim().startsWith('Ciudad Autónoma de Buenos Aires')
        );

        if (locationElement && locationElement.trim() === 'Ciudad Autónoma de Buenos Aires') {
          const index = displayNameArray.indexOf(locationElement);
          if (index > 0) {
            locationElement = displayNameArray[index - 1].trim();
          }
        }

        if (locationElement && locationElement.trim().startsWith('Partido de')) {
          locationElement = locationElement.replace('Partido de', '').trim();
        }

        if (!locationElement) {
          locationElement = 'No disponible';
        }

        setDisplayName(locationElement.toLocaleUpperCase('es-ES'));

        // Conectar con la base de datos usando OP-SQLITE
        const db = await openDatabase({
          name: 'database_name',
          location: 'default',
          uri: 'libsql://prueba-gurudev.turso.io', // Usa tu URI de Turso
          token: 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3MjQyNTcyMTMsImlkIjoiMjMzMTYwOTktYzE3OS00MmNlLTk1NTAtMzZkY2M2ODIzNjMxIn0.jxHiOm0TFU4uYWlsthIpOEfabhqoyYL-0ICTQ_XCOBMQb9HJ_y6_39t-PG9Zv_pL7FEWtgW8M7-Td2mcK87QCA',
        });

        const result = await db.executeSql(`SELECT * FROM tu_tabla WHERE geohash = ?`, [geo]);
        setDbResult(result.rows);

      } catch (error) {
        console.log('Error al obtener ubicación o datos de la base de datos', error);
        setErrorMsg('Error al obtener ubicación o datos de la base de datos');
      }
    };

    fetchLocation();
  }, []);

  let text = 'Cargando...';
  if (errorMsg) {
    text = errorMsg;
  } else if (location) {
    text = `Estás en ${displayName}\nGeohash: ${geohash}`;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.text}>{text}</Text>
      {dbResult.length > 0 && (
        <View style={styles.dbResultContainer}>
          <Text style={styles.text}>Resultados de la base de datos:</Text>
          {dbResult.map((row, index) => (
            <Text key={index} style={styles.text}>{JSON.stringify(row)}</Text>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  dbResultContainer: {
    marginTop: 20,
  },
});

export default MainComponent;
