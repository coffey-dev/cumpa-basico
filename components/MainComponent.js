import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import * as Location from 'expo-location';
import ngeohash from 'ngeohash';



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

        // Convertir latitud y longitud a Geohash
        const geo = ngeohash.encode(coords.latitude, coords.longitude);
        setGeohash(geo);

        // Hacer la solicitud a Nominatim para obtener el display_name
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.latitude}&lon=${coords.longitude}`);
        const data = await response.json();

        // Dividir el display_name por comas y buscar el elemento que empieza con "Partido de" o "Ciudad Autónoma de Buenos Aires"
        const displayNameArray = data.display_name.split(',');
        let locationElement = displayNameArray.find(element => 
          element.trim().startsWith('Partido de') || 
          element.trim().startsWith('Ciudad Autónoma de Buenos Aires')
        );

        // Si se encuentra "Ciudad Autónoma de Buenos Aires", mostrar el elemento anterior
        if (locationElement && locationElement.trim() === 'Ciudad Autónoma de Buenos Aires') {
          const index = displayNameArray.indexOf(locationElement);
          if (index > 0) {
            locationElement = displayNameArray[index - 1].trim();
          }
        }

        // Si se encuentra "Partido de", eliminar "Partido de" y mostrar lo que sigue
        if (locationElement && locationElement.trim().startsWith('Partido de')) {
          locationElement = locationElement.replace('Partido de', '').trim();
        }

        // Si no se encuentra el elemento o no hay un elemento válido, mostrar "No disponible"
        if (!locationElement) {
          locationElement = 'No disponible';
        }

        // Convertir a mayúsculas conservando acentos
        setDisplayName(locationElement.toLocaleUpperCase('es-ES'));
      } catch (error) {
        console.log('Error al obtener ubicación', error);
        setErrorMsg('Error al obtener ubicación');
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